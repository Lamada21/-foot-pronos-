import { fetchPage, getText, parseMarketValue } from './client';
import { TEAM_TM_SLUGS, TEAM_TM_IDS, POSITION_MAP } from './config';
import db from '@/lib/db';

export interface ScrapedPlayer {
  name: string;
  position: string;
  number: number | null;
  nationality: string;
  birthDate: string;
  marketValue: string;
}

export interface ScrapedSquad {
  teamId: string;
  coach: string;
  players: ScrapedPlayer[];
}

/**
 * Scrape l'effectif d'une équipe depuis Transfermarkt
 * URL: /{club-slug}/kader/verein/{clubId}/saison_id/{year}
 */
export async function scrapeSquad(
  teamId: string,
  season: string = '2025'
): Promise<ScrapedSquad | null> {
  const tmSlug = TEAM_TM_SLUGS[teamId];
  const clubId = TEAM_TM_IDS[teamId];
  if (!tmSlug || !clubId) {
    console.warn(`[scraper] Pas de mapping pour l'équipe: ${teamId}`);
    return null;
  }

  const path = `/${tmSlug}/kader/verein/${clubId}/saison_id/${season}`;
  console.log(`[scraper] Scraping effectif: ${path}`);

  try {
    const $ = await fetchPage(path);

    // Récupérer l'entraîneur
    const coachEl = $('.trainer-name, [class*="trainer"] a, .profilname a, .coach a');
    // Aussi possible de trouver dans le profil du club
    const coachRows = $('table tbody tr').filter((_, tr) => {
      return $(tr).text().toLowerCase().includes('entraîneur') ||
             $(tr).text().toLowerCase().includes('coach') ||
             $(tr).text().toLowerCase().includes('trainer');
    });
    let coach = '';
    coachRows.each((_, row) => {
      const cells = $(row).find('td');
      if (cells.length >= 2) {
        coach = getText($, cells[1]);
      }
    });
    if (!coach) {
      coach = getText($, coachEl[0]);
    }
    // Fallback: chercher dans les infos du club
    if (!coach) {
      const infos = $('.data-header__club-info, .data-header__info');
      coach = infos.text().split('Entraîneur')[1]?.split('\n')[0]?.trim() || '';
    }

    // Scraper les joueurs - Transfermarkt utilise .responsive-table > .items
    const players: ScrapedPlayer[] = [];
    const $rows = $('.responsive-table .items tbody tr, .responsive-table table.items tbody tr, table.items tbody tr');

    $rows.each((_, row) => {
      const $row = $(row);
      const cols = $row.find('td');
      if (cols.length < 5) return;

      // Numéro de maillot
      const numText = getText($, $row.find('.rn_nummer, td:first-child'));
      const number = numText ? parseInt(numText, 10) : null;

      // Nom du joueur
      const nameEl = $row.find('.spielprofil_tooltip, a[href*="/spieler/"]');
      const name = getText($, nameEl[0]);

      if (!name) return;

      // Poste - souvent dans une colonne avec des icônes ou du texte
      const posEl = $row.find('td:nth-child(2), td:nth-child(3), td.position, td:contains("Gardien"), td:contains("Défenseur"), td:contains("Milieu"), td:contains("Attaquant")');
      let position = getText($, posEl[0]);
      const posCode = POSITION_MAP[position] || 'FWD';

      // Nationalité (via drapeau ou texte)
      const flagEl = $row.find('img.flaggen, [class*="flag"]');
      const nationality = flagEl.attr('alt') || flagEl.attr('title') || '';

      // Valeur marchande
      const mvEl = $row.find('.marktwert, td.rechts strong, td:last-child');
      const mvText = getText($, mvEl[0]);
      const marketValue = parseMarketValue(mvText);

      // Date de naissance/âge
      const ageEl = $row.find('td.zentriert:nth-child(3), td:nth-child(4)');
      const ageText = getText($, ageEl[0]);

      players.push({
        name,
        position: posCode,
        number: number && !isNaN(number) ? number : null,
        nationality,
        birthDate: ageText,
        marketValue,
      });
    });

    console.log(`[scraper] ${players.length} joueurs trouvés pour ${teamId}`);
    return { teamId, coach, players };
  } catch (err: any) {
    console.error(`[scraper] Erreur scraping ${teamId}: ${err.message}`);
    return null;
  }
}

/**
 * Met à jour la DB avec les données scrappées
 */
export function saveSquadToDb(squad: ScrapedSquad): void {
  // Mettre à jour l'entraîneur
  if (squad.coach) {
    db.prepare('UPDATE teams SET coach = ? WHERE id = ?').run(squad.coach, squad.teamId);
  }

  // Supprimer les anciens joueurs de cette équipe
  db.prepare('DELETE FROM players WHERE team_id = ?').run(squad.teamId);

  const insert = db.prepare(`
    INSERT INTO players (id, name, position, number, nationality, team_id, market_value)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((players: ScrapedPlayer[]) => {
    for (let i = 0; i < players.length; i++) {
      const p = players[i];
      const playerId = `${squad.teamId}-${p.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}`;
      insert.run(
        playerId,
        p.name,
        p.position,
        p.number || null,
        p.nationality,
        squad.teamId,
        p.marketValue
      );
    }
  });

  insertMany(squad.players);
  console.log(`[scraper] ${squad.players.length} joueurs enregistrés pour ${squad.teamId}`);
}

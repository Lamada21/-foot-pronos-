import { fetchPage, getText, parseMarketValue } from './client';
import { TEAM_TM_SLUGS, TEAM_TM_IDS, POSITION_MAP } from './config';
import db, { dbRun } from '@/lib/db';

export interface ScrapedPlayer {
  name: string;
  position: string;
  number: number | null;
  nationality: string;
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
    console.warn(`[scraper] Pas de mapping: ${teamId}`);
    return null;
  }

  const path = `/${tmSlug}/kader/verein/${clubId}/saison_id/${season}`;
  console.log(`[scraper] Scraping effectif: ${path}`);

  try {
    const $ = await fetchPage(path);

    // Récupérer l'entraîneur depuis les infos du club
    let coach = '';
    const bodyText = $('body').text();
    // Chercher "Entraîneur" ou "Trainer" dans le texte
    const coachMatch = bodyText.match(/(?:Entraîneur|Entraineur|Trainer)[^\n]*[.:]\s*([^\n]+)/i);
    if (coachMatch) {
      coach = coachMatch[1].trim();
    }

    // Scraper les joueurs depuis table.items
    const players: ScrapedPlayer[] = [];
    const $rows = $('table.items tbody tr');

    $rows.each((_, row) => {
      const $row = $(row);
      const cols = $row.find('td');
      if (cols.length < 9) return;

      // td[0]: Numéro de maillot
      const numText = getText($, cols[0]);
      const number = numText ? parseInt(numText, 10) : null;

      // td[3]: Nom du joueur
      const nameLink = $row.find('td.hauptlink a[href*="/spieler/"]');
      const name = getText($, nameLink[0]);
      if (!name) return;

      // td[4]: Poste
      const posText = getText($, cols[4]);
      const posCode = POSITION_MAP[posText] || 'FWD';

      // td[6]: Nationalité (drapeau)
      const flagImg = $row.find('td.zentriert img');
      const nationality = flagImg.attr('alt') || '';

      // td[8]: Valeur marchande
      const mvText = getText($, cols[8]);
      const marketValue = parseMarketValue(mvText);

      players.push({
        name,
        position: posCode,
        number: number && !isNaN(number) ? number : null,
        nationality,
        marketValue,
      });
    });

    console.log(`[scraper] ${players.length} joueurs trouvés pour ${teamId}`);
    return { teamId, coach, players };
  } catch (err: any) {
    console.error(`[scraper] Erreur ${teamId}: ${err.message}`);
    return null;
  }
}

/**
 * Met à jour la DB avec les données scrappées (compatible SQLite & Neon)
 */
export async function saveSquadToDb(squad: ScrapedSquad): Promise<void> {
  const isNeon = !!process.env.DATABASE_URL;

  if (isNeon) {
    // Neon: utiliser dbRun async
    if (squad.coach) {
      await dbRun('UPDATE teams SET coach = ? WHERE id = ?', squad.coach, squad.teamId);
    }
    await dbRun('DELETE FROM players WHERE team_id = ?', squad.teamId);

    for (const p of squad.players) {
      const playerId = `${squad.teamId}-${p.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}`;
      await dbRun(
        'INSERT INTO players (id, name, position, number, nationality, team_id, market_value) VALUES (?, ?, ?, ?, ?, ?, ?)',
        playerId, p.name, p.position, p.number || null, p.nationality, squad.teamId, p.marketValue
      );
    }
  } else {
    // SQLite: utiliser db.prepare (transactionnel)
    if (squad.coach) {
      db.prepare('UPDATE teams SET coach = ? WHERE id = ?').run(squad.coach, squad.teamId);
    }
    db.prepare('DELETE FROM players WHERE team_id = ?').run(squad.teamId);

    const insert = db.prepare(
      'INSERT INTO players (id, name, position, number, nationality, team_id, market_value) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    const insertMany = db.transaction((players: ScrapedPlayer[]) => {
      for (const p of players) {
        const playerId = `${squad.teamId}-${p.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}`;
        insert.run(playerId, p.name, p.position, p.number || null, p.nationality, squad.teamId, p.marketValue);
      }
    });
    insertMany(squad.players);
  }

  console.log(`[scraper] ${squad.players.length} joueurs enregistrés pour ${squad.teamId}`);
}

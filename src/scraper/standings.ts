import { fetchPage, getText } from './client';
import { LEAGUE_TM_SLUGS, LEAGUE_COMPETITION_IDS } from './config';
import db from '@/lib/db';

export interface ScrapedStanding {
  position: number;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  form: string;
}

/**
 * Scrape le classement d'une ligue depuis Transfermarkt
 * URL: /{league-slug}/tabelle/wettbewerb/{compId}/saison_id/{year}
 * 
 * Structure HTML actuelle (2025):
 * - Tableau principal: <table class="items">
 * - Lignes: <tbody> <tr>
 * - Équipe: <td class="no-border-links hauptlink"> <a href="/verein/...">Nom</a>
 * - Colonnes: # (position), Club, G (matchs), N (nuls), L (défaites), Buts (X:Y), +/- (diff), Pts (points)
 */
export async function scrapeStandings(leagueSlug: string, season: string = '2025'): Promise<ScrapedStanding[]> {
  const compId = LEAGUE_COMPETITION_IDS[leagueSlug];
  const tmSlug = LEAGUE_TM_SLUGS[leagueSlug];
  if (!compId || !tmSlug) {
    console.warn(`[scraper] Pas de mapping pour la ligue: ${leagueSlug}`);
    return [];
  }

  const path = `/${tmSlug}/tabelle/wettbewerb/${compId}/saison_id/${season}`;
  console.log(`[scraper] Scraping classement: ${path}`);

  let $: any;
  try {
    $ = await fetchPage(path);
  } catch (err: any) {
    console.error(`[scraper] Erreur HTTP scraping ${leagueSlug}: ${err.message}`);
    return [];
  }

  const standings: ScrapedStanding[] = [];

  // Sélecteur principal: table.items > tbody > tr
  const $rows = $('table.items tbody tr');
  console.log(`[scraper] ${$rows.length} lignes trouvées dans table.items`);

  $rows.each((_: number, row: any) => {
    const $row = $(row);
    const cols = $row.find('td');
    
    // Ignorer les lignes d'en-tête ou avec moins de 5 colonnes
    if (cols.length < 5) return;

    // Position: première colonne (contient un nombre, souvent avec un point ex: "1.")
    const posText = getText($, cols[0]).replace(/\.$/, '').trim();
    const position = parseInt(posText, 10);
    if (isNaN(position)) return;

    // Nom de l'équipe: dans <td class="no-border-links hauptlink">
    const teamTd = $row.find('td.no-border-links.hauptlink, td.hauptlink');
    const teamLink = teamTd.find('a[href*="/verein/"]');
    let teamName = getText($, teamLink[0]);
    
    // Fallback: chercher directement un lien équipe dans la rangée
    if (!teamName) {
      const fallbackLink = $row.find('a[href*="/verein/"]').first();
      teamName = getText($, fallbackLink);
    }
    if (!teamName) return;

    // Extraire les textes de toutes les colonnes pour trouver les stats
    const texts: string[] = [];
    cols.each((_: number, td: any) => {
      const t = $(td).text().trim().replace(/\s+/g, ' ');
      texts.push(t);
    });

    // Structure attendue: pos, club, matchs, victoires, nuls, défaites, buts, diff, points
    // Mais les colonnes exactes varient. On cherche les patterns numériques.
    
    let played = 0, won = 0, drawn = 0, lost = 0;
    let goalsFor = 0, goalsAgainst = 0, points = 0;
    let form = '';

    // Chercher le pattern "X:Y" pour les buts
    for (const txt of texts) {
      const goalMatch = txt.match(/^(\d+)\s*:\s*(\d+)$/);
      if (goalMatch) {
        goalsFor = parseInt(goalMatch[1], 10);
        goalsAgainst = parseInt(goalMatch[2], 10);
        break;
      }
    }

    // Collecter tous les nombres de la rangée (sauf la position)
    const numbers: number[] = [];
    for (let i = 1; i < cols.length; i++) {
      const num = parseInt(texts[i], 10);
      if (!isNaN(num) && num >= 0) {
        numbers.push(num);
      }
    }

    // La structure typique:
    // Position | Team | Matchs | Victoires | Nuls | Défaites | Buts(p:X:Y) | Diff | Points
    // donc les nombres sont: [matchs, victoires, nuls, défaites, diff, points]
    if (numbers.length >= 4) {
      played = numbers[0] || 0;
      // Certains tableaux ont G (matchs) puis V (victoires) sans N/D
      if (numbers.length >= 6) {
        won = numbers[1] || 0;
        drawn = numbers[2] || 0;
        lost = numbers[3] || 0;
      } else if (numbers.length >= 4) {
        // Si seulement 4 nombres: matchs, victoires, défaites, points
        // ou matchs, buts_pour, buts_contre, points
        won = numbers[1] || 0;
        lost = numbers[2] || 0;
      }
      points = numbers[numbers.length - 1]; // Dernier nombre = points
    }

    // Recherche de la forme (pattern WWDLW)
    for (const txt of texts) {
      // La forme peut être en texte ou en images/svg
      if (/^[WwDdLlNnSs\s\-]+$/.test(txt.trim())) {
        form = txt.trim().toUpperCase().replace(/[^WDL]/g, '');
        if (form.length >= 3) break;
      }
    }

    // Vérifier les SVG/icones de forme
    $row.find('.inline-table img[alt], img[class*="form"]').each((_: number, img: any) => {
      const alt = $(img).attr('alt') || '';
      if (alt === 'Sieg' || alt === 'Victory' || alt === 'Win' || alt === 'Gagné') form += 'W';
      else if (alt === 'Unentschieden' || alt === 'Draw' || alt === 'Nul') form += 'D';
      else if (alt === 'Niederlage' || alt === 'Loss' || alt === 'Defeat' || alt === 'Perdu') form += 'L';
    });

    const goalDiff = goalsFor - goalsAgainst;

    standings.push({
      position,
      teamName: teamName.trim(),
      played,
      won,
      drawn,
      lost,
      goalsFor,
      goalsAgainst,
      goalDiff,
      points,
      form: form.slice(0, 5),
    });
  });

  // Fallback: si l'extraction par position a échoué, essayer par lien équipe
  if (standings.length === 0) {
    console.log('[scraper] Tentative avec sélecteur alternatif (liens équipes)...');
    $('a[href*="/verein/"]').each((_: number, link: any) => {
      const $link = $(link);
      const name = getText($, link);
      if (!name) return;

      // Remonter jusqu'à la rangée la plus proche
      const row = $link.closest('tr');
      if (!row.length) return;

      const cols = row.find('td');
      const numbers: number[] = [];
      cols.each((_: number, td: any) => {
        const n = parseInt($(td).text().trim(), 10);
        if (!isNaN(n) && n >= 0 && n < 100) numbers.push(n);
      });

      const pos = numbers.length > 0 ? numbers[0] : 0;
      if (pos < 1 || pos > 30) return;

      const teamLink = row.find('td.no-border-links.hauptlink a, td.hauptlink a, a[href*="/verein/"]').first();
      const teamName = getText($, teamLink);

      if (teamName && !standings.some(s => s.teamName === teamName)) {
        standings.push({
          position: pos,
          teamName,
          played: numbers[1] || 0,
          won: numbers[2] || 0,
          drawn: numbers[3] || 0,
          lost: numbers[4] || 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDiff: 0,
          points: numbers[numbers.length - 1] || 0,
          form: '',
        });
      }
    });
  }

  console.log(`[scraper] ${standings.length} équipes trouvées pour ${leagueSlug}`);
  return standings;
}

/**
 * Met à jour la base de données avec les classements scrappés
 */
export function saveStandingsToDb(leagueId: string, standings: ScrapedStanding[]): void {
  // Récupérer le mapping équipe nom → id depuis la DB
  const teamRows = db.prepare('SELECT id, name FROM teams WHERE league_id = ?').all(leagueId) as { id: string; name: string }[];

  // Supprimer les anciens classements pour cette ligue
  db.prepare('DELETE FROM standings WHERE league_id = ?').run(leagueId);

  const insert = db.prepare(`
    INSERT INTO standings (id, league_id, team_id, position, played, won, drawn, lost, goals_for, goals_against, goal_difference, points, form)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((items: ScrapedStanding[]) => {
    for (const s of items) {
      // Trouver le team_id correspondant par similarité de nom
      const team = teamRows.find(t =>
        t.name.toLowerCase().includes(s.teamName.toLowerCase()) ||
        s.teamName.toLowerCase().includes(t.name.toLowerCase())
      );

      if (team) {
        insert.run(
          `${leagueId}-${s.position}`,
          leagueId,
          team.id,
          s.position,
          s.played,
          s.won,
          s.drawn,
          s.lost,
          s.goalsFor,
          s.goalsAgainst,
          s.goalDiff,
          s.points,
          s.form
        );
      } else {
        console.warn(`[scraper] Équipe non trouvée en DB: "${s.teamName}"`);
      }
    }
  });

  insertMany(standings);
  console.log(`[scraper] ${standings.length} classements enregistrés pour ${leagueId}`);
}

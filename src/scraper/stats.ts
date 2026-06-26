import { fetchPage, getText, parseMarketValue, type CheerioDoc } from './client';
import { LEAGUE_TM_SLUGS, LEAGUE_COMPETITION_IDS } from './config';
import { dbAll, dbRun } from '@/lib/db';

export interface ScrapedPlayerStat {
  name: string;
  teamName: string;
  goals: number;
  assists: number;
  appearances: number;
  marketValue: string;
  nationality: string;
}

/**
 * Sauvegarde les stats (buteurs + passeurs) dans la table players.
 * Match les joueurs par nom + équipe pour mettre à jour goals/assists/appearances.
 */
export async function saveStatsToDb(
  leagueId: string,
  topScorers: ScrapedPlayerStat[],
  topAssisters: ScrapedPlayerStat[]
): Promise<void> {
  // 1. Récupérer les équipes de la ligue
  const teams = await dbAll('SELECT id, name FROM teams WHERE league_id = ?', leagueId) as { id: string; name: string }[];
  if (teams.length === 0) {
    console.warn('[scraper] Aucune équipe trouvée pour la ligue');
    return;
  }

  // 2. Construire un mapping teamName → team_id
  const teamNameToId: Record<string, string> = {};
  for (const t of teams) {
    teamNameToId[t.name.toLowerCase()] = t.id;
  }

  // 3. Récupérer tous les joueurs des équipes de cette ligue
  const placeholders = teams.map(() => '?').join(',');
  const teamIds = teams.map(t => t.id);
  const allPlayers = await dbAll(
    `SELECT id, name, team_id FROM players WHERE team_id IN (${placeholders})`,
    ...teamIds
  ) as { id: string; name: string; team_id: string }[];

  // 4. Mapper les stats par joueur (nom + équipe → stats)
  const statsMap = new Map<string, { goals: number; assists: number; appearances: number }>();

  // Ajouter les buteurs
  for (const s of topScorers) {
    const key = `${s.name.toLowerCase()}|${(teamNameToId[s.teamName?.toLowerCase()] || s.teamName?.toLowerCase())}`;
    const existing = statsMap.get(key) || { goals: 0, assists: 0, appearances: 0 };
    existing.goals = Math.max(existing.goals, s.goals);
    existing.assists = Math.max(existing.assists, s.assists);
    existing.appearances = Math.max(existing.appearances, s.appearances);
    statsMap.set(key, existing);
  }

  // Ajouter les passeurs
  for (const s of topAssisters) {
    const key = `${s.name.toLowerCase()}|${(teamNameToId[s.teamName?.toLowerCase()] || s.teamName?.toLowerCase())}`;
    const existing = statsMap.get(key) || { goals: 0, assists: 0, appearances: 0 };
    existing.goals = Math.max(existing.goals, s.goals);
    existing.assists = Math.max(existing.assists, s.assists);
    existing.appearances = Math.max(existing.appearances, s.appearances);
    statsMap.set(key, existing);
  }

  // 5. Matcher avec les joueurs DB et mettre à jour
  let updated = 0;
  for (const player of allPlayers) {
    const key = `${player.name.toLowerCase()}|${player.team_id}`;
    const stats = statsMap.get(key);
    if (stats && (stats.goals > 0 || stats.assists > 0 || stats.appearances > 0)) {
      await dbRun(
        'UPDATE players SET goals = ?, assists = ?, appearances = ? WHERE id = ?',
        stats.goals, stats.assists, stats.appearances, player.id
      );
      updated++;
    }
  }

  console.log(`[scraper] Stats mises à jour pour ${updated}/${allPlayers.length} joueurs`);
}

/**
 * Scrape les meilleurs buteurs d'une ligue
 * URL: /{league-slug}/torschuetzenliste/wettbewerb/{compId}/saison_id/{year}
 */
export async function scrapeTopScorers(
  leagueSlug: string,
  season: string = '2025'
): Promise<ScrapedPlayerStat[]> {
  const compId = LEAGUE_COMPETITION_IDS[leagueSlug];
  const tmSlug = LEAGUE_TM_SLUGS[leagueSlug];
  if (!compId || !tmSlug) return [];

  const path = `/${tmSlug}/torschuetzenliste/wettbewerb/${compId}/saison_id/${season}`;
  console.log(`[scraper] Scraping buteurs: ${path}`);

  try {
    const $ = await fetchPage(path);
    return parseStatsTable($);
  } catch (err: any) {
    console.error(`[scraper] Erreur scraping buteurs ${leagueSlug}: ${err.message}`);
    return [];
  }
}

/**
 * Scrape les meilleurs passeurs d'une ligue
 * URL: /{league-slug}/vorlagenliste/wettbewerb/{compId}/saison_id/{year}
 */
export async function scrapeTopAssisters(
  leagueSlug: string,
  season: string = '2025'
): Promise<ScrapedPlayerStat[]> {
  const compId = LEAGUE_COMPETITION_IDS[leagueSlug];
  const tmSlug = LEAGUE_TM_SLUGS[leagueSlug];
  if (!compId || !tmSlug) return [];

  const path = `/${tmSlug}/vorlagenliste/wettbewerb/${compId}/saison_id/${season}`;
  console.log(`[scraper] Scraping passeurs: ${path}`);

  try {
    const $ = await fetchPage(path);
    return parseStatsTable($);
  } catch (err: any) {
    console.error(`[scraper] Erreur scraping passeurs ${leagueSlug}: ${err.message}`);
    return [];
  }
}

/**
 * Parse un tableau de stats Transfermarkt (buteurs ou passeurs)
 */
function parseStatsTable($: CheerioDoc): ScrapedPlayerStat[] {
  const players: ScrapedPlayerStat[] = [];

  const $rows = $('.responsive-table .items tbody tr, .responsive-table table.items tbody tr, table.items tbody tr');

  $rows.each((_, row) => {
    const $row = $(row);
    const cols = $row.find('td');
    if (cols.length < 4) return;

    // Nom du joueur
    const nameEl = $row.find('.spielprofil_tooltip, a[href*="/spieler/"]');
    const name = getText($, nameEl[0]);
    if (!name) return;

    // Équipe
    const teamEl = $row.find('.vereinprofil_tooltip, a[href*="/verein/"]');
    const teamName = getText($, teamEl[0]);

    // Statistiques numériques
    const numbers: number[] = [];
    cols.each((_, td) => {
      const n = parseInt($(td).text().trim(), 10);
      if (!isNaN(n)) numbers.push(n);
    });

    const goals = numbers.length > 0 ? numbers[0] : 0;
    const assists = numbers.length > 1 ? numbers[1] : 0;
    const appearances = numbers.length > 2 ? numbers[numbers.length - 1] : 0;

    // Valeur marchande
    const mvEl = $row.find('.marktwert');
    const marketValue = parseMarketValue(getText($, mvEl[0]));

    // Nationalité
    const flagEl = $row.find('img.flaggen, [class*="flag"]');
    const nationality = flagEl.attr('alt') || flagEl.attr('title') || '';

    players.push({ name, teamName, goals, assists, appearances, marketValue, nationality });
  });

  console.log(`[scraper] ${players.length} stats joueurs trouvées`);
  return players;
}

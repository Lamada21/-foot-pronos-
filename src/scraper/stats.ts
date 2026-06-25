import { fetchPage, getText, parseMarketValue, type CheerioDoc } from './client';
import { LEAGUE_TM_SLUGS, LEAGUE_COMPETITION_IDS } from './config';

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

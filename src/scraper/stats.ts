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
 * Match les joueurs par nom (case-insensitive) au sein de la ligue.
 * N'utilise PAS le teamName du scrap (trop fragile), seulement les noms de joueurs.
 */
export async function saveStatsToDb(
  leagueId: string,
  topScorers: ScrapedPlayerStat[],
  topAssisters: ScrapedPlayerStat[]
): Promise<void> {
  // 1. Récupérer les équipes de la ligue
  const teams = await dbAll('SELECT id FROM teams WHERE league_id = ?', leagueId) as { id: string }[];
  if (teams.length === 0) {
    console.warn('[scraper] Aucune équipe trouvée pour la ligue');
    return;
  }

  // 2. Récupérer tous les joueurs des équipes de cette ligue
  const placeholders = teams.map(() => '?').join(',');
  const teamIds = teams.map(t => t.id);
  const allPlayers = await dbAll(
    `SELECT id, name FROM players WHERE team_id IN (${placeholders})`,
    ...teamIds
  ) as { id: string; name: string }[];

  // 3. Construire un map nom → stats à partir des deux sources
  const statsByPlayerName = new Map<string, { goals: number; assists: number; appearances: number }>();

  for (const s of [...topScorers, ...topAssisters]) {
    const key = s.name.toLowerCase().trim();
    const existing = statsByPlayerName.get(key) || { goals: 0, assists: 0, appearances: 0 };
    existing.goals = Math.max(existing.goals, s.goals);
    existing.assists = Math.max(existing.assists, s.assists);
    existing.appearances = Math.max(existing.appearances, s.appearances);
    statsByPlayerName.set(key, existing);
  }

  // 4. Matcher par nom et mettre à jour
  let updated = 0;
  for (const player of allPlayers) {
    const key = player.name.toLowerCase().trim();
    const stats = statsByPlayerName.get(key);
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

  // Essayer d'abord avec saison, puis sans
  const paths = [
    `/${tmSlug}/torschuetzenliste/wettbewerb/${compId}/saison_id/${season}`,
    `/${tmSlug}/torschuetzenliste/wettbewerb/${compId}`,
  ];

  for (const path of paths) {
    console.log(`[scraper] Scraping buteurs: ${path}`);
    try {
      const $ = await fetchPage(path);
      const result = parseStatsTable($);
      if (result.length > 0) {
        console.log(`[scraper] ${result.length} buteurs trouvés`);
        return result;
      }
    } catch (err: any) {
      console.warn(`[scraper] Tentative échouée: ${err.message}`);
    }
  }

  console.error(`[scraper] Erreur scraping buteurs ${leagueSlug}: toutes les tentatives ont échoué`);
  return [];
}

/**
 * Scrape les meilleurs passeurs d'une ligue.
 * Note: la page vorlagenliste n'existe plus sur transfermarkt.fr.
 * On tente l'URL sans /saison_id/ au cas où, mais on accepte l'échec.
 */
export async function scrapeTopAssisters(
  leagueSlug: string,
  season: string = '2025'
): Promise<ScrapedPlayerStat[]> {
  const compId = LEAGUE_COMPETITION_IDS[leagueSlug];
  const tmSlug = LEAGUE_TM_SLUGS[leagueSlug];
  if (!compId || !tmSlug) return [];

  // Essayer sans /saison_id/ (la page avec saison_id retourne 404)
  const paths = [
    `/${tmSlug}/vorlagenliste/wettbewerb/${compId}`,
    `/${tmSlug}/vorlagenliste/wettbewerb/${compId}/plus/1`,
    `/${tmSlug}/vorlagenliste/wettbewerb/${compId}/saison_id/${season}`,
  ];

  for (const path of paths) {
    console.log(`[scraper] Scraping passeurs: ${path}`);
    try {
      const $ = await fetchPage(path);
      const result = parseStatsTable($);
      if (result.length > 0) {
        console.log(`[scraper] ${result.length} passeurs trouvés`);
        return result;
      }
    } catch (err: any) {
      console.warn(`[scraper] Tentative échouée: ${err.message}`);
    }
  }

  console.warn(`[scraper] Passeurs non disponibles pour ${leagueSlug} (page vorlagenliste inaccessible)`);
  return [];
}

/**
 * Parse un tableau de stats Transfermarkt (buteurs ou passeurs)
 */
function parseStatsTable($: CheerioDoc): ScrapedPlayerStat[] {
  const players: ScrapedPlayerStat[] = [];

  const $rows = $('table.items tbody tr');

  $rows.each((_, row) => {
    const $row = $(row);
    const cols = $row.find('td');
    if (cols.length < 10) return;

    // Nom du joueur: lien vers /spieler/
    const nameEl = $row.find('td.hauptlink a[href*="/spieler/"], a[href*="/spieler/"]');
    const name = getText($, nameEl[0] || $row.find('.spielprofil_tooltip')[0]);
    if (!name) return;

    // Équipe: chercher les liens vers les clubs dans la ligne
    let teamName = '';
    $row.find('a[href*="/startseite/verein/"], a[href*="/verein/"]').each((_, a) => {
      const t = $(a).text().trim();
      if (t && t.length > 2) teamName = t;
    });

    // td[8] = matchs joués, td[9] = buts (confirmé par debug HTML)
    const goals = parseInt(getText($, cols[9]), 10) || 0;
    const assists = 0; // Les passes ne sont pas sur cette page
    const appearances = parseInt(getText($, cols[8]), 10) || 0;

    // Valeur marchande
    const mvEl = $row.find('.marktwert');
    const marketValue = parseMarketValue(getText($, mvEl[0]));

    // Nationalité (drapeau) - td[2] contient généralement le drapeau
    const flagEl = $row.find('td.zentriert img[alt], img.flaggen');
    const nationality = flagEl.attr('alt') || flagEl.attr('title') || '';

    players.push({ name, teamName, goals, assists, appearances, marketValue, nationality });
  });

  console.log(`[scraper] ${players.length} stats joueurs extraites`);
  return players;
}

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

// ─── Fuzzy matching helpers ─────────────────────────────────────────────

/** Distance de Levenshtein entre deux chaînes */
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

/** Normalise un nom : supprime accents, tirets, espaces superflus */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // enlève accents
    .replace(/[^a-z0-9\s-]/g, '') // garde lettres, chiffres, espaces, tirets
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Similarité entre deux noms (0 = différent, 1 = identique).
 * Utilise Levenshtein normalisé par la longueur max.
 */
function nameSimilarity(name1: string, name2: string): number {
  const a = normalizeName(name1);
  const b = normalizeName(name2);
  if (a === b) return 1;
  if (a.length === 0 || b.length === 0) return 0;
  const dist = levenshtein(a, b);
  return 1 - dist / Math.max(a.length, b.length);
}

/**
 * Sauvegarde les stats (buteurs + passeurs) dans la table players.
 * Match les joueurs par nom : d'abord exact (case-insensitive), puis fuzzy (similarité > 0.8).
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

  // 3. Construire un map nom normalisé → stats à partir des deux sources
  const statsByNormName = new Map<string, { goals: number; assists: number; appearances: number; originalName: string }>();

  for (const s of [...topScorers, ...topAssisters]) {
    const key = normalizeName(s.name);
    if (!key) continue;
    const existing = statsByNormName.get(key) || { goals: 0, assists: 0, appearances: 0, originalName: s.name };
    existing.goals = Math.max(existing.goals, s.goals);
    existing.assists = Math.max(existing.assists, s.assists);
    existing.appearances = Math.max(existing.appearances, s.appearances);
    statsByNormName.set(key, existing);
  }

  // 4. Matcher chaque joueur DB : exact → fuzzy → rien
  let updated = 0;
  const SIMILARITY_THRESHOLD = 0.7; // 0.7 pour capturer les initiales (ex: "K. Mbappé" ≈ "Kylian Mbappé")

  for (const player of allPlayers) {
    const normDbName = normalizeName(player.name);
    if (!normDbName) continue;

    // 4a. Tentative de match exact (nom normalisé)
    let match = statsByNormName.get(normDbName);

    // 4b. Si pas de match exact, essayer fuzzy sur tous les noms disponibles
    if (!match) {
      let bestScore = 0;
      let bestKey = '';
      for (const [scrapedNorm, scrapedStats] of statsByNormName) {
        const score = nameSimilarity(normDbName, scrapedNorm);
        if (score > bestScore) {
          bestScore = score;
          bestKey = scrapedNorm;
        }
      }
      if (bestScore >= SIMILARITY_THRESHOLD && bestKey) {
        match = statsByNormName.get(bestKey);
        if (match) {
          console.log(`[scraper] Fuzzy match: "${player.name}" ≈ "${match.originalName}" (score: ${bestScore.toFixed(2)})`);
        }
      }
    }

    // 4c. Appliquer les stats si match trouvé
    if (match && (match.goals > 0 || match.assists > 0 || match.appearances > 0)) {
      await dbRun(
        'UPDATE players SET goals = ?, assists = ?, appearances = ? WHERE id = ?',
        match.goals, match.assists, match.appearances, player.id
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

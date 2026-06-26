import { scrapeStandings, saveStandingsToDb, ScrapedStanding } from './standings';
import { scrapeSquad, saveSquadToDb } from './squads';
import { scrapeTopScorers, scrapeTopAssisters, saveStatsToDb, ScrapedPlayerStat } from './stats';
import { scrapeTransfers, ScrapedTransfer } from './transfers';
import db from '@/lib/db';

export interface ScrapeResults {
  league: string;
  standings: ScrapedStanding[];
  squads: { teamId: string; players: number; coach: string }[];
  topScorers: ScrapedPlayerStat[];
  topAssisters: ScrapedPlayerStat[];
  transfers: ScrapedTransfer[];
  errors: string[];
}

/**
 * Scrape toutes les données pour une ligue : classement, effectifs, stats, transferts
 */
export async function scrapeLeague(
  leagueSlug: string,
  season: string = '2025'
): Promise<ScrapeResults> {
  const errors: string[] = [];
  const leagueRow = db.prepare('SELECT id, name FROM leagues WHERE slug = ?').get(leagueSlug) as { id: string; name: string } | undefined;

  if (!leagueRow) {
    return {
      league: leagueSlug,
      standings: [],
      squads: [],
      topScorers: [],
      topAssisters: [],
      transfers: [],
      errors: [`Ligue "${leagueSlug}" non trouvée en base de données`],
    };
  }

  // 1. Classement
  console.log(`\n========== SCRAPING ${leagueRow.name} ==========\n`);
  const standings = await scrapeStandings(leagueSlug, season);
  if (standings.length > 0) {
    saveStandingsToDb(leagueRow.id, standings);
  } else {
    errors.push(`Classement non trouvé pour ${leagueRow.name}`);
  }

  // 2. Effectifs des équipes
  const squadResults: { teamId: string; players: number; coach: string }[] = [];
  const teams = db.prepare('SELECT id, name FROM teams WHERE league_id = ?').all(leagueRow.id) as { id: string; name: string }[];

  for (const team of teams) {
    console.log(`\n--- Scraping effectif: ${team.name} ---`);
    const squad = await scrapeSquad(team.id, season);
    if (squad && squad.players.length > 0) {
      await saveSquadToDb(squad);
      squadResults.push({
        teamId: team.id,
        players: squad.players.length,
        coach: squad.coach,
      });
    } else {
      errors.push(`Effectif non trouvé pour ${team.name}`);
    }
    // Petite pause pour éviter le rate limiting
    await new Promise(r => setTimeout(r, 500));
  }

  // 3. Meilleurs buteurs
  console.log(`\n--- Scraping buteurs: ${leagueRow.name} ---`);
  const topScorers = await scrapeTopScorers(leagueSlug, season);

  // 4. Meilleurs passeurs
  console.log(`\n--- Scraping passeurs: ${leagueRow.name} ---`);
  const topAssisters = await scrapeTopAssisters(leagueSlug, season);

  // Sauvegarder les stats dans la DB (buts + passes)
  console.log(`\n--- Sauvegarde stats joueurs: ${leagueRow.name} ---`);
  await saveStatsToDb(leagueRow.id, topScorers, topAssisters);

  // 5. Transferts
  console.log(`\n--- Scraping transferts: ${leagueRow.name} ---`);
  const transfers = await scrapeTransfers(leagueSlug, season);

  console.log(`\n========== ${leagueRow.name} TERMINÉ ==========\n`);

  return {
    league: leagueRow.name,
    standings,
    squads: squadResults,
    topScorers,
    topAssisters,
    transfers,
    errors,
  };
}

/**
 * Scrape toutes les ligues configurées
 */
export async function scrapeAllLeagues(season: string = '2025'): Promise<ScrapeResults[]> {
  const leagues = [
    'ligue1',
    'ligue2',
    'premier-league',
    'la-liga',
    'bundesliga',
    'serie-a',
  ];

  const results: ScrapeResults[] = [];
  for (const slug of leagues) {
    const result = await scrapeLeague(slug, season);
    results.push(result);
    // Pause entre les ligues
    await new Promise(r => setTimeout(r, 1000));
  }

  return results;
}

/**
 * Met à jour uniquement les classements pour toutes les ligues (rapide)
 */
export async function refreshStandings(season: string = '2025'): Promise<void> {
  const leagues = db.prepare('SELECT id, slug FROM leagues').all() as { id: string; slug: string }[];

  for (const league of leagues) {
    console.log(`\n--- Classement: ${league.slug} ---`);
    const standings = await scrapeStandings(league.slug, season);
    if (standings.length > 0) {
      saveStandingsToDb(league.id, standings);
    }
    await new Promise(r => setTimeout(r, 1000));
  }
}

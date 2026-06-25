#!/usr/bin/env tsx
/**
 * Script de scraping Transfermarkt
 * Usage: npx tsx src/scripts/scrape.ts [--standings] [--squads] [--stats] [--transfers] [--league ligue1|premier-league|la-liga]
 *
 * Exemples:
 *   npx tsx src/scripts/scrape.ts                     # Scrape tout
 *   npx tsx src/scripts/scrape.ts --standings          # Classements seulement
 *   npx tsx src/scripts/scrape.ts --league ligue1      # Ligue 1 seulement
 *   npx tsx src/scripts/scrape.ts --league premier-league --squads  # Effectifs Premier League
 */

import { scrapeAllLeagues, scrapeLeague, refreshStandings } from '../scraper';
import { scrapeSquad, saveSquadToDb } from '../scraper/squads';
import db from '../lib/db';

async function main() {
  const args = process.argv.slice(2);
  const flags = {
    standings: args.includes('--standings'),
    squads: args.includes('--squads'),
    stats: args.includes('--stats'),
    transfers: args.includes('--transfers'),
    all: !args.some(a => a.startsWith('--')),
  };

  const leagueIndex = args.indexOf('--league');
  const leagueSlug = leagueIndex >= 0 ? args[leagueIndex + 1] : null;

  // Définir un timeout global
  const timeout = setTimeout(() => {
    console.error('\n⚠️  Timeout: Le scraping prend trop de temps.');
    console.error('    Transfermarkt peut bloquer les requêtes.');
    console.error('    Essayez avec --standings (rapide) ou --league ligue1 (ciblé).');
    process.exit(1);
  }, 120000); // 2 minutes timeout

  try {
    console.log('╔════════════════════════════════════════╗');
    console.log('║    SCRAPER TRANSFERMARKT.FR             ║');
    console.log('╚════════════════════════════════════════╝');
    console.log('');

    if (flags.standings) {
      console.log('📊 Mise à jour des classements uniquement...');
      await refreshStandings();
      console.log('✅ Classements mis à jour !');
    } else if (leagueSlug && flags.squads) {
      console.log(`👥 Scraping des effectifs pour ${leagueSlug}...`);
      const teams = db.prepare('SELECT id, name FROM teams WHERE league_id = (SELECT id FROM leagues WHERE slug = ?)').all(leagueSlug) as { id: string; name: string }[];
      for (const team of teams) {
        console.log(`\n--- ${team.name} ---`);
        const squad = await scrapeSquad(team.id, '2025');
        if (squad) {
          saveSquadToDb(squad);
          console.log(`✅ ${squad.players.length} joueurs, coach: ${squad.coach || 'N/A'}`);
        }
        await new Promise(r => setTimeout(r, 1000));
      }
    } else if (leagueSlug) {
      const result = await scrapeLeague(leagueSlug);
      console.log(`\n✅ ${result.league} terminé`);
      if (result.errors.length > 0) {
        console.log(`\n⚠️  ${result.errors.length} erreurs:`);
        result.errors.forEach(e => console.log(`   - ${e}`));
      }
      console.log(`\n📊 ${result.standings.length} équipes au classement`);
      console.log(`👥 ${result.squads.length} effectifs scrappés`);
      console.log(`⚽ ${result.topScorers.length} buteurs`);

      // Afficher le top 5 des buteurs s'il y en a
      if (result.topScorers.length > 0) {
        console.log('\n🏆 Top 5 buteurs:');
        result.topScorers.slice(0, 5).forEach((p, i) => {
          console.log(`   ${i + 1}. ${p.name} (${p.teamName}) - ${p.goals} buts`);
        });
      }
    } else {
      console.log('🔄 Scraping complet de toutes les ligues...');
      const results = await scrapeAllLeagues();
      console.log('\n═══════════════════════════════════════');
      console.log('📋 RÉSULTATS FINALS');
      console.log('═══════════════════════════════════════');
      for (const r of results) {
        console.log(`\n🏆 ${r.league}:`);
        console.log(`   📊 ${r.standings.length} classements`);
        console.log(`   👥 ${r.squads.length} effectifs`);
        console.log(`   ⚽ ${r.topScorers.length} buteurs`);
        console.log(`   🎯 ${r.topAssisters.length} passeurs`);
        console.log(`   🔄 ${r.transfers.length} transferts`);
        if (r.errors.length > 0) {
          console.log(`   ⚠️  ${r.errors.length} erreurs`);
        }
      }
    }
  } catch (err: any) {
    console.error(`\n❌ Erreur: ${err.message}`);
    console.error(err.stack);
  } finally {
    clearTimeout(timeout);
  }
}

main();

import { NextRequest, NextResponse } from 'next/server';
import { scrapeAllLeagues, scrapeLeague, refreshStandings } from '@/scraper';

/**
 * GET /api/scrape?league=ligue1&mode=full
 * 
 * Query params:
 *   - league: slug de la ligue (ligue1, premier-league, la-liga) — optionnel, défaut = toutes
 *   - mode: "full" | "standings" — optionnel, défaut = "full"
 *   - season: saison (ex: "2025") — optionnel, défaut = "2025"
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const league = searchParams.get('league');
  const mode = searchParams.get('mode') || 'full';
  const season = searchParams.get('season') || '2025';

  try {
    if (mode === 'standings') {
      // Mode rapide : seulement les classements
      await refreshStandings(season);
      return NextResponse.json({
        success: true,
        message: 'Classements mis à jour avec succès',
        mode: 'standings',
      });
    }

    if (league) {
      // Une seule ligue spécifique
      const result = await scrapeLeague(league, season);
      return NextResponse.json({
        success: true,
        league: result.league,
        standings: result.standings.length,
        squads: result.squads.length,
        topScorers: result.topScorers.length,
        topAssisters: result.topAssisters.length,
        transfers: result.transfers.length,
        errors: result.errors,
      });
    }

    // Toutes les ligues
    const results = await scrapeAllLeagues(season);
    return NextResponse.json({
      success: true,
      leagues: results.map(r => ({
        name: r.league,
        standings: r.standings.length,
        squads: r.squads.length,
        topScorers: r.topScorers.length,
        topAssisters: r.topAssisters.length,
        transfers: r.transfers.length,
        errors: r.errors,
      })),
    });
  } catch (err: any) {
    console.error('[API scrape] Erreur:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

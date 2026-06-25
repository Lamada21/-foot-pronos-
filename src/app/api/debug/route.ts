import { NextResponse } from 'next/server';
import { dbAll } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const info: Record<string, any> = {
    env: {
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      isVercel: !!process.env.VERCEL,
      nodeEnv: process.env.NODE_ENV,
    },
    database: {},
  };

  try {
    // Check tables
    const tables = await dbAll(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
    );
    info.database.tables = tables.map((t: any) => t.table_name);

    // Check leagues
    const leagues = await dbAll('SELECT id, name, slug FROM leagues');
    info.database.leagues_count = leagues.length;
    info.database.leagues = leagues.map((l: any) => ({ id: l.id, name: l.name, slug: l.slug }));

    // Check teams
    const teams = await dbAll('SELECT COUNT(*) as count FROM teams');
    info.database.teams_count = teams[0]?.count || 0;

    // Check standings
    const standings = await dbAll('SELECT COUNT(*) as count FROM standings');
    info.database.standings_count = standings[0]?.count || 0;

    // Check players
    const players = await dbAll('SELECT COUNT(*) as count FROM players');
    info.database.players_count = players[0]?.count || 0;

    // Try a specific query for Ligue 1 standings
    const ligue1 = await dbAll(
      `SELECT s.position, t.name, s.points 
       FROM standings s JOIN teams t ON s.team_id = t.id 
       WHERE s.league_id = 'ligue1' 
       ORDER BY s.position LIMIT 3`
    );
    info.database.ligue1_sample = ligue1;

  } catch (e: any) {
    info.error = e.message;
    info.errorStack = e.stack?.split('\n').slice(0, 5).join('\n');
  }

  return NextResponse.json(info);
}

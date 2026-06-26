import { NextResponse } from 'next/server';
import { dbExec } from '@/lib/db';

const IS_NEON = !!process.env.DATABASE_URL;

async function runNeonSeed() {
  // ── Créer les tables ──
  await dbExec(`CREATE TABLE IF NOT EXISTS leagues (id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, country TEXT NOT NULL, flag TEXT NOT NULL, season TEXT NOT NULL)`);
  await dbExec(`CREATE TABLE IF NOT EXISTS teams (id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL, short_name TEXT, country TEXT, flag TEXT, league_id TEXT NOT NULL, stadium TEXT, capacity INTEGER, coach TEXT, budget REAL, founded_year INTEGER, market_value TEXT, color TEXT)`);
  await dbExec(`CREATE TABLE IF NOT EXISTS players (id TEXT PRIMARY KEY, name TEXT NOT NULL, position TEXT NOT NULL, number INTEGER, nationality TEXT, flag TEXT, team_id TEXT NOT NULL, market_value TEXT, goals INTEGER DEFAULT 0, assists INTEGER DEFAULT 0, appearances INTEGER DEFAULT 0, rating REAL)`);
  await dbExec(`CREATE TABLE IF NOT EXISTS matches (id TEXT PRIMARY KEY, league_id TEXT NOT NULL, home_team_id TEXT NOT NULL, away_team_id TEXT NOT NULL, date TEXT NOT NULL, time TEXT, round TEXT, venue TEXT, status TEXT DEFAULT 'upcoming', home_score INTEGER, away_score INTEGER, home_formation TEXT, away_formation TEXT)`);
  await dbExec(`CREATE TABLE IF NOT EXISTS standings (id TEXT PRIMARY KEY, league_id TEXT NOT NULL, team_id TEXT NOT NULL, position INTEGER NOT NULL, played INTEGER DEFAULT 0, won INTEGER DEFAULT 0, drawn INTEGER DEFAULT 0, lost INTEGER DEFAULT 0, goals_for INTEGER DEFAULT 0, goals_against INTEGER DEFAULT 0, goal_difference INTEGER DEFAULT 0, points INTEGER DEFAULT 0, form TEXT)`);
  await dbExec(`CREATE TABLE IF NOT EXISTS predictions (id TEXT PRIMARY KEY, match_id TEXT NOT NULL, prediction_type TEXT NOT NULL, confidence REAL NOT NULL, odds REAL, reasoning TEXT, btts TEXT, btts_confidence REAL, over_under TEXT, over_under_confidence REAL, created_at TEXT)`);
  await dbExec(`CREATE TABLE IF NOT EXISTS transfers (id TEXT PRIMARY KEY, player_id TEXT NOT NULL, from_team_id TEXT, to_team_id TEXT NOT NULL, date TEXT NOT NULL, fee TEXT, type TEXT NOT NULL, season TEXT NOT NULL)`);
  await dbExec(`CREATE TABLE IF NOT EXISTS historical_standings (id TEXT PRIMARY KEY, team_id TEXT NOT NULL, league_id TEXT NOT NULL, season TEXT NOT NULL, position INTEGER NOT NULL, points INTEGER DEFAULT 0)`);

  // ── Vider les tables (DROP + RECREATE pour repartir de zéro) ──
  for (const table of ['players', 'standings', 'matches', 'predictions', 'transfers', 'historical_standings', 'teams', 'leagues']) {
    await dbExec(`DROP TABLE IF EXISTS ${table} CASCADE`);
  }

  // ── Re-créer les tables ──
  await dbExec(`CREATE TABLE IF NOT EXISTS leagues (id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, country TEXT NOT NULL, flag TEXT NOT NULL, season TEXT NOT NULL)`);
  await dbExec(`CREATE TABLE IF NOT EXISTS teams (id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL, short_name TEXT, country TEXT, flag TEXT, league_id TEXT NOT NULL, stadium TEXT, capacity INTEGER, coach TEXT, budget REAL, founded_year INTEGER, market_value TEXT, color TEXT)`);
  await dbExec(`CREATE TABLE IF NOT EXISTS players (id TEXT PRIMARY KEY, name TEXT NOT NULL, position TEXT NOT NULL, number INTEGER, nationality TEXT, flag TEXT, team_id TEXT NOT NULL, market_value TEXT, goals INTEGER DEFAULT 0, assists INTEGER DEFAULT 0, appearances INTEGER DEFAULT 0, rating REAL)`);
  await dbExec(`CREATE TABLE IF NOT EXISTS standings (id TEXT PRIMARY KEY, league_id TEXT NOT NULL, team_id TEXT NOT NULL, position INTEGER NOT NULL, played INTEGER DEFAULT 0, won INTEGER DEFAULT 0, drawn INTEGER DEFAULT 0, lost INTEGER DEFAULT 0, goals_for INTEGER DEFAULT 0, goals_against INTEGER DEFAULT 0, goal_difference INTEGER DEFAULT 0, points INTEGER DEFAULT 0, form TEXT)`);
  await dbExec(`CREATE TABLE IF NOT EXISTS historical_standings (id TEXT PRIMARY KEY, team_id TEXT NOT NULL, league_id TEXT NOT NULL, season TEXT NOT NULL, position INTEGER NOT NULL, points INTEGER DEFAULT 0)`);

  // ── Insérer les ligues ──
  await dbExec(`INSERT INTO leagues (id, name, slug, country, flag, season) VALUES
    ('ligue1', 'Ligue 1 McDonald''s', 'ligue1', 'France', '🇫🇷', '2025-2026'),
    ('ligue2', 'Ligue 2 BKT', 'ligue2', 'France', '🇫🇷', '2025-2026'),
    ('premier-league', 'Premier League', 'premier-league', 'Angleterre', '🇬🇧', '2025-2026'),
    ('la-liga', 'La Liga EA Sports', 'la-liga', 'Espagne', '🇪🇸', '2025-2026'),
    ('bundesliga', 'Bundesliga', 'bundesliga', 'Allemagne', '🇩🇪', '2025-2026'),
    ('serie-a', 'Serie A', 'serie-a', 'Italie', '🇮🇹', '2025-2026')
  `);

  // ── Insérer les équipes ──
  await dbExec(`INSERT INTO teams (id, name, slug, short_name, country, flag, league_id, stadium, capacity, coach, budget, founded_year, market_value, color) VALUES
    ('psg', 'Paris Saint-Germain', 'psg', 'PSG', 'France', '🇫🇷', 'ligue1', 'Parc des Princes', 47929, 'Luis Enrique', 700, 1970, '€1.2B', '#004170'),
    ('marseille', 'Olympique de Marseille', 'marseille', 'OM', 'France', '🇫🇷', 'ligue1', 'Orange Vélodrome', 67394, 'Roberto De Zerbi', 250, 1899, '€480M', '#2FAEE0'),
    ('monaco', 'AS Monaco', 'monaco', 'ASM', 'France', '🇲🇨', 'ligue1', 'Stade Louis-II', 18523, 'Adi Hütter', 200, 1924, '€420M', '#E63E32'),
    ('lyon', 'Olympique Lyonnais', 'lyon', 'OL', 'France', '🇫🇷', 'ligue1', 'Groupama Stadium', 59186, 'Paulo Fonseca', 180, 1950, '€380M', '#1D2C6B'),
    ('lille', 'LOSC Lille', 'lille', 'LOSC', 'France', '🇫🇷', 'ligue1', 'Stade Pierre-Mauroy', 50186, 'Bruno Genesio', 150, 1944, '€320M', '#E60000'),
    ('mancity', 'Manchester City', 'manchester-city', 'MCI', 'Angleterre', '🇬🇧', 'premier-league', 'Etihad Stadium', 53400, 'Pep Guardiola', 800, 1880, '€1.3B', '#6CABDD'),
    ('arsenal', 'Arsenal FC', 'arsenal', 'ARS', 'Angleterre', '🇬🇧', 'premier-league', 'Emirates Stadium', 60704, 'Mikel Arteta', 600, 1886, '€1.1B', '#EF0107'),
    ('liverpool', 'Liverpool FC', 'liverpool', 'LIV', 'Angleterre', '🇬🇧', 'premier-league', 'Anfield', 61376, 'Arne Slot', 650, 1892, '€1.0B', '#C8102E'),
    ('realmadrid', 'Real Madrid CF', 'real-madrid', 'RMA', 'Espagne', '🇪🇸', 'la-liga', 'Santiago Bernabéu', 81044, 'Carlo Ancelotti', 900, 1902, '€1.4B', '#FEBE10'),
    ('barcelona', 'FC Barcelona', 'barcelona', 'FCB', 'Espagne', '🇪🇸', 'la-liga', 'Spotify Camp Nou', 99354, 'Hansi Flick', 600, 1899, '€980M', '#A50044'),
    ('bayern', 'FC Bayern München', 'bayern-munich', 'FCB', 'Allemagne', '🇩🇪', 'bundesliga', 'Allianz Arena', 75024, 'Vincent Kompany', 800, 1900, '€1.1B', '#DC052D'),
    ('dortmund', 'Borussia Dortmund', 'borussia-dortmund', 'BVB', 'Allemagne', '🇩🇪', 'bundesliga', 'Signal Iduna Park', 81365, 'Nuri Sahin', 500, 1909, '€620M', '#FDE100'),
    ('inter', 'FC Internazionale Milano', 'inter-milan', 'INT', 'Italie', '🇮🇹', 'serie-a', 'San Siro', 75923, 'Simone Inzaghi', 600, 1908, '€780M', '#010E80'),
    ('acmilan', 'AC Milan', 'ac-milan', 'ACM', 'Italie', '🇮🇹', 'serie-a', 'San Siro', 75923, 'Sérgio Conceição', 500, 1899, '€650M', '#E3052A'),
    ('metz', 'FC Metz', 'fc-metz', 'FCM', 'France', '🇫🇷', 'ligue2', 'Stade Saint-Symphorien', 28786, 'Stéphane Le Mignan', 40, 1932, '€45M', '#800000'),
    ('parisfc', 'Paris FC', 'paris-fc', 'PFC', 'France', '🇫🇷', 'ligue2', 'Stade Charléty', 20000, 'Stéphane Gilli', 35, 1969, '€38M', '#003764'),
    ('lorient', 'FC Lorient', 'fc-lorient', 'FCL', 'France', '🇫🇷', 'ligue2', 'Stade du Moustoir', 18910, 'Olivier Pantaloni', 50, 1926, '€55M', '#FF6600'),
    ('caen', 'SM Caen', 'sm-caen', 'SMC', 'France', '🇫🇷', 'ligue2', 'Stade Michel d''Ornano', 21000, 'Nicolas Seube', 25, 1913, '€25M', '#003E7E'),
    ('bastia', 'SC Bastia', 'sc-bastia', 'SCB', 'France', '🇫🇷', 'ligue2', 'Stade Armand-Cesari', 16500, 'Benoît Tavenot', 20, 1905, '€22M', '#003D7A'),
    ('annecy', 'FC Annecy', 'fc-annecy', 'FCA', 'France', '🇫🇷', 'ligue2', 'Parc des Sports d''Annecy', 15660, 'Laurent Guyot', 18, 1927, '€18M', '#B31B1B'),
    ('amiens', 'Amiens SC', 'amiens-sc', 'ASC', 'France', '🇫🇷', 'ligue2', 'Stade de la Licorne', 13000, 'Omar Daf', 20, 1901, '€20M', '#9F9F9F'),
    ('redstar', 'Red Star FC', 'red-star', 'RSFC', 'France', '🇫🇷', 'ligue2', 'Stade Bauer', 10000, 'Grégory Poirier', 15, 1897, '€15M', '#008036')
  `);

  // ── Insérer les classements ──
  await dbExec(`INSERT INTO standings (id, league_id, team_id, position, played, won, drawn, lost, goals_for, goals_against, goal_difference, points, form) VALUES
    ('ligue1-1', 'ligue1', 'psg', 1, 24, 18, 4, 2, 62, 22, 40, 58, 'WWWWD'),
    ('ligue1-2', 'ligue1', 'marseille', 2, 24, 15, 5, 4, 48, 28, 20, 50, 'WWLDW'),
    ('pl-1', 'premier-league', 'liverpool', 1, 26, 19, 5, 2, 62, 24, 38, 62, 'WWWDW'),
    ('pl-2', 'premier-league', 'mancity', 2, 26, 18, 5, 3, 60, 22, 38, 59, 'WDWLW'),
    ('laliga-1', 'la-liga', 'realmadrid', 1, 25, 19, 4, 2, 58, 18, 40, 61, 'WWWWL'),
    ('laliga-2', 'la-liga', 'barcelona', 2, 25, 17, 5, 3, 60, 24, 36, 56, 'WWLWW'),
    ('buli-1', 'bundesliga', 'bayern', 1, 23, 18, 3, 2, 65, 20, 45, 57, 'WWWDL'),
    ('buli-2', 'bundesliga', 'dortmund', 3, 23, 13, 5, 5, 48, 30, 18, 44, 'LWWWD'),
    ('serie-1', 'serie-a', 'inter', 1, 25, 19, 4, 2, 58, 18, 40, 61, 'WWWDW'),
    ('serie-2', 'serie-a', 'acmilan', 3, 25, 15, 6, 4, 48, 26, 22, 51, 'WLWWL'),
    ('ligue2-1', 'ligue2', 'metz', 1, 24, 15, 5, 4, 42, 22, 20, 50, 'WWLDW'),
    ('ligue2-2', 'ligue2', 'lorient', 2, 24, 14, 6, 4, 40, 24, 16, 48, 'WDLWW'),
    ('ligue2-3', 'ligue2', 'parisfc', 3, 24, 13, 7, 4, 38, 22, 16, 46, 'WDWWL'),
    ('ligue2-4', 'ligue2', 'caen', 4, 24, 12, 5, 7, 35, 28, 7, 41, 'LWWWD'),
    ('ligue2-5', 'ligue2', 'bastia', 5, 24, 10, 8, 6, 32, 26, 6, 38, 'DWLWW'),
    ('ligue2-6', 'ligue2', 'annecy', 6, 24, 9, 6, 9, 30, 32, -2, 33, 'LWDLW'),
    ('ligue2-7', 'ligue2', 'amiens', 7, 24, 8, 5, 11, 28, 34, -6, 29, 'WLLWD'),
    ('ligue2-8', 'ligue2', 'redstar', 8, 24, 7, 6, 11, 26, 36, -10, 27, 'LDLWW')
  `);
}

export async function GET(request: Request) {
  // Sécurité : nécessite ?confirm=yes pour éviter les appels accidentels
  const { searchParams } = new URL(request.url);
  if (searchParams.get('confirm') !== 'yes') {
    return NextResponse.json({
      success: false,
      message: 'Confirmation requise. Ajoute ?confirm=yes à l\'URL pour exécuter le seed.',
      hint: IS_NEON ? 'Va sur /api/seed?confirm=yes pour initialiser Neon' : '',
    });
  }

  try {
    if (IS_NEON) {
      await runNeonSeed();
      return NextResponse.json({ success: true, message: '✅ Base Neon initialisée avec 6 ligues, 22 équipes et les classements !' });
    } else {
      const { seedDatabase } = await import('@/db/seed');
      seedDatabase();
      return NextResponse.json({ success: true, message: 'Base SQLite initialisée avec succès !' });
    }
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors du seed', error: String(error) },
      { status: 500 }
    );
  }
}

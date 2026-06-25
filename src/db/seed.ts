import db from '@/lib/db';

export function seedDatabase() {
  // ── Créer les tables si elles n'existent pas (sans FOREIGN KEY pour éviter les erreurs SQLite) ──
  db.exec(`CREATE TABLE IF NOT EXISTS leagues (id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, country TEXT NOT NULL, flag TEXT NOT NULL, season TEXT NOT NULL)`);
  db.exec(`CREATE TABLE IF NOT EXISTS teams (id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL, short_name TEXT, country TEXT, flag TEXT, league_id TEXT NOT NULL, stadium TEXT, capacity INTEGER, coach TEXT, budget REAL, founded_year INTEGER, market_value TEXT, color TEXT)`);
  db.exec(`CREATE TABLE IF NOT EXISTS players (id TEXT PRIMARY KEY, name TEXT NOT NULL, position TEXT NOT NULL, number INTEGER, nationality TEXT, flag TEXT, team_id TEXT NOT NULL, market_value TEXT, goals INTEGER DEFAULT 0, assists INTEGER DEFAULT 0, appearances INTEGER DEFAULT 0, rating REAL)`);
  db.exec(`CREATE TABLE IF NOT EXISTS matches (id TEXT PRIMARY KEY, league_id TEXT NOT NULL, home_team_id TEXT NOT NULL, away_team_id TEXT NOT NULL, date TEXT NOT NULL, time TEXT, round TEXT, venue TEXT, status TEXT DEFAULT 'upcoming', home_score INTEGER, away_score INTEGER, home_formation TEXT, away_formation TEXT)`);
  db.exec(`CREATE TABLE IF NOT EXISTS standings (id TEXT PRIMARY KEY, league_id TEXT NOT NULL, team_id TEXT NOT NULL, position INTEGER NOT NULL, played INTEGER DEFAULT 0, won INTEGER DEFAULT 0, drawn INTEGER DEFAULT 0, lost INTEGER DEFAULT 0, goals_for INTEGER DEFAULT 0, goals_against INTEGER DEFAULT 0, goal_difference INTEGER DEFAULT 0, points INTEGER DEFAULT 0, form TEXT)`);
  db.exec(`CREATE TABLE IF NOT EXISTS predictions (id TEXT PRIMARY KEY, match_id TEXT NOT NULL, prediction_type TEXT NOT NULL, confidence REAL NOT NULL, odds REAL, reasoning TEXT, btts TEXT, btts_confidence REAL, over_under TEXT, over_under_confidence REAL, created_at TEXT)`);
  db.exec(`CREATE TABLE IF NOT EXISTS transfers (id TEXT PRIMARY KEY, player_id TEXT NOT NULL, from_team_id TEXT, to_team_id TEXT NOT NULL, date TEXT NOT NULL, fee TEXT, type TEXT NOT NULL, season TEXT NOT NULL)`);
  db.exec(`CREATE TABLE IF NOT EXISTS historical_standings (id TEXT PRIMARY KEY, team_id TEXT NOT NULL, league_id TEXT NOT NULL, season TEXT NOT NULL, position INTEGER NOT NULL, points INTEGER DEFAULT 0)`);

  // ── Vider les tables existantes ──
  db.exec(`DELETE FROM historical_standings`);
  db.exec(`DELETE FROM transfers`);
  db.exec(`DELETE FROM predictions`);
  db.exec(`DELETE FROM standings`);
  db.exec(`DELETE FROM matches`);
  db.exec(`DELETE FROM players`);
  db.exec(`DELETE FROM teams`);
  db.exec(`DELETE FROM leagues`);

  // ════════════════════════════════════════════════════
  //  L I G U E S
  // ════════════════════════════════════════════════════
  db.exec(`
    INSERT INTO leagues (id, name, slug, country, flag, season) VALUES
    ('ligue1', 'Ligue 1 McDonald''s', 'ligue1', 'France', '🇫🇷', '2025-2026'),
    ('ligue2', 'Ligue 2 BKT', 'ligue2', 'France', '🇫🇷', '2025-2026'),
    ('premier-league', 'Premier League', 'premier-league', 'Angleterre', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '2025-2026'),
    ('la-liga', 'La Liga EA Sports', 'la-liga', 'Espagne', '🇪🇸', '2025-2026'),
    ('bundesliga', 'Bundesliga', 'bundesliga', 'Allemagne', '🇩🇪', '2025-2026'),
    ('serie-a', 'Serie A', 'serie-a', 'Italie', '🇮🇹', '2025-2026');
  `);

  // ════════════════════════════════════════════════════
  //  É Q U I P E S  —  L I G U E  1
  // ════════════════════════════════════════════════════
  db.exec(`
    INSERT INTO teams (id, name, slug, short_name, country, flag, league_id, stadium, capacity, coach, budget, founded_year, market_value, color) VALUES
    ('psg', 'Paris Saint-Germain', 'psg', 'PSG', 'France', '🇫🇷', 'ligue1', 'Parc des Princes', 47929, 'Luis Enrique', 700, 1970, '€1.2B', '#004170'),
    ('marseille', 'Olympique de Marseille', 'marseille', 'OM', 'France', '🇫🇷', 'ligue1', 'Orange Vélodrome', 67394, 'Roberto De Zerbi', 250, 1899, '€480M', '#2FAEE0'),
    ('monaco', 'AS Monaco', 'monaco', 'ASM', 'France', '🇲🇨', 'ligue1', 'Stade Louis-II', 18523, 'Adi Hütter', 200, 1924, '€420M', '#E63E32'),
    ('lyon', 'Olympique Lyonnais', 'lyon', 'OL', 'France', '🇫🇷', 'ligue1', 'Groupama Stadium', 59186, 'Paulo Fonseca', 180, 1950, '€380M', '#1D2C6B'),
    ('lille', 'LOSC Lille', 'lille', 'LOSC', 'France', '🇫🇷', 'ligue1', 'Stade Pierre-Mauroy', 50186, 'Bruno Genesio', 150, 1944, '€320M', '#E60000'),
    ('nice', 'OGC Nice', 'nice', 'OGCN', 'France', '🇫🇷', 'ligue1', 'Allianz Riviera', 36178, 'Francesco Farioli', 120, 1904, '€280M', '#E81E1E'),
    ('rennes', 'Stade Rennais FC', 'rennes', 'SRFC', 'France', '🇫🇷', 'ligue1', 'Roazhon Park', 29778, 'Julien Stéphan', 100, 1901, '€250M', '#E3000B'),
    ('lens', 'RC Lens', 'lens', 'RCL', 'France', '🇫🇷', 'ligue1', 'Stade Bollaert-Delelis', 38223, 'Will Still', 90, 1906, '€220M', '#FFD700'),
    ('brest', 'Stade Brestois 29', 'brest', 'SB29', 'France', '🇫🇷', 'ligue1', 'Stade Francis-Le Blé', 15983, 'Eric Roy', 55, 1950, '€120M', '#E30613'),
    ('strasbourg', 'RC Strasbourg Alsace', 'strasbourg', 'RCSA', 'France', '🇫🇷', 'ligue1', 'Stade de la Meinau', 26109, 'Liam Rosenior', 60, 1906, '€180M', '#1B3A8B');
  `);

  // Équipes Premier League
  db.exec(`
    INSERT INTO teams (id, name, slug, short_name, country, flag, league_id, stadium, capacity, coach, budget, founded_year, market_value, color) VALUES
    ('mancity', 'Manchester City', 'manchester-city', 'MCI', 'Angleterre', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'premier-league', 'Etihad Stadium', 53400, 'Pep Guardiola', 800, 1880, '€1.3B', '#6CABDD'),
    ('arsenal', 'Arsenal FC', 'arsenal', 'ARS', 'Angleterre', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'premier-league', 'Emirates Stadium', 60704, 'Mikel Arteta', 600, 1886, '€1.1B', '#EF0107'),
    ('liverpool', 'Liverpool FC', 'liverpool', 'LIV', 'Angleterre', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'premier-league', 'Anfield', 61376, 'Arne Slot', 650, 1892, '€1.0B', '#C8102E'),
    ('chelsea', 'Chelsea FC', 'chelsea', 'CHE', 'Angleterre', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'premier-league', 'Stamford Bridge', 40834, 'Enzo Maresca', 700, 1905, '€950M', '#034694'),
    ('manutd', 'Manchester United', 'manchester-united', 'MUN', 'Angleterre', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'premier-league', 'Old Trafford', 74310, 'Ruben Amorim', 600, 1878, '€800M', '#DA291C'),
    ('tottenham', 'Tottenham Hotspur', 'tottenham', 'TOT', 'Angleterre', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'premier-league', 'Tottenham Hotspur Stadium', 62850, 'Ange Postecoglou', 400, 1882, '€780M', '#132257'),
    ('astonvilla', 'Aston Villa FC', 'aston-villa', 'AVL', 'Angleterre', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'premier-league', 'Villa Park', 42640, 'Unai Emery', 300, 1874, '€650M', '#670E36'),
    ('newcastle', 'Newcastle United', 'newcastle', 'NEW', 'Angleterre', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'premier-league', 'St James'' Park', 52305, 'Eddie Howe', 350, 1892, '€620M', '#241F20');
  `);

  // Équipes La Liga
  db.exec(`
    INSERT INTO teams (id, name, slug, short_name, country, flag, league_id, stadium, capacity, coach, budget, founded_year, market_value, color) VALUES
    ('realmadrid', 'Real Madrid CF', 'real-madrid', 'RMA', 'Espagne', '🇪🇸', 'la-liga', 'Santiago Bernabéu', 81044, 'Carlo Ancelotti', 900, 1902, '€1.4B', '#FEBE10'),
    ('barcelona', 'FC Barcelona', 'barcelona', 'FCB', 'Espagne', '🇪🇸', 'la-liga', 'Spotify Camp Nou', 99354, 'Hansi Flick', 600, 1899, '€980M', '#A50044'),
    ('atletico', 'Atlético de Madrid', 'atletico-madrid', 'ATM', 'Espagne', '🇪🇸', 'la-liga', 'Cívitas Metropolitano', 70460, 'Diego Simeone', 400, 1903, '€580M', '#CB3524'),
    ('athletic', 'Athletic Club', 'athletic-club', 'ATH', 'Espagne', '🇪🇸', 'la-liga', 'San Mamés', 53289, 'Ernesto Valverde', 150, 1898, '€380M', '#EE2233'),
    ('realsociedad', 'Real Sociedad', 'real-sociedad', 'RSO', 'Espagne', '🇪🇸', 'la-liga', 'Reale Arena', 39313, 'Imanol Alguacil', 120, 1909, '€320M', '#1B4F8B'),
    ('betis', 'Real Betis Balompié', 'real-betis', 'BET', 'Espagne', '🇪🇸', 'la-liga', 'Benito Villamarín', 60721, 'Manuel Pellegrini', 100, 1907, '€250M', '#009833'),
    ('villareal', 'Villarreal CF', 'villareal', 'VIL', 'Espagne', '🇪🇸', 'la-liga', 'Estadio de la Cerámica', 23500, 'Marcelino', 100, 1923, '€280M', '#FEEF00'),
    ('sevilla', 'Sevilla FC', 'sevilla', 'SEV', 'Espagne', '🇪🇸', 'la-liga', 'Ramón Sánchez-Pizjuán', 43883, 'García Pimienta', 120, 1890, '€260M', '#D4021D');
  `);

  // ════════════════════════════════════════════════════
  //  É Q U I P E S  —  B U N D E S L I G A
  // ════════════════════════════════════════════════════
  db.exec(`
    INSERT INTO teams (id, name, slug, short_name, country, flag, league_id, stadium, capacity, coach, budget, founded_year, market_value, color) VALUES
    ('bayern', 'FC Bayern München', 'bayern-munich', 'FCB', 'Allemagne', '🇩🇪', 'bundesliga', 'Allianz Arena', 75024, 'Vincent Kompany', 800, 1900, '€1.1B', '#DC052D'),
    ('dortmund', 'Borussia Dortmund', 'borussia-dortmund', 'BVB', 'Allemagne', '🇩🇪', 'bundesliga', 'Signal Iduna Park', 81365, 'Nuri Sahin', 500, 1909, '€620M', '#FDE100'),
    ('leipzig', 'RB Leipzig', 'rb-leipzig', 'RBL', 'Allemagne', '🇩🇪', 'bundesliga', 'Red Bull Arena', 42146, 'Marco Rose', 350, 2009, '€550M', '#DD0741'),
    ('leverkusen', 'Bayer 04 Leverkusen', 'bayer-leverkusen', 'B04', 'Allemagne', '🇩🇪', 'bundesliga', 'BayArena', 30210, 'Xabi Alonso', 300, 1904, '€480M', '#E32221'),
    ('frankfurt', 'Eintracht Frankfurt', 'eintracht-frankfurt', 'SGE', 'Allemagne', '🇩🇪', 'bundesliga', 'Deutsche Bank Park', 51500, 'Dino Toppmöller', 200, 1899, '€320M', '#E1000F'),
    ('stuttgart', 'VfB Stuttgart', 'vfb-stuttgart', 'VFB', 'Allemagne', '🇩🇪', 'bundesliga', 'MHPArena', 60449, 'Sebastian Hoeneß', 150, 1893, '€280M', '#E32322'),
    ('gladbach', 'Borussia Mönchengladbach', 'borussia-mg', 'BMG', 'Allemagne', '🇩🇪', 'bundesliga', 'Borussia-Park', 54022, 'Gerardo Seoane', 120, 1900, '€250M', '#1A4731'),
    ('wolfsburg', 'VfL Wolfsburg', 'wolfsburg', 'WOB', 'Allemagne', '🇩🇪', 'bundesliga', 'Volkswagen Arena', 30000, 'Ralph Hasenhüttl', 180, 1945, '€230M', '#65B32E');
  `);

  // ════════════════════════════════════════════════════
  //  É Q U I P E S  —  S E R I E   A
  // ════════════════════════════════════════════════════
  db.exec(`
    INSERT INTO teams (id, name, slug, short_name, country, flag, league_id, stadium, capacity, coach, budget, founded_year, market_value, color) VALUES
    ('inter', 'FC Internazionale Milano', 'inter-milan', 'INT', 'Italie', '🇮🇹', 'serie-a', 'San Siro', 75923, 'Simone Inzaghi', 600, 1908, '€780M', '#010E80'),
    ('acmilan', 'AC Milan', 'ac-milan', 'ACM', 'Italie', '🇮🇹', 'serie-a', 'San Siro', 75923, 'Sérgio Conceição', 500, 1899, '€650M', '#E3052A'),
    ('juventus', 'Juventus FC', 'juventus', 'JUV', 'Italie', '🇮🇹', 'serie-a', 'Allianz Stadium', 41507, 'Thiago Motta', 450, 1897, '€580M', '#000000'),
    ('napoli', 'SSC Napoli', 'napoli', 'NAP', 'Italie', '🇮🇹', 'serie-a', 'Stadio Diego Maradona', 54726, 'Antonio Conte', 350, 1926, '€520M', '#12A0D4'),
    ('roma', 'AS Roma', 'roma', 'ROM', 'Italie', '🇮🇹', 'serie-a', 'Stadio Olimpico', 70634, 'Claudio Ranieri', 250, 1927, '€380M', '#8E1F2F'),
    ('lazio', 'SS Lazio', 'lazio', 'LAZ', 'Italie', '🇮🇹', 'serie-a', 'Stadio Olimpico', 70634, 'Marco Baroni', 200, 1900, '€320M', '#7ABAD2'),
    ('atalanta', 'Atalanta BC', 'atalanta', 'ATA', 'Italie', '🇮🇹', 'serie-a', 'Gewiss Stadium', 24950, 'Gian Piero Gasperini', 250, 1907, '€400M', '#1B3A8B'),
    ('fiorentina', 'ACF Fiorentina', 'fiorentina', 'FIO', 'Italie', '🇮🇹', 'serie-a', 'Stadio Artemio Franchi', 43247, 'Raffaele Palladino', 120, 1926, '€280M', '#4B0082');
  `);

  // ════════════════════════════════════════════════════
  //  J O U E U R S  —  L I G U E  1
  // ════════════════════════════════════════════════════
  db.exec(`
    INSERT INTO players (id, name, position, number, nationality, flag, team_id, market_value, goals, assists, appearances, rating) VALUES
    -- PSG
    ('psg-mbappe', 'Kylian Mbappé', 'FWD', 10, 'France', '🇫🇷', 'psg', '€200M', 32, 12, 38, 8.6),
    ('psg-dembele', 'Ousmane Dembélé', 'FWD', 7, 'France', '🇫🇷', 'psg', '€60M', 14, 18, 36, 7.8),
    ('psg-hakimi', 'Achraf Hakimi', 'DEF', 2, 'Maroc', '🇲🇦', 'psg', '€65M', 5, 10, 37, 7.5),
    ('psg-vitinha', 'Vitinha', 'MID', 17, 'Portugal', '🇵🇹', 'psg', '€55M', 8, 6, 35, 7.4),
    ('psg-donnarumma', 'Gianluigi Donnarumma', 'GK', 1, 'Italie', '🇮🇹', 'psg', '€50M', 0, 0, 34, 7.3),
    ('psg-neves', 'João Neves', 'MID', 87, 'Portugal', '🇵🇹', 'psg', '€60M', 6, 8, 33, 7.5),
    ('psg-barcola', 'Bradley Barcola', 'FWD', 29, 'France', '🇫🇷', 'psg', '€55M', 10, 7, 35, 7.4),
    ('psg-mendes', 'Nuno Mendes', 'DEF', 25, 'Portugal', '🇵🇹', 'psg', '€45M', 2, 5, 30, 7.2),

    -- Marseille
    ('om-rabiot', 'Adrien Rabiot', 'MID', 25, 'France', '🇫🇷', 'marseille', '€35M', 5, 4, 32, 7.1),
    ('om-greenwood', 'Mason Greenwood', 'FWD', 10, 'Angleterre', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'marseille', '€45M', 16, 8, 34, 7.6),
    ('om-henrique', 'Luis Henrique', 'FWD', 11, 'Brésil', '🇧🇷', 'marseille', '€25M', 8, 5, 31, 7.0),
    ('om-hariton', 'Amine Harit', 'MID', 7, 'Maroc', '🇲🇦', 'marseille', '€15M', 4, 6, 28, 6.9),
    ('om-balerdi', 'Leonardo Balerdi', 'DEF', 5, 'Argentine', '🇦🇷', 'marseille', '€22M', 2, 1, 33, 6.8),
    ('om-ruggiero', 'Valentin Rongier', 'MID', 21, 'France', '🇫🇷', 'marseille', '€18M', 1, 3, 29, 6.9),

    -- Monaco
    ('monaco-zakaria', 'Denis Zakaria', 'MID', 6, 'Suisse', '🇨🇭', 'monaco', '€30M', 4, 2, 30, 7.1),
    ('monaco-ben-yedder', 'Wissam Ben Yedder', 'FWD', 10, 'France', '🇫🇷', 'monaco', '€20M', 12, 5, 32, 7.2),
    ('monaco-fofana', 'Youssouf Fofana', 'MID', 19, 'France', '🇫🇷', 'monaco', '€35M', 3, 6, 33, 7.0),
    ('monaco-vanderson', 'Vanderson', 'DEF', 2, 'Brésil', '🇧🇷', 'monaco', '€28M', 3, 4, 31, 7.0),
    ('monaco-kohn', 'Philipp Köhn', 'GK', 1, 'Suisse', '🇨🇭', 'monaco', '€12M', 0, 0, 30, 6.8),

    -- LYON
    ('lyon-lacazette', 'Alexandre Lacazette', 'FWD', 10, 'France', '🇫🇷', 'lyon', '€15M', 15, 4, 33, 7.3),
    ('lyon-cherki', 'Rayan Cherki', 'MID', 18, 'France', '🇫🇷', 'lyon', '€35M', 7, 10, 34, 7.2),
    ('lyon-tolisso', 'Corentin Tolisso', 'MID', 8, 'France', '🇫🇷', 'lyon', '€12M', 4, 3, 28, 6.9),
    ('lyon-mata', 'Clinton Mata', 'DEF', 22, 'Angola', '🇦🇴', 'lyon', '€8M', 1, 2, 30, 6.7),
    ('lyon-tagliafico', 'Nicolás Tagliafico', 'DEF', 3, 'Argentine', '🇦🇷', 'lyon', '€6M', 2, 3, 29, 6.8),

    -- LILLE
    ('lille-david', 'Jonathan David', 'FWD', 9, 'Canada', '🇨🇦', 'lille', '€50M', 18, 6, 35, 7.6),
    ('lille-gomes', 'Angel Gomes', 'MID', 8, 'Angleterre', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'lille', '€30M', 5, 9, 33, 7.3),
    ('lille-chevalier', 'Lucas Chevalier', 'GK', 1, 'France', '🇫🇷', 'lille', '€35M', 0, 0, 34, 7.4),
    ('lille-zhzhegova', 'Edon Zhegrova', 'FWD', 23, 'Kosovo', '🇽🇰', 'lille', '€22M', 8, 7, 30, 7.1),

    -- NICE
    ('nice-terem', 'Terem Moffi', 'FWD', 9, 'Nigeria', '🇳🇬', 'nice', '€25M', 12, 3, 31, 7.0),
    ('nice-thuram', 'Khéphren Thuram', 'MID', 19, 'France', '🇫🇷', 'nice', '€30M', 3, 5, 32, 7.1),
    ('nice-todibo', 'Jean-Clair Todibo', 'DEF', 25, 'France', '🇫🇷', 'nice', '€35M', 1, 1, 33, 7.2),
    ('nice-boga', 'Jérémie Boga', 'FWD', 7, 'Côte d''Ivoire', '🇨🇮', 'nice', '€18M', 6, 4, 29, 6.9),

    -- RENNES
    ('rennes-gouiri', 'Amine Gouiri', 'FWD', 10, 'Algérie', '🇩🇿', 'rennes', '€28M', 11, 5, 32, 7.1),
    ('rennes-bourigeaud', 'Benjamin Bourigeaud', 'MID', 14, 'France', '🇫🇷', 'rennes', '€20M', 6, 9, 34, 7.2),
    ('rennes-doug', 'Lorenz Assignon', 'DEF', 22, 'France', '🇫🇷', 'rennes', '€12M', 2, 4, 30, 6.8),
    ('rennes-kalimuendo', 'Arnaud Kalimuendo', 'FWD', 9, 'France', '🇫🇷', 'rennes', '€18M', 8, 3, 29, 6.9),

    -- LENS
    ('lens-sotoca', 'Florian Sotoca', 'FWD', 7, 'France', '🇫🇷', 'lens', '€10M', 9, 5, 33, 7.0),
    ('lens-david-costa', 'David Pereira da Costa', 'MID', 10, 'Portugal', '🇵🇹', 'lens', '€25M', 5, 7, 32, 7.1),
    ('lens-medi-', 'Brice Samba', 'GK', 30, 'France', '🇫🇷', 'lens', '€15M', 0, 0, 34, 7.2),
    ('lens-danso', 'Kevin Danso', 'DEF', 4, 'Autriche', '🇦🇹', 'lens', '€25M', 2, 1, 32, 7.0),

    -- BREST
    ('brest-ajorque', 'Ludovic Ajorque', 'FWD', 9, 'France', '🇫🇷', 'brest', '€8M', 10, 3, 32, 6.9),
    ('brest-del-castillo', 'Romain Del Castillo', 'MID', 10, 'France', '🇫🇷', 'brest', '€12M', 5, 8, 31, 7.0),
    ('brest-lees-melou', 'Pierre Lees-Melou', 'MID', 20, 'France', '🇫🇷', 'brest', '€10M', 3, 4, 29, 6.9),
    ('brest-chardonnet', 'Brendan Chardonnet', 'DEF', 5, 'France', '🇫🇷', 'brest', '€6M', 2, 1, 33, 6.7),

    -- STRASBOURG
    ('strasbourg-emegha', 'Emanuel Emegha', 'FWD', 29, 'Pays-Bas', '🇳🇱', 'strasbourg', '€15M', 8, 2, 30, 6.8),
    ('strasbourg-diarra', 'Habib Diarra', 'MID', 10, 'Sénégal', '🇸🇳', 'strasbourg', '€18M', 4, 4, 31, 6.9),
    ('strasbourg-sahraoui', 'Dilane Bakwa', 'FWD', 27, 'France', '🇫🇷', 'strasbourg', '€12M', 5, 5, 29, 6.8),
    ('strasbourg-doukoure', 'Ismaël Doukouré', 'DEF', 4, 'France', '🇫🇷', 'strasbourg', '€14M', 1, 2, 30, 6.8);
  `);

  // ════════════════════════════════════════════════════
  //  J O U E U R S  —  P R E M I E R   L E A G U E
  // ════════════════════════════════════════════════════
  db.exec(`
    INSERT INTO players (id, name, position, number, nationality, flag, team_id, market_value, goals, assists, appearances, rating) VALUES
    -- MAN CITY
    ('mci-haaland', 'Erling Haaland', 'FWD', 9, 'Norvège', '🇳🇴', 'mancity', '€200M', 36, 8, 38, 8.8),
    ('mci-foden', 'Phil Foden', 'MID', 47, 'Angleterre', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'mancity', '€130M', 14, 12, 37, 8.0),
    ('mci-rodri', 'Rodri', 'MID', 16, 'Espagne', '🇪🇸', 'mancity', '€120M', 8, 6, 35, 8.2),
    ('mci-debruyne', 'Kevin De Bruyne', 'MID', 17, 'Belgique', '🇧🇪', 'mancity', '€60M', 10, 18, 32, 8.0),
    ('mci-dias', 'Rúben Dias', 'DEF', 3, 'Portugal', '🇵🇹', 'mancity', '€80M', 3, 1, 34, 7.5),
    ('mci-grealish', 'Jack Grealish', 'MID', 10, 'Angleterre', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'mancity', '€65M', 5, 9, 30, 7.2),
    ('mci-ederson', 'Ederson', 'GK', 31, 'Brésil', '🇧🇷', 'mancity', '€40M', 0, 0, 35, 7.3),

    -- ARSENAL
    ('ars-saka', 'Bukayo Saka', 'MID', 7, 'Angleterre', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'arsenal', '€150M', 18, 15, 37, 8.3),
    ('ars-odegaard', 'Martin Ødegaard', 'MID', 8, 'Norvège', '🇳🇴', 'arsenal', '€100M', 8, 12, 35, 7.8),
    ('ars-rice', 'Declan Rice', 'MID', 41, 'Angleterre', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'arsenal', '€120M', 6, 5, 36, 7.7),
    ('ars-saliba', 'William Saliba', 'DEF', 2, 'France', '🇫🇷', 'arsenal', '€80M', 2, 1, 36, 7.6),
    ('ars-gabriel', 'Gabriel Magalhães', 'DEF', 6, 'Brésil', '🇧🇷', 'arsenal', '€70M', 5, 2, 35, 7.5),
    ('ars-havetz', 'Kai Havertz', 'FWD', 29, 'Allemagne', '🇩🇪', 'arsenal', '€65M', 14, 7, 34, 7.4),
    ('ars-martinelli', 'Gabriel Martinelli', 'FWD', 11, 'Brésil', '🇧🇷', 'arsenal', '€70M', 10, 6, 33, 7.3),
    ('ars-raphinha', 'Raphinha', 'MID', 10, 'Brésil', '🇧🇷', 'arsenal', '€60M', 8, 9, 32, 7.3),

    -- LIVERPOOL
    ('liv-salah', 'Mohamed Salah', 'FWD', 11, 'Égypte', '🇪🇬', 'liverpool', '€80M', 28, 16, 37, 8.5),
    ('liv-vandijk', 'Virgil van Dijk', 'DEF', 4, 'Pays-Bas', '🇳🇱', 'liverpool', '€40M', 4, 2, 35, 7.6),
    ('liv-alexander-arnold', 'Trent Alexander-Arnold', 'DEF', 66, 'Angleterre', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'liverpool', '€75M', 3, 14, 34, 7.6),
    ('liv-macallister', 'Alexis Mac Allister', 'MID', 10, 'Argentine', '🇦🇷', 'liverpool', '€70M', 7, 8, 35, 7.5),
    ('liv-szoboszlai', 'Dominik Szoboszlai', 'MID', 8, 'Hongrie', '🇭🇺', 'liverpool', '€75M', 8, 6, 34, 7.4),
    ('liv-darwin', 'Darwin Núñez', 'FWD', 9, 'Uruguay', '🇺🇾', 'liverpool', '€70M', 16, 8, 35, 7.3),
    ('liv-gakpo', 'Cody Gakpo', 'FWD', 18, 'Pays-Bas', '🇳🇱', 'liverpool', '€55M', 12, 5, 32, 7.3),
    ('liv-kelleher', 'Caoimhin Kelleher', 'GK', 62, 'Irlande', '🇮🇪', 'liverpool', '€20M', 0, 0, 20, 7.0),

    -- CHELSEA
    ('che-palmer', 'Cole Palmer', 'MID', 20, 'Angleterre', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'chelsea', '€130M', 22, 11, 37, 8.2),
    ('che-fernandez', 'Enzo Fernández', 'MID', 8, 'Argentine', '🇦🇷', 'chelsea', '€75M', 5, 9, 35, 7.3),
    ('che-caicedo', 'Moisés Caicedo', 'MID', 25, 'Équateur', '🇪🇨', 'chelsea', '€80M', 3, 4, 36, 7.4),
    ('che-jackson', 'Nicolas Jackson', 'FWD', 15, 'Sénégal', '🇸🇳', 'chelsea', '€50M', 14, 6, 34, 7.2),
    ('che-gusto', 'Malo Gusto', 'DEF', 27, 'France', '🇫🇷', 'chelsea', '€45M', 2, 5, 32, 7.1),
    ('che-colwill', 'Levi Colwill', 'DEF', 26, 'Angleterre', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'chelsea', '€55M', 2, 2, 33, 7.1),
    ('che-sanchez', 'Robert Sánchez', 'GK', 1, 'Espagne', '🇪🇸', 'chelsea', '€18M', 0, 0, 28, 6.8),

    -- MAN UTD
    ('mun-fernandes', 'Bruno Fernandes', 'MID', 8, 'Portugal', '🇵🇹', 'manutd', '€80M', 12, 11, 36, 7.6),
    ('mun-rashford', 'Marcus Rashford', 'FWD', 10, 'Angleterre', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'manutd', '€60M', 10, 5, 33, 7.1),
    ('mun-garnacho', 'Alejandro Garnacho', 'FWD', 17, 'Argentine', '🇦🇷', 'manutd', '€50M', 8, 6, 32, 7.0),
    ('mun-mainoo', 'Kobbie Mainoo', 'MID', 37, 'Angleterre', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'manutd', '€60M', 4, 3, 34, 7.3),
    ('mun-hoylund', 'Rasmus Højlund', 'FWD', 9, 'Danemark', '🇩🇰', 'manutd', '€65M', 12, 4, 33, 7.1),
    ('mun-martinez', 'Lisandro Martínez', 'DEF', 6, 'Argentine', '🇦🇷', 'manutd', '€50M', 2, 1, 30, 7.0),
    ('mun-onana', 'André Onana', 'GK', 24, 'Cameroun', '🇨🇲', 'manutd', '€35M', 0, 0, 34, 6.9),

    -- TOTTENHAM
    ('tot-kane', 'Harry Kane', 'FWD', 10, 'Angleterre', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'tottenham', '€120M', 30, 10, 37, 8.4),
    ('tot-maddison', 'James Maddison', 'MID', 10, 'Angleterre', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'tottenham', '€60M', 8, 12, 34, 7.4),
    ('tot-kulusevski', 'Dejan Kulusevski', 'MID', 21, 'Suède', '🇸🇪', 'tottenham', '€55M', 8, 9, 35, 7.3),
    ('tot-van-de-ven', 'Micky van de Ven', 'DEF', 37, 'Pays-Bas', '🇳🇱', 'tottenham', '€55M', 2, 3, 32, 7.2),
    ('tot-romero', 'Cristian Romero', 'DEF', 17, 'Argentine', '🇦🇷', 'tottenham', '€60M', 3, 1, 33, 7.2),
    ('tot-vicario', 'Guglielmo Vicario', 'GK', 1, 'Italie', '🇮🇹', 'tottenham', '€25M', 0, 0, 32, 7.0),

    -- ASTON VILLA
    ('avl-watkins', 'Ollie Watkins', 'FWD', 11, 'Angleterre', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'astonvilla', '€65M', 20, 10, 36, 7.6),
    ('avl-rogers', 'Morgan Rogers', 'MID', 27, 'Angleterre', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'astonvilla', '€40M', 7, 6, 34, 7.2),
    ('avl-mc ginn', 'John McGinn', 'MID', 7, 'Écosse', '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'astonvilla', '€30M', 5, 7, 35, 7.1),
    ('avl-martinez', 'Emiliano Martínez', 'GK', 1, 'Argentine', '🇦🇷', 'astonvilla', '€35M', 0, 0, 36, 7.5),
    ('avl-pau-torres', 'Pau Torres', 'DEF', 14, 'Espagne', '🇪🇸', 'astonvilla', '€35M', 2, 2, 33, 7.1),
    ('avl-duran', 'Jhon Durán', 'FWD', 9, 'Colombie', '🇨🇴', 'astonvilla', '€35M', 8, 3, 28, 6.9),

    -- NEWCASTLE
    ('new-isak', 'Alexander Isak', 'FWD', 14, 'Suède', '🇸🇪', 'newcastle', '€80M', 22, 6, 35, 7.7),
    ('new-guimaraes', 'Bruno Guimarães', 'MID', 39, 'Brésil', '🇧🇷', 'newcastle', '€85M', 5, 7, 36, 7.5),
    ('new-gordon', 'Anthony Gordon', 'MID', 10, 'Angleterre', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'newcastle', '€60M', 10, 8, 34, 7.3),
    ('new-tonali', 'Sandro Tonali', 'MID', 8, 'Italie', '🇮🇹', 'newcastle', '€55M', 4, 5, 33, 7.2),
    ('new-botman', 'Sven Botman', 'DEF', 4, 'Pays-Bas', '🇳🇱', 'newcastle', '€45M', 2, 1, 32, 7.1),
    ('new-pope', 'Nick Pope', 'GK', 22, 'Angleterre', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'newcastle', '€25M', 0, 0, 34, 7.2);
  `);

  // ════════════════════════════════════════════════════
  //  J O U E U R S  —  L A   L I G A
  // ════════════════════════════════════════════════════
  db.exec(`
    INSERT INTO players (id, name, position, number, nationality, flag, team_id, market_value, goals, assists, appearances, rating) VALUES
    -- REAL MADRID
    ('rma-mbappe', 'Kylian Mbappé', 'FWD', 9, 'France', '🇫🇷', 'realmadrid', '€200M', 34, 10, 37, 8.7),
    ('rma-vinicius', 'Vinícius Jr', 'FWD', 7, 'Brésil', '🇧🇷', 'realmadrid', '€200M', 22, 15, 36, 8.5),
    ('rma-bellingham', 'Jude Bellingham', 'MID', 5, 'Angleterre', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'realmadrid', '€180M', 18, 10, 35, 8.3),
    ('rma-valverde', 'Federico Valverde', 'MID', 8, 'Uruguay', '🇺🇾', 'realmadrid', '€100M', 8, 6, 36, 7.8),
    ('rma-camavinga', 'Eduardo Camavinga', 'MID', 6, 'France', '🇫🇷', 'realmadrid', '€80M', 4, 5, 34, 7.5),
    ('rma-rudiger', 'Antonio Rüdiger', 'DEF', 22, 'Allemagne', '🇩🇪', 'realmadrid', '€40M', 4, 2, 35, 7.4),
    ('rma-carvajal', 'Dani Carvajal', 'DEF', 2, 'Espagne', '🇪🇸', 'realmadrid', '€20M', 1, 3, 28, 7.0),
    ('rma-courtois', 'Thibaut Courtois', 'GK', 1, 'Belgique', '🇧🇪', 'realmadrid', '€30M', 0, 0, 32, 7.5),

    -- BARCELONA
    ('fcb-yamal', 'Lamine Yamal', 'FWD', 19, 'Espagne', '🇪🇸', 'barcelona', '€180M', 16, 18, 37, 8.4),
    ('fcb-lewandowski', 'Robert Lewandowski', 'FWD', 9, 'Pologne', '🇵🇱', 'barcelona', '€30M', 24, 6, 35, 8.0),
    ('fcb-pedri', 'Pedri', 'MID', 8, 'Espagne', '🇪🇸', 'barcelona', '€100M', 6, 10, 35, 7.8),
    ('fcb-gavi', 'Gavi', 'MID', 6, 'Espagne', '🇪🇸', 'barcelona', '€80M', 5, 6, 34, 7.5),
    ('fcb-raphinha', 'Raphinha', 'MID', 11, 'Brésil', '🇧🇷', 'barcelona', '€60M', 12, 10, 35, 7.6),
    ('fcb-cubarsi', 'Pau Cubarsí', 'DEF', 2, 'Espagne', '🇪🇸', 'barcelona', '€70M', 1, 2, 34, 7.3),
    ('fcb-kounde', 'Jules Koundé', 'DEF', 23, 'France', '🇫🇷', 'barcelona', '€55M', 2, 4, 35, 7.3),
    ('fcb-ter-stegen', 'Marc ter Stegen', 'GK', 1, 'Allemagne', '🇩🇪', 'barcelona', '€15M', 0, 0, 30, 7.1),

    -- ATLÉTICO MADRID
    ('atm-griezmann', 'Antoine Griezmann', 'FWD', 7, 'France', '🇫🇷', 'atletico', '€25M', 16, 8, 36, 7.7),
    ('atm-alvarez', 'Julián Álvarez', 'FWD', 19, 'Argentine', '🇦🇷', 'atletico', '€80M', 14, 6, 35, 7.5),
    ('atm-de-paul', 'Rodrigo De Paul', 'MID', 5, 'Argentine', '🇦🇷', 'atletico', '€35M', 4, 8, 35, 7.3),
    ('atm-llorente', 'Marcos Llorente', 'MID', 14, 'Espagne', '🇪🇸', 'atletico', '€30M', 6, 5, 34, 7.2),
    ('atm-gimenez', 'José María Giménez', 'DEF', 2, 'Uruguay', '🇺🇾', 'atletico', '€30M', 2, 1, 32, 7.1),
    ('atm-oblak', 'Jan Oblak', 'GK', 13, 'Slovénie', '🇸🇮', 'atletico', '€20M', 0, 0, 35, 7.4),

    -- ATHLETIC BILBAO
    ('ath-williams', 'Nico Williams', 'FWD', 10, 'Espagne', '🇪🇸', 'athletic', '€70M', 8, 14, 35, 7.5),
    ('ath-sancet', 'Oihan Sancet', 'MID', 8, 'Espagne', '🇪🇸', 'athletic', '€50M', 10, 5, 34, 7.3),
    ('ath-vivian', 'Dani Vivian', 'DEF', 3, 'Espagne', '🇪🇸', 'athletic', '€40M', 3, 1, 35, 7.2),
    ('ath-simon', 'Unai Simón', 'GK', 1, 'Espagne', '🇪🇸', 'athletic', '€25M', 0, 0, 34, 7.3),
    ('ath-berenguer', 'Álex Berenguer', 'FWD', 7, 'Espagne', '🇪🇸', 'athletic', '€20M', 7, 4, 32, 7.0),

    -- REAL SOCIEDAD
    ('rso-kubo', 'Takefusa Kubo', 'MID', 14, 'Japon', '🇯🇵', 'realsociedad', '€50M', 8, 7, 34, 7.3),
    ('rso-oyarzabal', 'Mikel Oyarzabal', 'FWD', 10, 'Espagne', '🇪🇸', 'realsociedad', '€40M', 12, 5, 33, 7.2),
    ('rso-zubimendi', 'Martín Zubimendi', 'MID', 4, 'Espagne', '🇪🇸', 'realsociedad', '€60M', 3, 3, 35, 7.3),
    ('rso-le-normand', 'Robin Le Normand', 'DEF', 24, 'Espagne', '🇪🇸', 'realsociedad', '€35M', 2, 1, 34, 7.1),
    ('rso-remiro', 'Álex Remiro', 'GK', 1, 'Espagne', '🇪🇸', 'realsociedad', '€20M', 0, 0, 35, 7.2),

    -- REAL BETIS
    ('bet-isco', 'Isco', 'MID', 22, 'Espagne', '🇪🇸', 'betis', '€8M', 6, 8, 33, 7.2),
    ('bet-aviles', 'Chimy Avila', 'FWD', 9, 'Argentine', '🇦🇷', 'betis', '€12M', 10, 4, 31, 6.9),
    ('bet-cardoso', 'Johnny Cardoso', 'MID', 4, 'États-Unis', '🇺🇸', 'betis', '€25M', 3, 3, 32, 7.0),
    ('bet-bartra', 'Marc Bartra', 'DEF', 5, 'Espagne', '🇪🇸', 'betis', '€5M', 1, 1, 30, 6.8),
    ('bet-vieites', 'Fran Vieites', 'GK', 1, 'Espagne', '🇪🇸', 'betis', '€5M', 0, 0, 28, 6.7),

    -- VILLARREAL
    ('vil-baena', 'Álex Baena', 'MID', 16, 'Espagne', '🇪🇸', 'villareal', '€45M', 6, 12, 35, 7.4),
    ('vil-parejo', 'Dani Parejo', 'MID', 10, 'Espagne', '🇪🇸', 'villareal', '€8M', 4, 7, 34, 7.1),
    ('vil-gerard', 'Gerard Moreno', 'FWD', 7, 'Espagne', '🇪🇸', 'villareal', '€15M', 12, 5, 30, 7.2),
    ('vil-sorloth', 'Alexander Sørloth', 'FWD', 11, 'Norvège', '🇳🇴', 'villareal', '€25M', 14, 4, 33, 7.1),
    ('vil-foyth', 'Juan Foyth', 'DEF', 8, 'Argentine', '🇦🇷', 'villareal', '€18M', 1, 2, 30, 6.8),

    -- SEVILLA
    ('sev-lukebakio', 'Dodi Lukebakio', 'FWD', 11, 'Belgique', '🇧🇪', 'sevilla', '€18M', 8, 5, 33, 7.0),
    ('sev-nyland', 'Ørjan Nyland', 'GK', 1, 'Norvège', '🇳🇴', 'sevilla', '€6M', 0, 0, 34, 6.9),
    ('sev-sow', 'Djibril Sow', 'MID', 18, 'Suisse', '🇨🇭', 'sevilla', '€15M', 3, 4, 32, 6.9),
    ('sev-gudelj', 'Nemanja Gudelj', 'MID', 6, 'Serbie', '🇷🇸', 'sevilla', '€8M', 2, 2, 30, 6.8),
    ('sev-bade', 'Loïc Badé', 'DEF', 22, 'France', '🇫🇷', 'sevilla', '€20M', 2, 1, 33, 7.0);
  `);

  // ════════════════════════════════════════════════════
  //  J O U E U R S  —  B U N D E S L I G A
  // ════════════════════════════════════════════════════
  db.exec(`
    INSERT INTO players (id, name, position, number, nationality, flag, team_id, market_value, goals, assists, appearances, rating) VALUES
    -- BAYERN
    ('bayern-kane', 'Harry Kane', 'FWD', 9, 'Angleterre', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'bayern', '€120M', 32, 10, 35, 8.7),
    ('bayern-musiala', 'Jamal Musiala', 'MID', 42, 'Allemagne', '🇩🇪', 'bayern', '€130M', 14, 12, 34, 8.2),
    ('bayern-sane', 'Leroy Sané', 'FWD', 10, 'Allemagne', '🇩🇪', 'bayern', '€70M', 12, 10, 33, 7.6),
    ('bayern-kimmich', 'Joshua Kimmich', 'MID', 6, 'Allemagne', '🇩🇪', 'bayern', '€60M', 4, 8, 35, 7.5),
    ('bayern-ueber', 'Dayot Upamecano', 'DEF', 2, 'France', '🇫🇷', 'bayern', '€55M', 3, 2, 34, 7.3),
    ('bayern-neuer', 'Manuel Neuer', 'GK', 1, 'Allemagne', '🇩🇪', 'bayern', '€8M', 0, 0, 30, 7.2),

    -- DORTMUND
    ('dortmund-gittens', 'Jamie Gittens', 'FWD', 43, 'Angleterre', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'dortmund', '€65M', 12, 6, 33, 7.4),
    ('dortmund-beier', 'Maximilian Beier', 'FWD', 9, 'Allemagne', '🇩🇪', 'dortmund', '€40M', 14, 4, 32, 7.2),
    ('dortmund-brandt', 'Julian Brandt', 'MID', 10, 'Allemagne', '🇩🇪', 'dortmund', '€35M', 6, 10, 34, 7.1),
    ('dortmund-schlotterbeck', 'Nico Schlotterbeck', 'DEF', 4, 'Allemagne', '🇩🇪', 'dortmund', '€45M', 3, 3, 35, 7.2),
    ('dortmund-kobel', 'Gregor Kobel', 'GK', 1, 'Suisse', '🇨🇭', 'dortmund', '€40M', 0, 0, 34, 7.3),

    -- LEIPZIG
    ('leipzig-openda', 'Lois Openda', 'FWD', 11, 'Belgique', '🇧🇪', 'leipzig', '€70M', 16, 6, 34, 7.4),
    ('leipzig-sesko', 'Benjamin Sesko', 'FWD', 30, 'Slovénie', '🇸🇮', 'leipzig', '€55M', 12, 5, 32, 7.2),
    ('leipzig-vermeeren', 'Arthur Vermeeren', 'MID', 20, 'Belgique', '🇧🇪', 'leipzig', '€35M', 3, 5, 30, 6.9),
    ('leipzig-orbán', 'Willi Orbán', 'DEF', 4, 'Hongrie', '🇭🇺', 'leipzig', '€20M', 2, 1, 33, 7.0),
    ('leipzig-gulasci', 'Peter Gulácsi', 'GK', 1, 'Hongrie', '🇭🇺', 'leipzig', '€6M', 0, 0, 28, 6.8),

    -- LEVERKUSEN
    ('leverkusen-schick', 'Patrik Schick', 'FWD', 14, 'République tchèque', '🇨🇿', 'leverkusen', '€30M', 14, 5, 33, 7.3),
    ('leverkusen-wirtz', 'Florian Wirtz', 'MID', 10, 'Allemagne', '🇩🇪', 'leverkusen', '€120M', 10, 14, 34, 8.1),
    ('leverkusen-xhaka', 'Granit Xhaka', 'MID', 34, 'Suisse', '🇨🇭', 'leverkusen', '€18M', 4, 7, 35, 7.2),
    ('leverkusen-tah', 'Jonathan Tah', 'DEF', 4, 'Allemagne', '🇩🇪', 'leverkusen', '€40M', 3, 1, 35, 7.3),
    ('leverkusen-hradecky', 'Lukáš Hrádecký', 'GK', 1, 'Finlande', '🇫🇮', 'leverkusen', '€4M', 0, 0, 32, 6.9),

    -- FRANKFURT
    ('frankfurt-marmoush', 'Omar Marmoush', 'FWD', 7, 'Égypte', '🇪🇬', 'frankfurt', '€60M', 18, 8, 34, 7.6),
    ('frankfurt-knauff', 'Ansgar Knauff', 'MID', 36, 'Allemagne', '🇩🇪', 'frankfurt', '€18M', 5, 6, 32, 6.9),
    ('frankfurt-koch', 'Robin Koch', 'DEF', 4, 'Allemagne', '🇩🇪', 'frankfurt', '€15M', 2, 2, 33, 7.0),
    ('frankfurt-trapp', 'Kevin Trapp', 'GK', 1, 'Allemagne', '🇩🇪', 'frankfurt', '€8M', 0, 0, 34, 7.1),

    -- STUTTGART
    ('stuttgart-undav', 'Deniz Undav', 'FWD', 26, 'Allemagne', '🇩🇪', 'stuttgart', '€40M', 14, 7, 33, 7.3),
    ('stuttgart-fuhrich', 'Chris Führich', 'MID', 27, 'Allemagne', '🇩🇪', 'stuttgart', '€30M', 6, 9, 34, 7.1),
    ('stuttgart-rouault', 'Anthony Rouault', 'DEF', 29, 'France', '🇫🇷', 'stuttgart', '€18M', 2, 1, 32, 6.8),
    ('stuttgart-nubel', 'Alexander Nübel', 'GK', 1, 'Allemagne', '🇩🇪', 'stuttgart', '€15M', 0, 0, 34, 7.0),

    -- GLADBACH
    ('gladbach-kleindienst', 'Tim Kleindienst', 'FWD', 11, 'Allemagne', '🇩🇪', 'gladbach', '€22M', 12, 4, 33, 7.1),
    ('gladbach-hack', 'Robin Hack', 'MID', 25, 'Allemagne', '🇩🇪', 'gladbach', '€15M', 6, 5, 31, 6.9),
    ('gladbach-elser', 'Marvin Elvedi', 'DEF', 30, 'Suisse', '🇨🇭', 'gladbach', '€20M', 2, 2, 34, 7.0),
    ('gladbach-nicholas', 'Moritz Nicolas', 'GK', 1, 'Allemagne', '🇩🇪', 'gladbach', '€6M', 0, 0, 30, 6.7),

    -- WOLFSBURG
    ('wolfsburg-wind', 'Jonas Wind', 'FWD', 23, 'Danemark', '🇩🇰', 'wolfsburg', '€25M', 10, 5, 32, 7.0),
    ('wolfsburg-arnold', 'Maximilian Arnold', 'MID', 27, 'Allemagne', '🇩🇪', 'wolfsburg', '€15M', 4, 6, 34, 6.9),
    ('wolfsburg-lacroix', 'Cédric Zesiger', 'DEF', 5, 'Suisse', '🇨🇭', 'wolfsburg', '€12M', 1, 2, 30, 6.7),
    ('wolfsburg-grabara', 'Kamil Grabara', 'GK', 1, 'Pologne', '🇵🇱', 'wolfsburg', '€12M', 0, 0, 32, 6.8);
  `);

  // ════════════════════════════════════════════════════
  //  É Q U I P E S  —  L I G U E  2
  // ════════════════════════════════════════════════════
  db.exec(`
    INSERT INTO teams (id, name, slug, short_name, country, flag, league_id, stadium, capacity, coach, budget, founded_year, market_value, color) VALUES
    ('metz', 'FC Metz', 'fc-metz', 'FCM', 'France', '🇫🇷', 'ligue2', 'Stade Saint-Symphorien', 28786, 'Stéphane Le Mignan', 40, 1932, '€45M', '#800000'),
    ('parisfc', 'Paris FC', 'paris-fc', 'PFC', 'France', '🇫🇷', 'ligue2', 'Stade Charléty', 20000, 'Stéphane Gilli', 35, 1969, '€38M', '#003764'),
    ('bastia', 'SC Bastia', 'sc-bastia', 'SCB', 'France', '🇫🇷', 'ligue2', 'Stade Armand-Cesari', 16500, 'Benoît Tavenot', 20, 1905, '€22M', '#003D7A'),
    ('annecy', 'FC Annecy', 'fc-annecy', 'FCA', 'France', '🇫🇷', 'ligue2', 'Parc des Sports d''Annecy', 15660, 'Laurent Guyot', 18, 1927, '€18M', '#B31B1B'),
    ('lorient', 'FC Lorient', 'fc-lorient', 'FCL', 'France', '🇫🇷', 'ligue2', 'Stade du Moustoir', 18910, 'Olivier Pantaloni', 50, 1926, '€55M', '#FF6600'),
    ('caen', 'SM Caen', 'sm-caen', 'SMC', 'France', '🇫🇷', 'ligue2', 'Stade Michel d''Ornano', 21000, 'Nicolas Seube', 25, 1913, '€25M', '#003E7E'),
    ('amiens', 'Amiens SC', 'amiens-sc', 'ASC', 'France', '🇫🇷', 'ligue2', 'Stade de la Licorne', 13000, 'Omar Daf', 20, 1901, '€20M', '#9F9F9F'),
    ('redstar', 'Red Star FC', 'red-star', 'RSFC', 'France', '🇫🇷', 'ligue2', 'Stade Bauer', 10000, 'Grégory Poirier', 15, 1897, '€15M', '#008036');
  `);

  // ════════════════════════════════════════════════════
  //  J O U E U R S  —  L I G U E  2
  // ════════════════════════════════════════════════════
  db.exec(`
    INSERT INTO players (id, name, position, number, nationality, flag, team_id, market_value, goals, assists, appearances, rating) VALUES
    -- METZ
    ('metz-sabaly', 'Cheikh Sabaly', 'FWD', 7, 'Sénégal', '🇸🇳', 'metz', '€6M', 10, 4, 33, 7.0),
    ('metz-camara', 'Lamine Camara', 'MID', 18, 'Sénégal', '🇸🇳', 'metz', '€12M', 5, 6, 34, 7.2),
    ('metz-mikautadze', 'Georges Mikautadze', 'FWD', 10, 'Géorgie', '🇬🇪', 'metz', '€15M', 12, 5, 32, 7.3),
    ('metz-nouma', 'Papa Niane', 'FWD', 9, 'Sénégal', '🇸🇳', 'metz', '€3M', 8, 3, 28, 6.7),
    ('metz-udol', 'Matthieu Udol', 'DEF', 3, 'France', '🇫🇷', 'metz', '€4M', 2, 3, 32, 6.8),
    ('metz-otch', 'Christophe Hérelle', 'DEF', 4, 'France', '🇫🇷', 'metz', '€2M', 1, 1, 30, 6.7),
    ('metz-oudjani', 'Oukidja', 'GK', 1, 'Algérie', '🇩🇿', 'metz', '€2M', 0, 0, 32, 6.8),

    -- PARIS FC
    ('pfc-kebbal', 'Ilan Kebbal', 'MID', 10, 'Algérie', '🇩🇿', 'parisfc', '€5M', 6, 10, 34, 7.2),
    ('pfc-gory', 'Aliou Gory', 'FWD', 8, 'Sénégal', '🇸🇳', 'parisfc', '€4M', 10, 4, 33, 7.0),
    ('pfc-diaby', 'Djibril Diaby', 'MID', 6, 'France', '🇫🇷', 'parisfc', '€3M', 4, 5, 31, 6.8),
    ('pfc-mimms', 'Vincent De Sanctis', 'GK', 1, 'France', '🇫🇷', 'parisfc', '€2M', 0, 0, 34, 6.9),
    ('pfc-kolodziejczak', 'Timothée Kolodziejczak', 'DEF', 5, 'France', '🇫🇷', 'parisfc', '€3M', 2, 2, 32, 6.8),
    ('pfc-mandefu', 'Alimami Gory', 'FWD', 9, 'France', '🇫🇷', 'parisfc', '€4M', 7, 3, 30, 6.9),

    -- BASTIA
    ('bastia-magri', 'Charles Magri', 'DEF', 2, 'France', '🇫🇷', 'bastia', '€2M', 1, 2, 32, 6.7),
    ('bastia-drammeh', 'Alassane Drammeh', 'MID', 8, 'Suède', '🇸🇪', 'bastia', '€3M', 5, 3, 31, 6.8),
    ('bastia-conte', 'Facinet Conte', 'FWD', 9, 'France', '🇫🇷', 'bastia', '€4M', 8, 3, 30, 6.9),
    ('bastia-tavares', 'Jocelyn Tavares', 'FWD', 7, 'France', '🇫🇷', 'bastia', '€3M', 6, 5, 32, 6.8),
    ('bastia-janvier', 'Baptiste Janvier', 'MID', 6, 'France', '🇫🇷', 'bastia', '€2M', 3, 4, 30, 6.7),
    ('bastia-placide', 'Johnny Placide', 'GK', 1, 'Haïti', '🇭🇹', 'bastia', '€1M', 0, 0, 33, 6.8),

    -- ANNECY
    ('annecy-sahi', 'Romain Sahi', 'FWD', 9, 'France', '🇫🇷', 'annecy', '€3M', 9, 3, 32, 6.8),
    ('annecy-philippe', 'Vincent Philippe', 'MID', 10, 'France', '🇫🇷', 'annecy', '€2M', 4, 6, 33, 6.8),
    ('annecy-baldé', 'Mouhamadou Baldé', 'FWD', 7, 'Sénégal', '🇸🇳', 'annecy', '€3M', 7, 4, 31, 6.9),
    ('annecy-kashi', 'Ahmed Kashi', 'MID', 6, 'Algérie', '🇩🇿', 'annecy', '€1M', 2, 3, 28, 6.6),
    ('annecy-lajugie', 'Jérémy Lajugie', 'DEF', 5, 'France', '🇫🇷', 'annecy', '€2M', 1, 2, 32, 6.7),
    ('annecy-escales', 'Thomas Escales', 'GK', 1, 'France', '🇫🇷', 'annecy', '€2M', 0, 0, 33, 6.7),

    -- LORIENT
    ('lorient-ponceau', 'Julien Ponceau', 'MID', 10, 'France', '🇫🇷', 'lorient', '€8M', 5, 8, 34, 7.1),
    ('lorient-soumano', 'Ayman Soumano', 'FWD', 7, 'France', '🇫🇷', 'lorient', '€6M', 10, 4, 32, 7.0),
    ('lorient-bamba', 'Moses Bamba', 'FWD', 9, 'Côte d''Ivoire', '🇨🇮', 'lorient', '€7M', 8, 5, 30, 6.9),
    ('lorient-abeid', 'Dembo Sylla', 'MID', 8, 'Guinée', '🇬🇳', 'lorient', '€5M', 3, 5, 32, 6.9),
    ('lorient-mendy', 'Benjamin Mendy', 'DEF', 3, 'France', '🇫🇷', 'lorient', '€4M', 1, 3, 28, 6.7),
    ('lorient-nardi', 'Alban Nardi', 'GK', 1, 'France', '🇫🇷', 'lorient', '€3M', 0, 0, 33, 6.9),

    -- CAEN
    ('caen-khidar', 'Yannis Khidar', 'FWD', 9, 'Algérie', '🇩🇿', 'caen', '€4M', 8, 3, 31, 6.9),
    ('caen-brahimi', 'Bilal Brahimi', 'MID', 10, 'France', '🇫🇷', 'caen', '€5M', 5, 6, 33, 7.0),
    ('caen-gaucho', 'Alexandre Mendy', 'FWD', 19, 'France', '🇫🇷', 'caen', '€6M', 12, 4, 32, 7.1),
    ('caen-meddah', 'Yacine Meddah', 'MID', 6, 'France', '🇫🇷', 'caen', '€3M', 3, 4, 30, 6.7),
    ('caen-lebreton', 'Romain Lebreton', 'DEF', 4, 'France', '🇫🇷', 'caen', '€2M', 1, 1, 32, 6.7),
    ('caen-mandrea', 'Yannis Mandrea', 'GK', 1, 'Algérie', '🇩🇿', 'caen', '€3M', 0, 0, 34, 6.8),

    -- AMIENS
    ('amiens-bakh', 'Khalid Bakh', 'MID', 6, 'Algérie', '🇩🇿', 'amiens', '€3M', 4, 4, 31, 6.8),
    ('amiens-sissoko', 'Moussa Sissoko', 'MID', 8, 'France', '🇫🇷', 'amiens', '€4M', 3, 5, 32, 6.9),
    ('amiens-barry', 'Abdoulahi Barry', 'FWD', 9, 'Côte d''Ivoire', '🇨🇮', 'amiens', '€3M', 7, 3, 30, 6.8),
    ('amiens-opoku', 'Paul Opoku', 'FWD', 7, 'Ghana', '🇬🇭', 'amiens', '€3M', 6, 4, 29, 6.7),
    ('amiens-fofana', 'Mohamed Fofana', 'DEF', 4, 'France', '🇫🇷', 'amiens', '€2M', 1, 1, 30, 6.6),
    ('amiens-gurtner', 'Régis Gurtner', 'GK', 1, 'France', '🇫🇷', 'amiens', '€2M', 0, 0, 34, 6.9),

    -- RED STAR
    ('redstar-durand', 'Kévin Durand', 'MID', 10, 'France', '🇫🇷', 'redstar', '€3M', 5, 5, 33, 6.9),
    ('redstar-diallo', 'Mamadou Diallo', 'FWD', 9, 'Sénégal', '🇸🇳', 'redstar', '€3M', 8, 3, 31, 6.8),
    ('redstar-benali', 'Sofiane Benali', 'MID', 6, 'France', '🇫🇷', 'redstar', '€2M', 3, 4, 30, 6.7),
    ('redstar-kemeni', 'Hervé Kemeni', 'DEF', 4, 'France', '🇫🇷', 'redstar', '€2M', 2, 1, 32, 6.6),
    ('redstar-bezek', 'Michaël Bezek', 'DEF', 5, 'France', '🇫🇷', 'redstar', '€1M', 1, 2, 31, 6.6),
    ('redstar-renot', 'Quentin Renot', 'GK', 1, 'France', '🇫🇷', 'redstar', '€1M', 0, 0, 32, 6.6);
  `);

  // ════════════════════════════════════════════════════
  //  C L A S S E M E N T S  —  L I G U E  2
  // ════════════════════════════════════════════════════
  db.exec(`
    INSERT INTO standings (id, league_id, team_id, position, played, won, drawn, lost, goals_for, goals_against, goal_difference, points, form) VALUES
    ('ligue2-1', 'ligue2', 'metz', 1, 24, 15, 5, 4, 42, 22, 20, 50, 'WWLDW'),
    ('ligue2-2', 'ligue2', 'lorient', 2, 24, 14, 6, 4, 40, 24, 16, 48, 'WDLWW'),
    ('ligue2-3', 'ligue2', 'parisfc', 3, 24, 13, 7, 4, 38, 22, 16, 46, 'WDWWL'),
    ('ligue2-4', 'ligue2', 'caen', 4, 24, 12, 5, 7, 35, 28, 7, 41, 'LWWWD'),
    ('ligue2-5', 'ligue2', 'bastia', 5, 24, 10, 8, 6, 32, 26, 6, 38, 'DWLWW'),
    ('ligue2-6', 'ligue2', 'annecy', 6, 24, 9, 6, 9, 30, 32, -2, 33, 'LWDLW'),
    ('ligue2-7', 'ligue2', 'amiens', 7, 24, 8, 5, 11, 28, 34, -6, 29, 'WLLWD'),
    ('ligue2-8', 'ligue2', 'redstar', 8, 24, 7, 6, 11, 26, 36, -10, 27, 'LDLWW');
  `);

  // ════════════════════════════════════════════════════
  //  H I S T O R I Q U E  —  L I G U E  2
  // ════════════════════════════════════════════════════
  db.exec(`
    INSERT INTO historical_standings (id, team_id, league_id, season, position, points) VALUES
    ('h-metz-2324', 'metz', 'ligue2', '2023-2024', 2, 63),
    ('h-metz-2425', 'metz', 'ligue2', '2024-2025', 5, 55),
    ('h-metz-2526', 'metz', 'ligue2', '2025-2026', 1, 50),
    ('h-parisfc-2324', 'parisfc', 'ligue2', '2023-2024', 5, 59),
    ('h-parisfc-2425', 'parisfc', 'ligue2', '2024-2025', 3, 62),
    ('h-parisfc-2526', 'parisfc', 'ligue2', '2025-2026', 3, 46),
    ('h-lorient-2324', 'lorient', 'ligue2', '2023-2024', 3, 61),
    ('h-lorient-2425', 'lorient', 'ligue2', '2024-2025', 1, 68),
    ('h-lorient-2526', 'lorient', 'ligue2', '2025-2026', 2, 48),
    ('h-caen-2324', 'caen', 'ligue2', '2023-2024', 6, 58),
    ('h-caen-2425', 'caen', 'ligue2', '2024-2025', 4, 60),
    ('h-caen-2526', 'caen', 'ligue2', '2025-2026', 4, 41),
    ('h-bastia-2324', 'bastia', 'ligue2', '2023-2024', 7, 55),
    ('h-bastia-2425', 'bastia', 'ligue2', '2024-2025', 6, 54),
    ('h-bastia-2526', 'bastia', 'ligue2', '2025-2026', 5, 38),
    ('h-annecy-2324', 'annecy', 'ligue2', '2023-2024', 10, 48),
    ('h-annecy-2425', 'annecy', 'ligue2', '2024-2025', 12, 45),
    ('h-annecy-2526', 'annecy', 'ligue2', '2025-2026', 6, 33),
    ('h-amiens-2324', 'amiens', 'ligue2', '2023-2024', 13, 44),
    ('h-amiens-2425', 'amiens', 'ligue2', '2024-2025', 15, 40),
    ('h-amiens-2526', 'amiens', 'ligue2', '2025-2026', 7, 29);
  `);

  // ════════════════════════════════════════════════════
  //  J O U E U R S  —  S E R I E   A
  // ════════════════════════════════════════════════════
  db.exec(`
    INSERT INTO players (id, name, position, number, nationality, flag, team_id, market_value, goals, assists, appearances, rating) VALUES
    -- INTER
    ('inter-lautaro', 'Lautaro Martínez', 'FWD', 10, 'Argentine', '🇦🇷', 'inter', '€100M', 22, 8, 36, 8.3),
    ('inter-thuram', 'Marcus Thuram', 'FWD', 9, 'France', '🇫🇷', 'inter', '€65M', 16, 10, 35, 7.6),
    ('inter-barella', 'Nicolò Barella', 'MID', 23, 'Italie', '🇮🇹', 'inter', '€80M', 8, 12, 36, 7.8),
    ('inter-calhanoglu', 'Hakan Çalhanoğlu', 'MID', 20, 'Turquie', '🇹🇷', 'inter', '€45M', 7, 9, 35, 7.4),
    ('inter-bastoni', 'Alessandro Bastoni', 'DEF', 95, 'Italie', '🇮🇹', 'inter', '€70M', 3, 4, 35, 7.5),
    ('inter-sommer', 'Yann Sommer', 'GK', 1, 'Suisse', '🇨🇭', 'inter', '€6M', 0, 0, 34, 7.1),

    -- AC MILAN
    ('acmilan-leao', 'Rafael Leão', 'FWD', 10, 'Portugal', '🇵🇹', 'acmilan', '€80M', 14, 12, 35, 7.5),
    ('acmilan-pulisic', 'Christian Pulisic', 'MID', 11, 'États-Unis', '🇺🇸', 'acmilan', '€45M', 10, 8, 34, 7.3),
    ('acmilan-reijnders', 'Tijjani Reijnders', 'MID', 14, 'Pays-Bas', '🇳🇱', 'acmilan', '€40M', 6, 7, 35, 7.2),
    ('acmilan-theo', 'Theo Hernández', 'DEF', 19, 'France', '🇫🇷', 'acmilan', '€55M', 5, 6, 34, 7.3),
    ('acmilan-maignan', 'Mike Maignan', 'GK', 16, 'France', '🇫🇷', 'acmilan', '€35M', 0, 0, 35, 7.4),

    -- JUVENTUS
    ('juventus-vlahovic', 'Dušan Vlahović', 'FWD', 9, 'Serbie', '🇷🇸', 'juventus', '€55M', 16, 4, 34, 7.3),
    ('juventus-yildiz', 'Kenan Yıldız', 'FWD', 10, 'Turquie', '🇹🇷', 'juventus', '€45M', 8, 6, 32, 7.1),
    ('juventus-locatelli', 'Manuel Locatelli', 'MID', 5, 'Italie', '🇮🇹', 'juventus', '€30M', 3, 5, 35, 7.0),
    ('juventus-bremer', 'Gleison Bremer', 'DEF', 3, 'Brésil', '🇧🇷', 'juventus', '€55M', 3, 1, 34, 7.3),
    ('juventus-gatti', 'Federico Gatti', 'DEF', 4, 'Italie', '🇮🇹', 'juventus', '€25M', 2, 1, 33, 7.0),
    ('juventus-perin', 'Mattia Perin', 'GK', 1, 'Italie', '🇮🇹', 'juventus', '€8M', 0, 0, 20, 6.8),

    -- NAPOLI
    ('napoli-lukaku', 'Romelu Lukaku', 'FWD', 9, 'Belgique', '🇧🇪', 'napoli', '€35M', 14, 6, 34, 7.2),
    ('napoli-kvaratskhelia', 'Khvicha Kvaratskhelia', 'FWD', 77, 'Géorgie', '🇬🇪', 'napoli', '€85M', 12, 14, 35, 7.8),
    ('napoli-lobotka', 'Stanislav Lobotka', 'MID', 68, 'Slovaquie', '🇸🇰', 'napoli', '€35M', 2, 4, 35, 7.1),
    ('napoli-ramani', 'Amir Rrahmani', 'DEF', 13, 'Kosovo', '🇽🇰', 'napoli', '€22M', 2, 1, 34, 7.0),
    ('napoli-meret', 'Alex Meret', 'GK', 1, 'Italie', '🇮🇹', 'napoli', '€15M', 0, 0, 33, 6.9),

    -- ROMA
    ('roma-dovbyk', 'Artem Dovbyk', 'FWD', 11, 'Ukraine', '🇺🇦', 'roma', '€35M', 12, 4, 33, 7.1),
    ('roma-dybala', 'Paulo Dybala', 'FWD', 21, 'Argentine', '🇦🇷', 'roma', '€20M', 10, 8, 30, 7.3),
    ('roma-paredes', 'Leandro Paredes', 'MID', 16, 'Argentine', '🇦🇷', 'roma', '€10M', 3, 5, 32, 6.9),
    ('roma-ndicka', 'Evan Ndicka', 'DEF', 5, 'Côte d''Ivoire', '🇨🇮', 'roma', '€25M', 2, 2, 34, 7.0),
    ('roma-svilar', 'Mile Svilar', 'GK', 99, 'Serbie', '🇷🇸', 'roma', '€18M', 0, 0, 34, 7.1),

    -- LAZIO
    ('lazio-noslin', 'Taty Castellanos', 'FWD', 11, 'Argentine', '🇦🇷', 'lazio', '€30M', 14, 5, 34, 7.2),
    ('lazio-zedakova', 'Mattia Zaccagni', 'MID', 10, 'Italie', '🇮🇹', 'lazio', '€25M', 8, 9, 35, 7.2),
    ('lazio-vecino', 'Matías Vecino', 'MID', 5, 'Uruguay', '🇺🇾', 'lazio', '€6M', 3, 3, 30, 6.8),
    ('lazio-romagnoli', 'Alessio Romagnoli', 'DEF', 13, 'Italie', '🇮🇹', 'lazio', '€12M', 2, 1, 33, 6.9),
    ('lazio-mandela', 'Mario Gila', 'DEF', 4, 'Espagne', '🇪🇸', 'lazio', '€20M', 1, 2, 32, 6.9),
    ('lazio-provedel', 'Ivan Provedel', 'GK', 94, 'Italie', '🇮🇹', 'lazio', '€15M', 0, 0, 34, 7.0),

    -- ATALANTA
    ('atalanta-retegui', 'Mateo Retegui', 'FWD', 32, 'Italie', '🇮🇹', 'atalanta', '€40M', 18, 5, 35, 7.5),
    ('atalanta-lookman', 'Ademola Lookman', 'FWD', 11, 'Nigeria', '🇳🇬', 'atalanta', '€55M', 14, 10, 34, 7.5),
    ('atalanta-pasalic', 'Mario Pašalić', 'MID', 8, 'Croatie', '🇭🇷', 'atalanta', '€30M', 6, 8, 35, 7.2),
    ('atalanta-hien', 'Isak Hien', 'DEF', 4, 'Suède', '🇸🇪', 'atalanta', '€25M', 1, 2, 33, 7.0),
    ('atalanta-carnesecchi', 'Marco Carnesecchi', 'GK', 29, 'Italie', '🇮🇹', 'atalanta', '€20M', 0, 0, 34, 7.1),

    -- FIORENTINA
    ('fiorentina-kean', 'Moise Kean', 'FWD', 9, 'Italie', '🇮🇹', 'fiorentina', '€25M', 12, 4, 33, 7.1),
    ('fiorentina-gudmundsson', 'Albert Gudmundsson', 'FWD', 10, 'Islande', '🇮🇸', 'fiorentina', '€35M', 10, 7, 32, 7.2),
    ('fiorentina-cataldi', 'Daniele Cataldi', 'MID', 32, 'Italie', '🇮🇹', 'fiorentina', '€6M', 2, 4, 30, 6.7),
    ('fiorentina-pongracic', 'Marin Pongračić', 'DEF', 5, 'Croatie', '🇭🇷', 'fiorentina', '€12M', 1, 1, 31, 6.8),
    ('fiorentina-gollini', 'Pierluigi Gollini', 'GK', 95, 'Italie', '🇮🇹', 'fiorentina', '€4M', 0, 0, 25, 6.7);
  `);

  // ════════════════════════════════════════════════════
  //  C L A S S E M E N T S  —  L I G U E  1
  // ════════════════════════════════════════════════════
  db.exec(`
    INSERT INTO standings (id, league_id, team_id, position, played, won, drawn, lost, goals_for, goals_against, goal_difference, points, form) VALUES
    ('ligue1-1', 'ligue1', 'psg', 1, 24, 18, 4, 2, 62, 22, 40, 58, 'WWWWD'),
    ('ligue1-2', 'ligue1', 'marseille', 2, 24, 15, 5, 4, 48, 28, 20, 50, 'WWLDW'),
    ('ligue1-3', 'ligue1', 'monaco', 3, 24, 14, 5, 5, 45, 28, 17, 47, 'LWWWD'),
    ('ligue1-4', 'ligue1', 'lyon', 4, 24, 12, 7, 5, 44, 30, 14, 43, 'WDWWL'),
    ('ligue1-5', 'ligue1', 'lille', 5, 24, 12, 6, 6, 38, 26, 12, 42, 'WDLWW'),
    ('ligue1-6', 'ligue1', 'nice', 6, 24, 10, 8, 6, 35, 28, 7, 38, 'DWDWL'),
    ('ligue1-7', 'ligue1', 'rennes', 7, 24, 10, 5, 9, 34, 32, 2, 35, 'LDLWW'),
    ('ligue1-8', 'ligue1', 'lens', 8, 24, 9, 7, 8, 30, 28, 2, 34, 'WLDWD');
  `);

  db.exec(`
    INSERT INTO standings (id, league_id, team_id, position, played, won, drawn, lost, goals_for, goals_against, goal_difference, points, form) VALUES
    ('ligue1-9', 'ligue1', 'brest', 9, 24, 8, 6, 10, 32, 38, -6, 30, 'LWLWD'),
    ('ligue1-10', 'ligue1', 'strasbourg', 10, 24, 7, 8, 9, 28, 34, -6, 29, 'DLWLD');
  `);

  // PREMIER LEAGUE STANDINGS
  db.exec(`
    INSERT INTO standings (id, league_id, team_id, position, played, won, drawn, lost, goals_for, goals_against, goal_difference, points, form) VALUES
    ('pl-1', 'premier-league', 'liverpool', 1, 26, 19, 5, 2, 62, 24, 38, 62, 'WWWDW'),
    ('pl-2', 'premier-league', 'mancity', 2, 26, 18, 5, 3, 60, 22, 38, 59, 'WDWLW'),
    ('pl-3', 'premier-league', 'arsenal', 3, 26, 17, 6, 3, 52, 20, 32, 57, 'WWLWW'),
    ('pl-4', 'premier-league', 'chelsea', 4, 26, 14, 7, 5, 48, 30, 18, 49, 'WLWWD'),
    ('pl-5', 'premier-league', 'tottenham', 5, 26, 13, 5, 8, 50, 35, 15, 44, 'LWWDL'),
    ('pl-6', 'premier-league', 'manutd', 6, 26, 12, 6, 8, 38, 32, 6, 42, 'WLWLD'),
    ('pl-7', 'premier-league', 'newcastle', 7, 26, 12, 5, 9, 42, 36, 6, 41, 'WWDWL'),
    ('pl-8', 'premier-league', 'astonvilla', 8, 26, 11, 7, 8, 40, 38, 2, 40, 'DLWWW');
  `);

  // LA LIGA STANDINGS
  db.exec(`
    INSERT INTO standings (id, league_id, team_id, position, played, won, drawn, lost, goals_for, goals_against, goal_difference, points, form) VALUES
    ('laliga-1', 'la-liga', 'realmadrid', 1, 25, 19, 4, 2, 58, 18, 40, 61, 'WWWWL'),
    ('laliga-2', 'la-liga', 'barcelona', 2, 25, 17, 5, 3, 60, 24, 36, 56, 'WWLWW'),
    ('laliga-3', 'la-liga', 'atletico', 3, 25, 15, 6, 4, 44, 20, 24, 51, 'DWLWW'),
    ('laliga-4', 'la-liga', 'athletic', 4, 25, 13, 7, 5, 38, 22, 16, 46, 'WWDWL'),
    ('laliga-5', 'la-liga', 'realsociedad', 5, 25, 11, 8, 6, 32, 24, 8, 41, 'WDLWD'),
    ('laliga-6', 'la-liga', 'villareal', 6, 25, 11, 6, 8, 42, 36, 6, 39, 'LWWLD'),
    ('laliga-7', 'la-liga', 'betis', 7, 25, 10, 7, 8, 34, 32, 2, 37, 'DWLWL'),
    ('laliga-8', 'la-liga', 'sevilla', 8, 25, 9, 6, 10, 30, 34, -4, 33, 'LDLWW');
  `);

  // BUNDESLIGA STANDINGS
  db.exec(`
    INSERT INTO standings (id, league_id, team_id, position, played, won, drawn, lost, goals_for, goals_against, goal_difference, points, form) VALUES
    ('buli-1', 'bundesliga', 'bayern', 1, 23, 18, 3, 2, 65, 20, 45, 57, 'WWWDL'),
    ('buli-2', 'bundesliga', 'leverkusen', 2, 23, 15, 6, 2, 50, 22, 28, 51, 'WDWWW'),
    ('buli-3', 'bundesliga', 'dortmund', 3, 23, 13, 5, 5, 48, 30, 18, 44, 'LWWWD'),
    ('buli-4', 'bundesliga', 'leipzig', 4, 23, 12, 6, 5, 40, 26, 14, 42, 'WWLDW'),
    ('buli-5', 'bundesliga', 'frankfurt', 5, 23, 11, 5, 7, 38, 32, 6, 38, 'WDLWW'),
    ('buli-6', 'bundesliga', 'stuttgart', 6, 23, 10, 6, 7, 36, 30, 6, 36, 'DWLWW'),
    ('buli-7', 'bundesliga', 'gladbach', 7, 23, 8, 5, 10, 32, 38, -6, 29, 'LDLWW'),
    ('buli-8', 'bundesliga', 'wolfsburg', 8, 23, 8, 4, 11, 30, 36, -6, 28, 'WLDWL');
  `);

  // SERIE A STANDINGS
  db.exec(`
    INSERT INTO standings (id, league_id, team_id, position, played, won, drawn, lost, goals_for, goals_against, goal_difference, points, form) VALUES
    ('serie-1', 'serie-a', 'inter', 1, 25, 19, 4, 2, 58, 18, 40, 61, 'WWWDW'),
    ('serie-2', 'serie-a', 'napoli', 2, 25, 17, 5, 3, 45, 20, 25, 56, 'WWLWW'),
    ('serie-3', 'serie-a', 'acmilan', 3, 25, 15, 6, 4, 48, 26, 22, 51, 'WLWWL'),
    ('serie-4', 'serie-a', 'juventus', 4, 25, 14, 7, 4, 42, 22, 20, 49, 'DWLWW'),
    ('serie-5', 'serie-a', 'atalanta', 5, 25, 13, 5, 7, 46, 30, 16, 44, 'WWLWD'),
    ('serie-6', 'serie-a', 'lazio', 6, 25, 12, 5, 8, 38, 30, 8, 41, 'WDLWW'),
    ('serie-7', 'serie-a', 'roma', 7, 25, 10, 7, 8, 36, 32, 4, 37, 'LDWLW'),
    ('serie-8', 'serie-a', 'fiorentina', 8, 25, 10, 5, 10, 34, 34, 0, 35, 'WLLWD');
  `);

  // ════════════════════════════════════════════════════
  //  H I S T O R I Q U E S  (3 dernières saisons)
  // ════════════════════════════════════════════════════
  db.exec(`
    INSERT INTO historical_standings (id, team_id, league_id, season, position, points) VALUES
    -- Ligue 1 historique
    ('h-psg-2324', 'psg', 'ligue1', '2023-2024', 1, 76),
    ('h-psg-2425', 'psg', 'ligue1', '2024-2025', 1, 80),
    ('h-psg-2526', 'psg', 'ligue1', '2025-2026', 1, 58),
    ('h-marseille-2324', 'marseille', 'ligue1', '2023-2024', 8, 50),
    ('h-marseille-2425', 'marseille', 'ligue1', '2024-2025', 2, 72),
    ('h-marseille-2526', 'marseille', 'ligue1', '2025-2026', 2, 50),
    ('h-monaco-2324', 'monaco', 'ligue1', '2023-2024', 2, 67),
    ('h-monaco-2425', 'monaco', 'ligue1', '2024-2025', 3, 65),
    ('h-monaco-2526', 'monaco', 'ligue1', '2025-2026', 3, 47),
    ('h-lyon-2324', 'lyon', 'ligue1', '2023-2024', 6, 53),
    ('h-lyon-2425', 'lyon', 'ligue1', '2024-2025', 5, 58),
    ('h-lyon-2526', 'lyon', 'ligue1', '2025-2026', 4, 43),
    ('h-lille-2324', 'lille', 'ligue1', '2023-2024', 4, 59),
    ('h-lille-2425', 'lille', 'ligue1', '2024-2025', 4, 60),
    ('h-lille-2526', 'lille', 'ligue1', '2025-2026', 5, 42),
    ('h-nice-2324', 'nice', 'ligue1', '2023-2024', 5, 55),
    ('h-nice-2425', 'nice', 'ligue1', '2024-2025', 6, 55),
    ('h-nice-2526', 'nice', 'ligue1', '2025-2026', 6, 38),

    -- Premier League historique
    ('h-mci-2324', 'mancity', 'premier-league', '2023-2024', 1, 91),
    ('h-mci-2425', 'mancity', 'premier-league', '2024-2025', 2, 85),
    ('h-mci-2526', 'mancity', 'premier-league', '2025-2026', 2, 59),
    ('h-ars-2324', 'arsenal', 'premier-league', '2023-2024', 2, 89),
    ('h-ars-2425', 'arsenal', 'premier-league', '2024-2025', 1, 89),
    ('h-ars-2526', 'arsenal', 'premier-league', '2025-2026', 3, 57),
    ('h-liv-2324', 'liverpool', 'premier-league', '2023-2024', 3, 82),
    ('h-liv-2425', 'liverpool', 'premier-league', '2024-2025', 3, 82),
    ('h-liv-2526', 'liverpool', 'premier-league', '2025-2026', 1, 62),
    ('h-che-2324', 'chelsea', 'premier-league', '2023-2024', 6, 63),
    ('h-che-2425', 'chelsea', 'premier-league', '2024-2025', 4, 70),
    ('h-che-2526', 'chelsea', 'premier-league', '2025-2026', 4, 49),
    ('h-mun-2324', 'manutd', 'premier-league', '2023-2024', 8, 60),
    ('h-mun-2425', 'manutd', 'premier-league', '2024-2025', 6, 65),
    ('h-mun-2526', 'manutd', 'premier-league', '2025-2026', 6, 42),
    ('h-tot-2324', 'tottenham', 'premier-league', '2023-2024', 5, 66),
    ('h-tot-2425', 'tottenham', 'premier-league', '2024-2025', 5, 68),
    ('h-tot-2526', 'tottenham', 'premier-league', '2025-2026', 5, 44),

    -- La Liga historique
    ('h-rma-2324', 'realmadrid', 'la-liga', '2023-2024', 1, 95),
    ('h-rma-2425', 'realmadrid', 'la-liga', '2024-2025', 1, 92),
    ('h-rma-2526', 'realmadrid', 'la-liga', '2025-2026', 1, 61),
    ('h-fcb-2324', 'barcelona', 'la-liga', '2023-2024', 2, 85),
    ('h-fcb-2425', 'barcelona', 'la-liga', '2024-2025', 2, 85),
    ('h-fcb-2526', 'barcelona', 'la-liga', '2025-2026', 2, 56),
    ('h-atm-2324', 'atletico', 'la-liga', '2023-2024', 4, 76),
    ('h-atm-2425', 'atletico', 'la-liga', '2024-2025', 3, 76),
    ('h-atm-2526', 'atletico', 'la-liga', '2025-2026', 3, 51),
    ('h-ath-2324', 'athletic', 'la-liga', '2023-2024', 5, 68),
    ('h-ath-2425', 'athletic', 'la-liga', '2024-2025', 4, 70),
    ('h-ath-2526', 'athletic', 'la-liga', '2025-2026', 4, 46),
    ('h-rso-2324', 'realsociedad', 'la-liga', '2023-2024', 6, 60),
    ('h-rso-2425', 'realsociedad', 'la-liga', '2024-2025', 5, 65),
    ('h-rso-2526', 'realsociedad', 'la-liga', '2025-2026', 5, 41),

    -- Bundesliga historique
    ('h-bayern-2324', 'bayern', 'bundesliga', '2023-2024', 3, 72),
    ('h-bayern-2425', 'bayern', 'bundesliga', '2024-2025', 1, 78),
    ('h-bayern-2526', 'bayern', 'bundesliga', '2025-2026', 1, 57),
    ('h-leverkusen-2324', 'leverkusen', 'bundesliga', '2023-2024', 1, 90),
    ('h-leverkusen-2425', 'leverkusen', 'bundesliga', '2024-2025', 2, 72),
    ('h-leverkusen-2526', 'leverkusen', 'bundesliga', '2025-2026', 2, 51),
    ('h-dortmund-2324', 'dortmund', 'bundesliga', '2023-2024', 5, 63),
    ('h-dortmund-2425', 'dortmund', 'bundesliga', '2024-2025', 4, 62),
    ('h-dortmund-2526', 'dortmund', 'bundesliga', '2025-2026', 3, 44),
    ('h-leipzig-2324', 'leipzig', 'bundesliga', '2023-2024', 4, 65),
    ('h-leipzig-2425', 'leipzig', 'bundesliga', '2024-2025', 5, 58),
    ('h-leipzig-2526', 'leipzig', 'bundesliga', '2025-2026', 4, 42),
    ('h-frankfurt-2324', 'frankfurt', 'bundesliga', '2023-2024', 6, 47),
    ('h-frankfurt-2425', 'frankfurt', 'bundesliga', '2024-2025', 6, 52),
    ('h-frankfurt-2526', 'frankfurt', 'bundesliga', '2025-2026', 5, 38),
    ('h-stuttgart-2324', 'stuttgart', 'bundesliga', '2023-2024', 2, 73),
    ('h-stuttgart-2425', 'stuttgart', 'bundesliga', '2024-2025', 3, 63),
    ('h-stuttgart-2526', 'stuttgart', 'bundesliga', '2025-2026', 6, 36),

    -- Serie A historique
    ('h-inter-2324', 'inter', 'serie-a', '2023-2024', 1, 94),
    ('h-inter-2425', 'inter', 'serie-a', '2024-2025', 1, 89),
    ('h-inter-2526', 'inter', 'serie-a', '2025-2026', 1, 61),
    ('h-napoli-2324', 'napoli', 'serie-a', '2023-2024', 10, 53),
    ('h-napoli-2425', 'napoli', 'serie-a', '2024-2025', 3, 72),
    ('h-napoli-2526', 'napoli', 'serie-a', '2025-2026', 2, 56),
    ('h-acmilan-2324', 'acmilan', 'serie-a', '2023-2024', 2, 75),
    ('h-acmilan-2425', 'acmilan', 'serie-a', '2024-2025', 4, 70),
    ('h-acmilan-2526', 'acmilan', 'serie-a', '2025-2026', 3, 51),
    ('h-juventus-2324', 'juventus', 'serie-a', '2023-2024', 3, 71),
    ('h-juventus-2425', 'juventus', 'serie-a', '2024-2025', 2, 74),
    ('h-juventus-2526', 'juventus', 'serie-a', '2025-2026', 4, 49),
    ('h-atalanta-2324', 'atalanta', 'serie-a', '2023-2024', 5, 69),
    ('h-atalanta-2425', 'atalanta', 'serie-a', '2024-2025', 5, 66),
    ('h-atalanta-2526', 'atalanta', 'serie-a', '2025-2026', 5, 44),
    ('h-lazio-2324', 'lazio', 'serie-a', '2023-2024', 7, 61),
    ('h-lazio-2425', 'lazio', 'serie-a', '2024-2025', 6, 60),
    ('h-lazio-2526', 'lazio', 'serie-a', '2025-2026', 6, 41);
  `);

  // ════════════════════════════════════════════════════
  //  T R A N S F E R T S  (mercato été 2025)
  // ════════════════════════════════════════════════════
  db.exec(`
    INSERT INTO transfers (id, player_id, from_team_id, to_team_id, date, fee, type, season) VALUES
    ('t1', 'psg-neves', NULL, 'psg', '2025-07-01', '€60M', 'transfer', '2025-2026'),
    ('t2', 'ars-raphinha', NULL, 'arsenal', '2025-07-15', '€55M', 'transfer', '2025-2026'),
    ('t3', 'fcb-olmo', NULL, 'barcelona', '2025-08-01', '€60M', 'transfer', '2025-2026'),
    ('t4', 'che-palmer', NULL, 'chelsea', '2025-06-15', '€40M', 'transfer', '2025-2026'),
    ('t5', 'rma-mbappe', 'psg', 'realmadrid', '2025-07-01', 'Gratuit', 'free', '2025-2026'),
    ('t6', 'atm-alvarez', NULL, 'atletico', '2025-07-20', '€75M', 'transfer', '2025-2026'),
    ('t7', 'mun-garnacho', NULL, 'manutd', '2024-01-15', '€15M', 'transfer', '2024-2025'),
    ('t8', 'psg-barcola', NULL, 'psg', '2024-08-01', '€45M', 'transfer', '2024-2025'),
    ('t9', 'tot-kane', NULL, 'tottenham', '2024-08-01', '€100M', 'transfer', '2024-2025'),
    ('t10', 'om-greenwood', NULL, 'marseille', '2025-08-15', '€30M', 'transfer', '2025-2026'),
    ('t11', 'new-isak', NULL, 'newcastle', '2024-07-01', '€70M', 'transfer', '2024-2025'),
    ('t12', 'fcb-yamal', NULL, 'barcelona', '2024-07-01', 'Académie', 'transfer', '2024-2025');
  `);

  console.log('Base de donnees initialisee avec succes !');
}

// Execution directe
seedDatabase();

import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const leagues = sqliteTable('leagues', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  country: text('country').notNull(),
  flag: text('flag').notNull(),
  logoUrl: text('logo_url'),
  season: text('season').notNull(),
});

export const teams = sqliteTable('teams', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  shortName: text('short_name'),
  country: text('country'),
  flag: text('flag'),
  logoUrl: text('logo_url'),
  leagueId: text('league_id').notNull().references(() => leagues.id),
  stadium: text('stadium'),
  capacity: integer('capacity'),
  coach: text('coach'),
  budget: real('budget'),
  foundedYear: integer('founded_year'),
  marketValue: text('market_value'),
  color: text('color'),
});

export const players = sqliteTable('players', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug'),
  position: text('position').notNull(), // GK, DEF, MID, FWD
  number: integer('number'),
  nationality: text('nationality'),
  flag: text('flag'),
  age: integer('age'),
  teamId: text('team_id').notNull().references(() => teams.id),
  marketValue: text('market_value'),
  goals: integer('goals').default(0),
  assists: integer('assists').default(0),
  appearances: integer('appearances').default(0),
  minutesPlayed: integer('minutes_played').default(0),
  yellowCards: integer('yellow_cards').default(0),
  redCards: integer('red_cards').default(0),
  rating: real('rating'),
});

export const matches = sqliteTable('matches', {
  id: text('id').primaryKey(),
  leagueId: text('league_id').notNull().references(() => leagues.id),
  homeTeamId: text('home_team_id').notNull().references(() => teams.id),
  awayTeamId: text('away_team_id').notNull().references(() => teams.id),
  date: text('date').notNull(),
  time: text('time'),
  round: text('round'),
  venue: text('venue'),
  status: text('status').default('upcoming'), // upcoming, live, finished
  homeScore: integer('home_score'),
  awayScore: integer('away_score'),
  homeFormation: text('home_formation'),
  awayFormation: text('away_formation'),
});

export const standings = sqliteTable('standings', {
  id: text('id').primaryKey(),
  leagueId: text('league_id').notNull().references(() => leagues.id),
  teamId: text('team_id').notNull().references(() => teams.id),
  position: integer('position').notNull(),
  played: integer('played').default(0),
  won: integer('won').default(0),
  drawn: integer('drawn').default(0),
  lost: integer('lost').default(0),
  goalsFor: integer('goals_for').default(0),
  goalsAgainst: integer('goals_against').default(0),
  goalDifference: integer('goal_difference').default(0),
  points: integer('points').default(0),
  form: text('form'), // e.g. "WWDLW"
});

export const predictions = sqliteTable('predictions', {
  id: text('id').primaryKey(),
  matchId: text('match_id').notNull().references(() => matches.id),
  predictionType: text('prediction_type').notNull(), // 1, X, 2, 1X, 12, X2
  confidence: real('confidence').notNull(),
  odds: real('odds'),
  reasoning: text('reasoning'),
  btts: text('btts'), // YES, NO
  bttsConfidence: real('btts_confidence'),
  overUnder: text('over_under'), // OVER_1_5, UNDER_1_5, etc.
  overUnderConfidence: real('over_under_confidence'),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

export const transfers = sqliteTable('transfers', {
  id: text('id').primaryKey(),
  playerId: text('player_id').notNull().references(() => players.id),
  fromTeamId: text('from_team_id').references(() => teams.id),
  toTeamId: text('to_team_id').notNull().references(() => teams.id),
  date: text('date').notNull(),
  fee: text('fee'),
  type: text('type').notNull(), // transfer, loan, free, return_from_loan
  season: text('season').notNull(),
});

export const historicalStandings = sqliteTable('historical_standings', {
  id: text('id').primaryKey(),
  teamId: text('team_id').notNull().references(() => teams.id),
  leagueId: text('league_id').notNull().references(() => leagues.id),
  season: text('season').notNull(),
  position: integer('position').notNull(),
  points: integer('points').default(0),
});

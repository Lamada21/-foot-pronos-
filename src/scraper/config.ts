export const TRANSFERMARKT_BASE = 'https://www.transfermarkt.fr';

export const SCRAPER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'no-cache',
  Pragma: 'no-cache',
  Referer: 'https://www.transfermarkt.fr/',
};

/** Mappage : slug interne → ID de compétition Transfermarkt */
export const LEAGUE_COMPETITION_IDS: Record<string, string> = {
  'ligue1': 'FR1',
  'ligue2': 'FR2',
  'premier-league': 'GB1',
  'la-liga': 'ES1',
  'bundesliga': 'L1',
  'serie-a': 'IT1',
};

/** Mappage : slug interne → slug Transfermarkt */
export const LEAGUE_TM_SLUGS: Record<string, string> = {
  'ligue1': 'ligue-1',
  'ligue2': 'ligue-2',
  'premier-league': 'premier-league',
  'la-liga': 'la-liga',
  'bundesliga': 'bundesliga',
  'serie-a': 'serie-a',
};

/** Mapping: équipe_id (DB) → club_id Transfermarkt */
export const TEAM_TM_IDS: Record<string, number> = {
  // Ligue 2
  metz: 347,
  parisfc: 370,
  bastia: 595,
  annecy: 58830,
  lorient: 1158,
  caen: 416,
  amiens: 1416,
  redstar: 1154,
  // Ligue 1
  psg: 583,
  marseille: 244,
  monaco: 162,
  lyon: 1041,
  lille: 1083,
  nice: 417,
  rennes: 273,
  lens: 1508,
  brest: 3911,
  strasbourg: 667,
  // Premier League
  mancity: 281,
  arsenal: 11,
  liverpool: 31,
  chelsea: 631,
  manutd: 985,
  tottenham: 148,
  astonvilla: 405,
  newcastle: 762,
  // La Liga
  realmadrid: 418,
  barcelona: 131,
  atletico: 13,
  athletic: 621,
  realsociedad: 681,
  betis: 150,
  villareal: 1050,
  sevilla: 368,
  // Bundesliga
  bayern: 27,
  dortmund: 267,
  leipzig: 23826,
  leverkusen: 15,
  frankfurt: 24,
  stuttgart: 79,
  gladbach: 18,
  wolfsburg: 82,
  // Serie A
  inter: 46,
  acmilan: 5,
  juventus: 506,
  napoli: 6195,
  roma: 12,
  lazio: 398,
  atalanta: 800,
  fiorentina: 430,
};

/** Mapping: équipe_id (DB) → slug Transfermarkt */
export const TEAM_TM_SLUGS: Record<string, string> = {
  // Ligue 2
  metz: 'fc-metz',
  parisfc: 'paris-fc',
  bastia: 'sc-bastia',
  annecy: 'fc-annecy',
  lorient: 'fc-lorient',
  caen: 'sm-caen',
  amiens: 'amiens-sc',
  redstar: 'red-star-fc',
  // Ligue 1
  psg: 'paris-saint-germain',
  marseille: 'olympique-marseille',
  monaco: 'as-monaco',
  lyon: 'olympique-lyon',
  lille: 'losc-lille',
  nice: 'ogc-nice',
  rennes: 'stade-rennais',
  lens: 'rc-lens',
  brest: 'stade-brestois-29',
  strasbourg: 'rc-strasbourg-alsace',
  // Premier League
  mancity: 'manchester-city',
  arsenal: 'arsenal-fc',
  liverpool: 'fc-liverpool',
  chelsea: 'fc-chelsea',
  manutd: 'manchester-united',
  tottenham: 'tottenham-hotspur',
  astonvilla: 'aston-villa',
  newcastle: 'newcastle-united',
  // La Liga
  realmadrid: 'real-madrid',
  barcelona: 'fc-barcelona',
  atletico: 'atletico-madrid',
  athletic: 'athletic-club',
  realsociedad: 'real-sociedad',
  betis: 'real-betis',
  villareal: 'villarreal-cf',
  sevilla: 'fc-sevilla',
  // Bundesliga
  bayern: 'fc-bayern-muenchen',
  dortmund: 'borussia-dortmund',
  leipzig: 'rb-leipzig',
  leverkusen: 'bayer-04-leverkusen',
  frankfurt: 'eintracht-frankfurt',
  stuttgart: 'vfb-stuttgart',
  gladbach: 'borussia-moenchengladbach',
  wolfsburg: 'vfl-wolfsburg',
  // Serie A
  inter: 'inter-mailand',
  acmilan: 'ac-mailand',
  juventus: 'juventus-turin',
  napoli: 'ssc-neapel',
  roma: 'as-rom',
  lazio: 'lazio-rom',
  atalanta: 'atalanta-bergamo',
  fiorentina: 'ac-florenz',
};

export const POSITION_MAP: Record<string, string> = {
  Gardien: 'GK',
  'Défenseur central': 'DEF',
  'Arrière gauche': 'DEF',
  'Arrière droit': 'DEF',
  'Milieu défensif': 'MID',
  'Milieu central': 'MID',
  'Milieu offensif': 'MID',
  'Ailier gauche': 'FWD',
  'Ailier droit': 'FWD',
  'Avant-centre': 'FWD',
  'Attaquant': 'FWD',
  // Versions allemandes possibles
  Torwart: 'GK',
  'Innenverteidiger': 'DEF',
  'Linker Verteidiger': 'DEF',
  'Rechter Verteidiger': 'DEF',
  'Defensives Mittelfeld': 'MID',
  'Zentrales Mittelfeld': 'MID',
  'Offensives Mittelfeld': 'MID',
  'Linker Flügel': 'FWD',
  'Rechter Flügel': 'FWD',
  'Mittelstürmer': 'FWD',
  'Stürmer': 'FWD',
  // Versions anglaises
  Goalkeeper: 'GK',
  'Centre-Back': 'DEF',
  'Left-Back': 'DEF',
  'Right-Back': 'DEF',
  'Defensive Midfield': 'MID',
  'Central Midfield': 'MID',
  'Attacking Midfield': 'MID',
  'Left Winger': 'FWD',
  'Right Winger': 'FWD',
  'Centre-Forward': 'FWD',
};

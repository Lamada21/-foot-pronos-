import { fetchPage, getText } from './client';
import { LEAGUE_TM_SLUGS, LEAGUE_COMPETITION_IDS } from './config';

export interface ScrapedTransfer {
  playerName: string;
  fromTeam: string;
  toTeam: string;
  fee: string;
  date: string;
  type: string; // 'transfer' | 'loan' | 'free'
}

/**
 * Scrape les transferts récents d'une ligue
 * URL: /{league-slug}/transfers/wettbewerb/{compId}/saison_id/{year}
 */
export async function scrapeTransfers(
  leagueSlug: string,
  season: string = '2025'
): Promise<ScrapedTransfer[]> {
  const compId = LEAGUE_COMPETITION_IDS[leagueSlug];
  const tmSlug = LEAGUE_TM_SLUGS[leagueSlug];
  if (!compId || !tmSlug) return [];

  const path = `/${tmSlug}/transfers/wettbewerb/${compId}/saison_id/${season}`;
  console.log(`[scraper] Scraping transferts: ${path}`);

  try {
    const $ = await fetchPage(path);
    const transfers: ScrapedTransfer[] = [];

    // Transfermarkt a différentes sections: arrivals (zugänge) et departures (abgänge)
    // On regarde toutes les lignes de tableau
    $('.responsive-table .items tbody tr, table.items tbody tr').each((_, row) => {
      const $row = $(row);
      const cols = $row.find('td');
      if (cols.length < 4) return;

      // Joueur
      const playerEl = $row.find('.spielprofil_tooltip, a[href*="/spieler/"]');
      const playerName = getText($, playerEl[0]);
      if (!playerName) return;

      // Clubs — la page Transfermarkt alterne arrivées (→ club), départs (club →) et prêts
      // Les logos de club sont généralement dans des balises <a> avec /verein/
      // Structure typique: [club_source] flèche [club_destination]
      const clubLinks = $row.find('a[href*="/verein/"] img[class*="flag"], a[href*="/verein/"]');
      const clubNames: string[] = [];
      clubLinks.each((_, el) => {
        const name = getText($, $(el).closest('a').length ? $(el).closest('a') : el);
        if (name && !clubNames.includes(name)) clubNames.push(name);
      });

      // Déterminer sens du transfert : si le texte contient une flèche ou '→', le premier club est la source
      const rowText = $row.text();
      const hasArrow = rowText.includes('→') || rowText.includes('->') || rowText.includes('➔');
      const isDeparture = rowText.toLowerCase().includes('départ') || rowText.toLowerCase().includes('abgang') || rowText.toLowerCase().includes('departure');

      let fromTeam = '', toTeam = '';
      if (clubNames.length >= 2) {
        if (isDeparture) {
          fromTeam = clubNames[0];
          toTeam = clubNames[1];
        } else {
          // Arrivée : le premier nom est le club d'origine, le second la destination
          fromTeam = clubNames[0];
          toTeam = clubNames[1];
        }
      } else if (clubNames.length === 1) {
        // Si un seul club, déterminer par le contexte
        if (isDeparture) {
          fromTeam = clubNames[0];
          toTeam = 'Libre';
        } else {
          fromTeam = 'N/A';
          toTeam = clubNames[0];
        }
      }

      // Montant du transfert
      const feeTexts: string[] = [];
      cols.each((_, td) => {
        const txt = $(td).text().trim();
        if (txt.includes('€') || txt.toLowerCase().includes('mio') || txt.toLowerCase().includes('gratuit') || txt.toLowerCase().includes('libre') || txt.toLowerCase().includes('prêt') || txt.toLowerCase().includes('transfert')) {
          feeTexts.push(txt);
        }
      });
      const fee = feeTexts[0] || '?';

      // Type de transfert
      let type = 'transfer';
      const lowerFee = fee.toLowerCase();
      if (lowerFee.includes('prêt') || lowerFee.includes('leihe') || lowerFee.includes('loan')) {
        type = 'loan';
      } else if (lowerFee.includes('gratuit') || lowerFee.includes('libre') || lowerFee.includes('free') || lowerFee.includes('0 €')) {
        type = 'free';
      }

      // Date (si disponible dans le texte)
      const allText = $row.text();
      const dateMatch = allText.match(/(\d{2}\.\d{2}\.\d{4})/);
      const date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];

      transfers.push({ playerName, fromTeam, toTeam, fee, date, type });
    });

    console.log(`[scraper] ${transfers.length} transferts trouvés pour ${leagueSlug}`);
    return transfers;
  } catch (err: any) {
    console.error(`[scraper] Erreur scraping transferts ${leagueSlug}: ${err.message}`);
    return [];
  }
}

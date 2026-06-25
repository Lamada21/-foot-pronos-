import axios from 'axios';
import { load } from 'cheerio';
import { TRANSFERMARKT_BASE, SCRAPER_HEADERS } from './config';

/** Type du retour de cheerio.load(), utilisé dans tous les scrapers */
export type CheerioDoc = ReturnType<typeof load>;

const client = axios.create({
  baseURL: TRANSFERMARKT_BASE,
  headers: SCRAPER_HEADERS,
  timeout: 15000,
});

/** Récupère le HTML d'une page et retourne un objet cheerio $ */
export async function fetchPage(path: string): Promise<CheerioDoc> {
  const url = path.startsWith('http') ? path : `${TRANSFERMARKT_BASE}${path}`;
  const { data } = await client.get(url);
  return load(data);
}

/** Récupère le HTML depuis une URL absolue */
export async function fetchUrl(url: string): Promise<CheerioDoc> {
  const { data } = await client.get(url);
  return load(data);
}

/** Extrait le texte d'un élément en gérant les espaces */
export function getText($: CheerioDoc, el: any): string {
  if (!el) return '';
  return $(el).text().trim().replace(/\s+/g, ' ');
}

/** Extrait un nombre depuis un texte (ex: "€200M" -> 200000000) */
export function parseMarketValue(val: string): string {
  const clean = val.replace(/[^0-9.,KMBkmb]/g, '').trim();
  if (!clean) return '';
  if (/[Bb]/.test(clean.slice(-1))) {
    const num = parseFloat(clean.replace(/[B]/gi, ''));
    return `€${(num * 1000).toFixed(0)}M`;
  }
  if (/[Mm]/.test(clean.slice(-1))) {
    return `€${clean.replace(/[M]/gi, '').trim()}M`;
  }
  if (/[Kk]/.test(clean.slice(-1))) {
    const num = parseFloat(clean.replace(/[K]/gi, ''));
    return `€${(num / 1000).toFixed(1)}M`;
  }
  return `€${clean}`;
}

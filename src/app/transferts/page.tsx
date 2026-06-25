import { dbAll } from '@/lib/db';
import { ArrowRightLeft, Euro, ArrowRight, Calendar, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default async function TransfertsPage() {
  const transfers = await dbAll(`
    SELECT tr.*, 
      tfrom.name as fromName, tfrom.flag as fromFlag, tfrom.slug as fromSlug, tfrom.league_id as fromLeagueId,
      tto.name as toName, tto.flag as toFlag, tto.slug as toSlug, tto.league_id as toLeagueId,
      p.name as playerName, p.position, p.nationality, p.flag as playerFlag
    FROM transfers tr
    JOIN players p ON tr.player_id = p.id
    LEFT JOIN teams tfrom ON tr.from_team_id = tfrom.id
    JOIN teams tto ON tr.to_team_id = tto.id
    ORDER BY tr.date DESC
  `) as any[];

  const leagues = await dbAll('SELECT * FROM leagues') as any[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3 tracking-tight">
          <ArrowRightLeft className="w-7 h-7 text-yellow-400" />
          <span className="bg-gradient-to-r from-white via-white to-gray-300 bg-clip-text text-transparent">
            Mercato & Transferts
          </span>
        </h1>
        <p className="text-gray-500 text-sm mt-1.5 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-yellow-400/60" />
          Suivi des arrivées, départs, prêts et retours de prêt — Saison 2025-2026
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl bg-gradient-to-br from-emerald-500/8 to-emerald-600/5 border border-emerald-500/15 p-4">
          <p className="text-2xl font-black text-emerald-400">{transfers.length}</p>
          <p className="text-[10px] text-gray-500 mt-1">Transferts enregistrés</p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-cyan-500/8 to-cyan-600/5 border border-cyan-500/15 p-4">
          <p className="text-2xl font-black text-cyan-400">{transfers.filter(t => t.type === 'transfer').length}</p>
          <p className="text-[10px] text-gray-500 mt-1">Transferts secs</p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-amber-500/8 to-amber-600/5 border border-amber-500/15 p-4">
          <p className="text-2xl font-black text-amber-400">{transfers.filter(t => t.type === 'loan' || t.type === 'free').length}</p>
          <p className="text-[10px] text-gray-500 mt-1">Prêts / Gratuits</p>
        </div>
      </div>

      {/* Transfers List */}
      <div className="rounded-2xl border border-white/8 backdrop-blur-xl bg-gradient-to-br from-white/[0.03] to-transparent overflow-hidden">
        <div className="bg-gradient-to-r from-white/[0.05] to-transparent px-5 py-4 border-b border-white/5">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Euro className="w-4 h-4 text-yellow-400" />
            Tous les transferts
          </h2>
        </div>
        <div className="divide-y divide-white/5">
          {transfers.map((t: any) => (
            <div key={t.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors">
              <div className="flex flex-col items-center shrink-0">
                <span className="text-[9px] text-gray-500">{t.date}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium mt-1 ${
                  t.type === 'transfer' ? 'bg-emerald-500/10 text-emerald-400' :
                  t.type === 'free' ? 'bg-amber-500/10 text-amber-400' :
                  'bg-cyan-500/10 text-cyan-400'
                }`}>
                  {t.type === 'transfer' ? 'Transfert' : t.type === 'free' ? 'Gratuit' : 'Prêt'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-right w-28">
                {t.fromFlag && <span className="text-base">{t.fromFlag}</span>}
                <span className="text-xs text-gray-400 truncate">{t.fromName || 'Libre'}</span>
              </div>

              <div className="flex items-center justify-center shrink-0">
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </div>

              <div className="flex items-center gap-1.5 w-28">
                <span className="text-base">{t.toFlag}</span>
                <span className="text-xs font-medium text-white truncate">{t.toName}</span>
              </div>

              <div className="flex-1">
                <p className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="text-base">{t.playerFlag}</span>
                  {t.playerName}
                </p>
                <p className="text-[10px] text-gray-500 capitalize">{t.position}</p>
              </div>

              {t.fee && (
                <span className="text-sm font-bold text-emerald-400 shrink-0">{t.fee}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {transfers.length === 0 && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/5 mb-4">
            <ArrowRightLeft className="w-8 h-8 text-gray-600" />
          </div>
          <p className="text-lg font-bold text-gray-300">Aucun transfert enregistré</p>
          <p className="text-sm text-gray-600 mt-1">Les données de mercato seront ajoutées prochainement.</p>
        </div>
      )}
    </div>
  );
}

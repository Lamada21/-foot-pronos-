import { notFound } from 'next/navigation';
import { dbAll, dbGet } from '@/lib/db';
import Link from 'next/link';
import { Users, Shield, ShieldHalf, Swords, Medal, Euro, ArrowLeft, Calendar, TrendingUp } from 'lucide-react';

const positionLabels: Record<string, string> = {
  GK: 'Gardiens', DEF: 'Défenseurs', MID: 'Milieux', FWD: 'Attaquants',
};

const positionColors: Record<string, string> = {
  GK: 'from-yellow-500/15 to-amber-500/5 text-yellow-300 border-yellow-500/20',
  DEF: 'from-blue-500/15 to-indigo-500/5 text-blue-300 border-blue-500/20',
  MID: 'from-green-500/15 to-emerald-500/5 text-green-300 border-green-500/20',
  FWD: 'from-red-500/15 to-rose-500/5 text-red-300 border-red-500/20',
};

export default async function TeamPage({ params }: { params: Promise<{ slug: string; teamSlug: string }> }) {
  const { slug, teamSlug } = await params;

  const team = await dbGet('SELECT * FROM teams WHERE slug = ?', teamSlug) as any;
  if (!team) notFound();

  const league = await dbGet('SELECT * FROM leagues WHERE id = ?', team.league_id) as any;

  const players = await dbAll(
    'SELECT * FROM players WHERE team_id = ? ORDER BY CASE position WHEN \'GK\' THEN 1 WHEN \'DEF\' THEN 2 WHEN \'MID\' THEN 3 WHEN \'FWD\' THEN 4 END, number',
    team.id
  ) as any[];

  const standings = await dbGet('SELECT * FROM standings WHERE team_id = ?', team.id) as any;

  const history = await dbAll(
    'SELECT * FROM historical_standings WHERE team_id = ? ORDER BY season',
    team.id
  ) as any[];

  const transfers = await dbAll(
    `SELECT tr.*, tfrom.name as fromName, tfrom.flag as fromFlag, tto.name as toName, tto.flag as toFlag
     FROM transfers tr
     LEFT JOIN teams tfrom ON tr.from_team_id = tfrom.id
     JOIN teams tto ON tr.to_team_id = tto.id
     WHERE tr.to_team_id = ? OR tr.from_team_id = ?
     ORDER BY tr.date DESC LIMIT 10`,
    team.id, team.id
  ) as any[];

  const groupedPlayers = {
    GK: players.filter(p => p.position === 'GK'),
    DEF: players.filter(p => p.position === 'DEF'),
    MID: players.filter(p => p.position === 'MID'),
    FWD: players.filter(p => p.position === 'FWD'),
  };

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link href={`/${slug}`} className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" />
        Retour au championnat
      </Link>

      {/* Message si données indisponibles */}
      {players.length === 0 && (
        <div className="rounded-2xl border border-amber-500/15 bg-gradient-to-br from-amber-500/5 to-transparent p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-4">
            <Users className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-lg font-bold text-amber-300">Données à venir</h2>
          <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
            Les données de cette équipe seront disponibles prochainement.
            Le scraping des effectifs est en cours.
          </p>
        </div>
      )}

      {players.length > 0 && (
      <>
      {/* Team Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/[0.05] via-gray-900 to-gray-950 border border-white/10 p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.03] rounded-full blur-3xl" />
        <div className="relative flex items-center gap-5">
          <span className="text-6xl drop-shadow-lg">{team.flag}</span>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-black text-white">{team.name}</h1>
            <p className="text-sm text-gray-400 mt-1">{league?.name}</p>
            <div className="flex flex-wrap gap-4 mt-3 text-xs">
              <span className="flex items-center gap-1.5 text-gray-400">
                <Users className="w-3.5 h-3.5" /> Entraîneur: <span className="text-white font-semibold">{team.coach}</span>
              </span>
              {team.stadium && (
                <span className="flex items-center gap-1.5 text-gray-400">
                  <Shield className="w-3.5 h-3.5" /> Stade: <span className="text-white">{team.stadium}</span>
                  {team.capacity && <span className="text-gray-500">({team.capacity.toLocaleString()} pl.)</span>}
                </span>
              )}
              {team.founded_year && (
                <span className="flex items-center gap-1.5 text-gray-400">
                  <Calendar className="w-3.5 h-3.5" /> Fondé en {team.founded_year}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Valeur marchande</p>
            <p className="text-lg font-bold text-emerald-400">{team.market_value || 'N/A'}</p>
            {standings && (
              <p className="text-xs text-gray-500 mt-1">
                <span className="text-white font-bold">{standings.position}e</span> place ({standings.points} pts)
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl bg-gradient-to-br from-emerald-500/8 to-emerald-600/5 border border-emerald-500/15 p-3.5 text-center">
          <p className="text-xl font-black text-emerald-400">{players.length}</p>
          <p className="text-[10px] text-gray-500">Joueurs</p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-rose-500/8 to-rose-600/5 border border-rose-500/15 p-3.5 text-center">
          <p className="text-xl font-black text-rose-400">{players.filter(p => p.position === 'FWD').length}</p>
          <p className="text-[10px] text-gray-500">Attaquants</p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-blue-500/8 to-blue-600/5 border border-blue-500/15 p-3.5 text-center">
          <p className="text-xl font-black text-blue-400">{players.filter(p => p.position === 'MID').length}</p>
          <p className="text-[10px] text-gray-500">Milieux</p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-indigo-500/8 to-indigo-600/5 border border-indigo-500/15 p-3.5 text-center">
          <p className="text-xl font-black text-indigo-400">{players.filter(p => p.position === 'DEF').length + players.filter(p => p.position === 'GK').length}</p>
          <p className="text-[10px] text-gray-500">Défenseurs + Gardiens</p>
        </div>
      </div>

      {/* Squad */}            
      <div className="rounded-2xl border border-white/8 backdrop-blur-xl bg-gradient-to-br from-white/[0.03] to-transparent overflow-hidden">
        <div className="bg-gradient-to-r from-white/[0.05] to-transparent px-5 py-4 border-b border-white/5">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" />
            Effectif Complet {players.length} joueurs
          </h2>
        </div>
        <div className="p-5 space-y-5">
          {(Object.entries(groupedPlayers) as [string, any[]][]).map(([pos, posPlayers]) => {
            if (posPlayers.length === 0) return null;
            return (
              <div key={pos}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full font-semibold border uppercase tracking-wider bg-gradient-to-r ${positionColors[pos]}`}>
                    {positionLabels[pos]}
                  </span>
                  <span className="text-[10px] text-gray-500">{posPlayers.length}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                  {posPlayers.map((p: any) => {
                    const hasStats = p.goals > 0 || p.assists > 0 || p.appearances > 0;
                    return (
                    <div key={p.id} className="flex items-center gap-3 bg-white/[0.02] rounded-xl px-3.5 py-2.5 hover:bg-white/[0.05] border border-transparent hover:border-white/5 transition-all duration-200">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                        p.position === 'GK' ? 'bg-gradient-to-br from-yellow-500/15 to-amber-500/5 text-yellow-400' :
                        p.position === 'DEF' ? 'bg-gradient-to-br from-blue-500/15 to-indigo-500/5 text-blue-400' :
                        p.position === 'MID' ? 'bg-gradient-to-br from-green-500/15 to-emerald-500/5 text-green-400' :
                        'bg-gradient-to-br from-red-500/15 to-rose-500/5 text-red-400'
                      }`}>{p.number || '-'}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-white font-medium truncate">{p.name}</p>
                        <p className="text-[9px] text-gray-500 flex items-center gap-1">
                          <span>{p.nationality}</span>
                          <span>{p.flag}</span>
                          {p.market_value && <span>• {p.market_value}</span>}
                        </p>
                        {hasStats && (
                          <div className="flex items-center gap-2 mt-1.5">
                            {p.goals > 0 && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-rose-400 bg-rose-500/8 px-1.5 py-0.5 rounded-md">
                                ⚽ {p.goals}
                              </span>
                            )}
                            {p.assists > 0 && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-blue-400 bg-blue-500/8 px-1.5 py-0.5 rounded-md">
                                🎯 {p.assists}
                              </span>
                            )}
                            {p.appearances > 0 && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-gray-400 bg-white/5 px-1.5 py-0.5 rounded-md">
                                📋 {p.appearances}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      {p.rating && (
                        <span className="text-[10px] font-bold text-emerald-400">{p.rating.toFixed(1)}</span>
                      )}
                    </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Historique */}
      {history.length > 0 && (
        <div className="rounded-2xl border border-white/8 backdrop-blur-xl bg-gradient-to-br from-white/[0.03] to-transparent overflow-hidden">
          <div className="bg-gradient-to-r from-white/[0.05] to-transparent px-5 py-4 border-b border-white/5">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              Historique 3 dernières saisons
            </h2>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-3 gap-3">
              {history.map((h: any) => (
                <div key={h.id} className="text-center p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <p className="text-[10px] text-gray-500 mb-1">{h.season}</p>
                  <p className="text-2xl font-black text-white">{h.position}e</p>
                  <p className="text-[10px] text-gray-500">{h.points} points</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Transfers */}
      {transfers.length > 0 && (
        <div className="rounded-2xl border border-white/8 backdrop-blur-xl bg-gradient-to-br from-white/[0.03] to-transparent overflow-hidden">
          <div className="bg-gradient-to-r from-white/[0.05] to-transparent px-5 py-4 border-b border-white/5">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Euro className="w-4 h-4 text-yellow-400" />
              Derniers transferts
            </h2>
          </div>
          <div className="divide-y divide-white/5">
            {transfers.map((t: any) => (
              <div key={t.id} className="flex items-center gap-3 px-5 py-3">
                <span className="text-[10px] text-gray-500">{t.date}</span>
                <span className="text-xs text-gray-400 capitalize">{t.type}</span>
                <div className="flex-1 text-xs text-gray-300">
                  {t.fromName ? `${t.fromName} →` : ''} {t.toName}
                </div>
                {t.fee && <span className="text-xs font-semibold text-emerald-400">{t.fee}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-[11px] text-gray-500">
        <span className="flex items-center gap-1.5"><ShieldHalf className="w-3 h-3 text-yellow-400" /> Gardiens</span>
        <span className="flex items-center gap-1.5"><Shield className="w-3 h-3 text-blue-400" /> Défenseurs</span>
        <span className="flex items-center gap-1.5"><Swords className="w-3 h-3 text-green-400" /> Milieux</span>
        <span className="flex items-center gap-1.5"><Medal className="w-3 h-3 text-red-400" /> Attaquants</span>
      </div>
      </>
      )}
    </div>
  );
}

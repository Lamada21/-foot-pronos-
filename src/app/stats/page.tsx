import { dbAll } from '@/lib/db';
import { Goal, TrendingUp, Medal, BarChart3, Sparkles, Search, Trophy } from 'lucide-react';
import Link from 'next/link';

interface LeagueRow { id: string; name: string; flag: string; slug: string; }
interface PlayerRow {
  name: string; goals: number; assists: number; appearances: number; rating: number;
  flag: string; teamName: string; teamFlag: string; position: string;
  leagueId: string; leagueFlag: string; leagueName: string;
}

const POSITION_LABELS: Record<string, string> = {
  GK: 'G', DEF: 'D', MID: 'M', FWD: 'A',
};

const POSITION_COLORS: Record<string, string> = {
  GK: 'text-yellow-400 bg-yellow-500/10',
  DEF: 'text-blue-400 bg-blue-500/10',
  MID: 'text-green-400 bg-green-500/10',
  FWD: 'text-rose-400 bg-rose-500/10',
};

const LEAGUE_ORDER = ['ligue1', 'premier-league', 'la-liga', 'bundesliga', 'serie-a', 'ligue2'];

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ league?: string }>;
}) {
  const { league: selectedLeague } = await searchParams;
  const leagues = await dbAll('SELECT * FROM leagues ORDER BY CASE slug ' +
    LEAGUE_ORDER.map((s, i) => `WHEN '${s}' THEN ${i}`).join(' ') + ' END'
  ) as LeagueRow[];

  const allPlayers = await dbAll(`
    SELECT p.name, p.goals, p.assists, p.appearances, p.rating, p.position, p.flag,
      t.name as teamName, t.flag as teamFlag, t.league_id as leagueId,
      l.name as leagueName, l.flag as leagueFlag
    FROM players p
    JOIN teams t ON p.team_id = t.id
    JOIN leagues l ON t.league_id = l.id
    ${selectedLeague ? 'WHERE t.league_id = ?' : ''}
    ORDER BY p.goals DESC
  `, ...(selectedLeague ? [selectedLeague] : [])) as PlayerRow[];

  const topScorers = allPlayers.slice(0, 50);
  const topAssisters = [...allPlayers].sort((a, b) => b.assists - a.assists).slice(0, 50);
  const topDecisive = [...allPlayers]
    .sort((a, b) => (b.goals + b.assists) - (a.goals + a.assists))
    .slice(0, 50);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-500/10 via-gray-900 to-gray-950 border border-white/10 p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl" />
        <div className="relative">
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3 tracking-tight">
            <BarChart3 className="w-7 h-7 text-violet-400" />
            <span className="bg-gradient-to-r from-white via-white to-gray-300 bg-clip-text text-transparent">
              Statistiques
            </span>
          </h1>
          <p className="text-gray-500 text-sm mt-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-violet-400/60" />
            Meilleurs buteurs, passeurs et joueurs décisifs
            {selectedLeague && leagues.find(l => l.id === selectedLeague) && (
              <span> — {leagues.find(l => l.id === selectedLeague)!.flag} {leagues.find(l => l.id === selectedLeague)!.name}</span>
            )}
          </p>
        </div>
      </div>

      {/* League Tabs */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/stats"
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
            !selectedLeague
              ? 'bg-violet-500/15 text-violet-300 border-violet-500/20 shadow-lg shadow-violet-500/5'
              : 'bg-white/[0.03] text-gray-400 border-white/5 hover:bg-white/[0.06] hover:text-white'
          }`}
        >
          <Search className="w-3 h-3 inline-block mr-1.5 -mt-0.5" />
          Tous
        </Link>
        {leagues.map(l => (
          <Link
            key={l.id}
            href={`/stats?league=${l.id}`}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
              selectedLeague === l.id
                ? 'bg-white/10 text-white border-white/20 shadow-lg'
                : 'bg-white/[0.03] text-gray-400 border-white/5 hover:bg-white/[0.06] hover:text-white'
            }`}
          >
            <span className="mr-1.5">{l.flag}</span>
            {l.name.split(' ')[0]}
          </Link>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ⚽ Buteurs */}
        <StatCard
          title="Meilleurs Buteurs"
          icon={<Goal className="w-4 h-4 text-rose-400" />}
          gradient="from-rose-500/5 to-transparent"
          border="border-rose-500/10"
        >
          {topScorers.length === 0 && <EmptyState />}
          {topScorers.map((p, i) => (
            <PlayerRow
              key={`${p.name}-${p.teamName}`}
              rank={i + 1}
              name={p.name}
              position={p.position}
              flag={p.flag}
              teamName={p.teamName}
              teamFlag={p.teamFlag}
              leagueFlag={p.leagueFlag}
              mainStat={p.goals}
              mainColor="text-rose-400"
              subStat={`${p.appearances} m.`}
              isTop3={i < 3}
            />
          ))}
        </StatCard>

        {/* 🎯 Passeurs */}
        <StatCard
          title="Meilleurs Passeurs"
          icon={<TrendingUp className="w-4 h-4 text-cyan-400" />}
          gradient="from-cyan-500/5 to-transparent"
          border="border-cyan-500/10"
        >
          {topAssisters.length === 0 && <EmptyState />}
          {topAssisters.map((p, i) => (
            <PlayerRow
              key={`${p.name}-${p.teamName}`}
              rank={i + 1}
              name={p.name}
              position={p.position}
              flag={p.flag}
              teamName={p.teamName}
              teamFlag={p.teamFlag}
              leagueFlag={p.leagueFlag}
              mainStat={p.assists}
              mainColor="text-cyan-400"
              subStat={`${p.appearances} m.`}
              isTop3={i < 3}
            />
          ))}
        </StatCard>

        {/* ⚡ Décisifs */}
        <StatCard
          title="Joueurs Décisifs (G+A)"
          icon={<Medal className="w-4 h-4 text-amber-400" />}
          gradient="from-amber-500/5 to-transparent"
          border="border-amber-500/10"
        >
          {topDecisive.length === 0 && <EmptyState />}
          {topDecisive.map((p, i) => (
            <PlayerRow
              key={`${p.name}-${p.teamName}`}
              rank={i + 1}
              name={p.name}
              position={p.position}
              flag={p.flag}
              teamName={p.teamName}
              teamFlag={p.teamFlag}
              leagueFlag={p.leagueFlag}
              mainStat={p.goals + p.assists}
              mainColor="text-amber-400"
              subStat={`${p.goals}+${p.assists}`}
              isTop3={i < 3}
            />
          ))}
        </StatCard>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-[11px] text-gray-500">
        <span className="flex items-center gap-1.5"><Goal className="w-3 h-3 text-rose-400" /> Buteurs</span>
        <span className="flex items-center gap-1.5"><TrendingUp className="w-3 h-3 text-cyan-400" /> Passeurs</span>
        <span className="flex items-center gap-1.5"><Medal className="w-3 h-3 text-amber-400" /> G+A</span>
        <span className="flex items-center gap-1.5"><Trophy className="w-3 h-3 text-yellow-400" /> Top 3</span>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="px-5 py-8 text-center">
      <p className="text-sm text-gray-500">Aucune donnée disponible</p>
      <p className="text-[10px] text-gray-600 mt-1">Le scraping des stats est en cours</p>
    </div>
  );
}

function StatCard({ title, icon, gradient, border, children }: {
  title: string; icon: React.ReactNode; gradient: string; border: string; children: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl border border-white/8 backdrop-blur-xl bg-gradient-to-br ${gradient} to-transparent overflow-hidden`}>
      <div className={`bg-gradient-to-r from-white/[0.04] to-transparent px-5 py-4 border-b border-white/5 sticky top-0 backdrop-blur-sm`}>
        <h2 className="text-sm font-bold text-white flex items-center gap-2">{icon}{title}</h2>
      </div>
      <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

function PlayerRow({ rank, name, position, flag, teamName, teamFlag, leagueFlag, mainStat, mainColor, subStat, isTop3 }: {
  rank: number; name: string; position: string; flag?: string; teamName: string;
  teamFlag: string; leagueFlag: string; mainStat: number; mainColor: string; subStat: string; isTop3: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 px-5 py-2.5 hover:bg-white/[0.02] transition-colors ${isTop3 ? 'bg-gradient-to-r from-yellow-500/[0.03] to-transparent' : ''}`}>
      {/* Rank badge */}
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
        rank === 1 ? 'bg-yellow-500/15 text-yellow-400' :
        rank === 2 ? 'bg-gray-400/15 text-gray-300' :
        rank === 3 ? 'bg-amber-600/15 text-amber-500' :
        'bg-white/5 text-gray-500'
      }`}>
        {rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : rank}
      </div>

      {/* Flag & position */}
      <div className="flex flex-col items-center gap-0.5 w-8 shrink-0">
        <span className="text-base leading-none">{flag || '🌍'}</span>
        <span className={`text-[8px] font-bold px-1 rounded ${POSITION_COLORS[position] || 'text-gray-500 bg-white/5'}`}>
          {POSITION_LABELS[position] || '?'}
        </span>
      </div>

      {/* Name & team */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-medium truncate">{name}</p>
        <p className="text-[10px] text-gray-500 flex items-center gap-1">
          <span>{teamFlag}</span>
          <span className="truncate">{teamName}</span>
          <span className="text-[8px] opacity-40">{leagueFlag}</span>
        </p>
      </div>

      {/* Stats */}
      <div className="flex flex-col items-end gap-0.5">
        <span className={`font-bold text-sm tabular-nums ${mainColor}`}>{mainStat}</span>
        <span className="text-[9px] text-gray-600 tabular-nums">{subStat}</span>
      </div>
    </div>
  );
}

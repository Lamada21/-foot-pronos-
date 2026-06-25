import { dbAll } from '@/lib/db';
import { Goal, TrendingUp, BarChart3, Sparkles, Medal, Trophy } from 'lucide-react';
import Link from 'next/link';

interface LeagueRow { id: string; name: string; flag: string; slug: string; }
interface PlayerRow {
  name: string; goals: number; assists: number; appearances: number; rating: number;
  playerFlag: string; teamName: string; teamFlag: string; position: string;
  leagueId: string; leagueFlag: string; leagueName: string;
}

export default async function StatsPage() {
  const leagues = await dbAll('SELECT * FROM leagues') as LeagueRow[];

  const allPlayers = await dbAll(`
    SELECT p.*, t.name as teamName, t.flag as teamFlag, t.league_id as leagueId,
      l.name as leagueName, l.flag as leagueFlag
    FROM players p
    JOIN teams t ON p.team_id = t.id
    JOIN leagues l ON t.league_id = l.id
  `) as PlayerRow[];

  const topScorers = [...allPlayers].sort((a, b) => b.goals - a.goals).slice(0, 20);
  const topAssisters = [...allPlayers].sort((a, b) => b.assists - a.assists).slice(0, 20);
  const topDecisive = [...allPlayers]
    .map(p => ({ ...p, total: p.goals + p.assists }))
    .sort((a, b) => (b.goals + b.assists) - (a.goals + a.assists))
    .slice(0, 20);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3 tracking-tight">
          <BarChart3 className="w-7 h-7 text-violet-400" />
          <span className="bg-gradient-to-r from-white via-white to-gray-300 bg-clip-text text-transparent">
            Statistiques & Classements
          </span>
        </h1>
        <p className="text-gray-500 text-sm mt-1.5 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-violet-400/60" />
          Meilleurs buteurs, passeurs et joueurs décisifs — tous championnats confondus
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ⚽ Meilleurs Buteurs */}
        <StatCard
          title="Meilleurs Buteurs"
          icon={<Goal className="w-4 h-4 text-rose-400" />}
          color="rose"
          headers={['#', 'Joueur', 'Club', 'Buts']}
        >
          {topScorers.map((p, i) => (
            <StatRow key={i} rank={i + 1} playerFlag={p.playerFlag} name={p.name}
              teamName={p.teamName} teamFlag={p.teamFlag} leagueFlag={p.leagueFlag}
              value={p.goals} color="text-rose-400" />
          ))}
        </StatCard>

        {/* 🎯 Meilleurs Passeurs */}
        <StatCard
          title="Meilleurs Passeurs"
          icon={<TrendingUp className="w-4 h-4 text-cyan-400" />}
          color="cyan"
          headers={['#', 'Joueur', 'Club', 'Passes']}
        >
          {topAssisters.map((p, i) => (
            <StatRow key={i} rank={i + 1} playerFlag={p.playerFlag} name={p.name}
              teamName={p.teamName} teamFlag={p.teamFlag} leagueFlag={p.leagueFlag}
              value={p.assists} color="text-cyan-400" />
          ))}
        </StatCard>

        {/* ⚡ Joueurs Décisifs */}
        <StatCard
          title="Joueurs Décisifs (G+A)"
          icon={<Medal className="w-4 h-4 text-amber-400" />}
          color="amber"
          headers={['#', 'Joueur', 'Club', 'Total']}
        >
          {topDecisive.map((p, i) => (
            <StatRow key={i} rank={i + 1} playerFlag={p.playerFlag} name={p.name}
              teamName={p.teamName} teamFlag={p.teamFlag} leagueFlag={p.leagueFlag}
              value={p.total} color="text-amber-400"
              subtitle={`${p.goals} buts + ${p.assists} passes`} />
          ))}
        </StatCard>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-[11px] text-gray-500">
        <span className="flex items-center gap-1.5"><Goal className="w-3 h-3 text-rose-400" /> Buteurs</span>
        <span className="flex items-center gap-1.5"><TrendingUp className="w-3 h-3 text-cyan-400" /> Passeurs</span>
        <span className="flex items-center gap-1.5"><Medal className="w-3 h-3 text-amber-400" /> G+A</span>
      </div>
    </div>
  );
}

function StatCard({ title, icon, color, headers, children }: {
  title: string; icon: React.ReactNode; color: string; headers: string[]; children: React.ReactNode;
}) {
  const borderColor = color === 'rose' ? 'border-rose-500/15' : color === 'cyan' ? 'border-cyan-500/15' : 'border-amber-500/15';
  return (
    <div className={`rounded-2xl border border-white/8 backdrop-blur-xl bg-gradient-to-br from-white/[0.03] to-transparent overflow-hidden`}>
      <div className={`bg-gradient-to-r from-white/[0.05] to-transparent px-5 py-4 border-b border-white/5`}>
        <h2 className="text-sm font-bold text-white flex items-center gap-2">{icon}{title}</h2>
      </div>
      <div className="divide-y divide-white/5">
        {children}
      </div>
    </div>
  );
}

function StatRow({ rank, playerFlag, name, teamName, teamFlag, leagueFlag, value, color, subtitle }: {
  rank: number; playerFlag?: string; name: string; teamName: string;
  teamFlag: string; leagueFlag: string; value: number; color: string; subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-2.5 hover:bg-white/[0.02] transition-colors">
      <span className="w-6 text-xs font-bold text-gray-500">{rank}</span>
      <span className="text-base shrink-0">{playerFlag || '🌍'}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-medium truncate">{name}</p>
        <p className="text-[10px] text-gray-500 flex items-center gap-1">
          <span>{teamFlag}</span>
          <span className="truncate">{teamName}</span>
          <span className="text-[9px] opacity-50">{leagueFlag}</span>
          {subtitle && <span className="ml-1 text-[8px] text-gray-600">({subtitle})</span>}
        </p>
      </div>
      <span className={`font-bold text-sm ${color}`}>{value}</span>
    </div>
  );
}

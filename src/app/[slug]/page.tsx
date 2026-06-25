import { notFound } from 'next/navigation';
import { dbAll, dbGet } from '@/lib/db';
import Link from 'next/link';
import { Trophy, Users, Goal, TrendingUp, ArrowRight, Calendar } from 'lucide-react';

const leagueConfig: Record<string, { name: string; flag: string; color: string }> = {
  'ligue1': { name: 'Ligue 1 McDonald\'s', flag: '🇫🇷', color: 'from-blue-600 to-blue-800' },
  'premier-league': { name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: 'from-purple-600 to-purple-800' },
  'la-liga': { name: 'La Liga EA Sports', flag: '🇪🇸', color: 'from-red-600 to-red-800' },
  'bundesliga': { name: 'Bundesliga', flag: '🇩🇪', color: 'from-green-600 to-green-800' },
  'serie-a': { name: 'Serie A', flag: '🇮🇹', color: 'from-cyan-600 to-cyan-800' },
  'ligue2': { name: 'Ligue 2 BKT', flag: '🇫🇷', color: 'from-yellow-600 to-yellow-800' },
};

export default async function LeaguePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const config = leagueConfig[slug];
  if (!config) notFound();

  const league = await dbGet('SELECT * FROM leagues WHERE slug = ?', slug) as any;
  if (!league) notFound();

  const standings = await dbAll(`
    SELECT s.*, t.name, t.flag, t.coach, t.stadium, t.budget, t.market_value, t.color as teamColor
    FROM standings s JOIN teams t ON s.team_id = t.id
    WHERE s.league_id = ? ORDER BY s.position
  `, league.id) as any[];

  const topScorers = await dbAll(`
    SELECT p.name, p.goals, p.assists, p.appearances, p.rating, p.position, p.flag as playerFlag, t.name as teamName, t.flag as teamFlag
    FROM players p JOIN teams t ON p.team_id = t.id
    WHERE t.league_id = ? ORDER BY p.goals DESC LIMIT 10
  `, league.id) as any[];

  const topAssisters = await dbAll(`
    SELECT p.name, p.assists, p.goals, p.appearances, p.rating, p.flag as playerFlag, t.name as teamName, t.flag as teamFlag
    FROM players p JOIN teams t ON p.team_id = t.id
    WHERE t.league_id = ? ORDER BY p.assists DESC LIMIT 10
  `, league.id) as any[];

  const topDecisive = await dbAll(`
    SELECT p.name, (p.goals + p.assists) as total, p.goals, p.assists, p.appearances, p.rating,
      p.flag as playerFlag, t.name as teamName, t.flag as teamFlag
    FROM players p JOIN teams t ON p.team_id = t.id
    WHERE t.league_id = ? ORDER BY (p.goals + p.assists) DESC LIMIT 10
  `, league.id) as any[];

  const teams = await dbAll(`
    SELECT * FROM teams WHERE league_id = ? ORDER BY name
  `, league.id) as any[];

  const history = await dbAll(`
    SELECT h.*, t.name, t.flag FROM historical_standings h
    JOIN teams t ON h.team_id = t.id
    WHERE h.league_id = ? ORDER BY h.season, h.position
  `, league.id) as any[];

  return (
    <div className="space-y-6">
      {/* League Header */}
      <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${config.color}/20 via-gray-900 to-gray-950 border border-white/10 p-6 sm:p-8`}>
        <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${config.color} opacity-5 rounded-full blur-3xl`} />
        <div className="relative flex items-center gap-4">
          <span className="text-5xl drop-shadow-lg">{config.flag}</span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">{config.name}</h1>
            <p className="text-sm text-gray-400 mt-1">Saison 2025-2026 • {standings.length} équipes</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl bg-gradient-to-br from-emerald-500/8 to-emerald-600/5 border border-emerald-500/15 p-4">
          <p className="text-2xl font-black text-emerald-400">{standings[0]?.name}</p>
          <p className="text-[10px] text-gray-500 mt-1">Leader • {standings[0]?.points} pts</p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-yellow-500/8 to-amber-600/5 border border-amber-500/15 p-4">
          <p className="text-2xl font-black text-yellow-400">{topScorers[0]?.goals}</p>
          <p className="text-[10px] text-gray-500 mt-1">Meilleur buteur • {topScorers[0]?.name}</p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-cyan-500/8 to-sky-600/5 border border-cyan-500/15 p-4">
          <p className="text-2xl font-black text-cyan-400">{topAssisters[0]?.assists}</p>
          <p className="text-[10px] text-gray-500 mt-1">Meilleur passeur • {topAssisters[0]?.name}</p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-violet-500/8 to-fuchsia-600/5 border border-violet-500/15 p-4">
          <p className="text-2xl font-black text-violet-400">{teams.length}</p>
          <p className="text-[10px] text-gray-500 mt-1">Équipes</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Standings */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-white/8 backdrop-blur-xl bg-gradient-to-br from-white/[0.03] to-transparent overflow-hidden">
            <div className="bg-gradient-to-r from-white/[0.05] to-transparent px-5 py-4 border-b border-white/5">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-400" />
                Classement
              </h2>
            </div>
            <div className="divide-y divide-white/5">
              {standings.map((s: any, i: number) => (
                <div key={s.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    s.position <= 4 ? 'bg-emerald-500/15 text-emerald-400' : 
                    s.position <= 6 ? 'bg-amber-500/10 text-amber-400' : 'bg-white/5 text-gray-500'
                  }`}>{s.position}</span>
                  <span className="text-lg">{s.flag}</span>
                  <span className="flex-1 text-sm text-white font-medium truncate">{s.name}</span>
                  <div className="hidden sm:flex items-center gap-1 text-[10px]">
                    {s.form?.split('').map((r: string, j: number) => (
                      <span key={j} className={`w-4 h-4 rounded-sm flex items-center justify-center font-bold ${
                        r === 'W' ? 'bg-emerald-500/20 text-emerald-400' :
                        r === 'D' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                      }`}>{r === 'W' ? 'V' : r === 'D' ? 'N' : 'D'}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 text-xs tabular-nums">
                    <span className="text-gray-400 w-6 text-right">{s.played}</span>
                    <span className="text-gray-400 w-6 text-right">{s.won}</span>
                    <span className="text-gray-400 w-6 text-right">{s.drawn}</span>
                    <span className="text-gray-400 w-6 text-right">{s.lost}</span>
                    <span className="text-gray-400 w-12 text-right">{s.goals_for}:{s.goals_against}</span>
                    <span className={`w-8 text-right font-bold ${
                      s.goal_difference > 0 ? 'text-emerald-400' : s.goal_difference < 0 ? 'text-red-400' : 'text-gray-400'
                    }`}>{s.goal_difference > 0 ? '+' : ''}{s.goal_difference}</span>
                    <span className="w-8 text-right font-bold text-white">{s.points}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Scorers */}
          <div className="mt-6 rounded-2xl border border-white/8 backdrop-blur-xl bg-gradient-to-br from-white/[0.03] to-transparent overflow-hidden">
            <div className="bg-gradient-to-r from-white/[0.05] to-transparent px-5 py-4 border-b border-white/5">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Goal className="w-4 h-4 text-rose-400" />
                Meilleurs Buteurs
              </h2>
            </div>
            <div className="divide-y divide-white/5">
              {topScorers.map((p: any, i: number) => (
                <div key={i} className="flex items-center gap-3 px-5 py-2.5 hover:bg-white/[0.02] transition-colors">
                  <span className="w-6 text-xs font-bold text-gray-500">{i + 1}</span>
                  <span className="text-base">{p.playerFlag}</span>
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">{p.name}</p>
                    <p className="text-[10px] text-gray-500">{p.teamName} <span className="text-xs">{p.teamFlag}</span></p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-gray-400">{p.appearances} m.</span>
                    <span className="text-rose-400 font-bold text-sm">{p.goals}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Top Assisters */}
          <div className="rounded-2xl border border-white/8 backdrop-blur-xl bg-gradient-to-br from-white/[0.03] to-transparent overflow-hidden">
            <div className="bg-gradient-to-r from-white/[0.05] to-transparent px-4 py-3 border-b border-white/5">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                Meilleurs Passeurs
              </h3>
            </div>
            <div className="divide-y divide-white/5">
              {topAssisters.map((p: any, i: number) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 hover:bg-white/[0.02]">
                  <span className="w-5 text-[10px] font-bold text-gray-500">{i + 1}</span>
                  <span className="text-sm">{p.playerFlag}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white font-medium truncate">{p.name}</p>
                  </div>
                  <span className="text-cyan-400 font-bold text-xs">{p.assists}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Decisive */}
          <div className="rounded-2xl border border-white/8 backdrop-blur-xl bg-gradient-to-br from-white/[0.03] to-transparent overflow-hidden">
            <div className="bg-gradient-to-r from-white/[0.05] to-transparent px-4 py-3 border-b border-white/5">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <ZapIcon className="w-3.5 h-3.5 text-amber-400" />
                Joueurs Décisifs (G+A)
              </h3>
            </div>
            <div className="divide-y divide-white/5">
              {topDecisive.map((p: any, i: number) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 hover:bg-white/[0.02]">
                  <span className="w-5 text-[10px] font-bold text-gray-500">{i + 1}</span>
                  <span className="text-sm">{p.playerFlag}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white font-medium truncate">{p.name}</p>
                    <p className="text-[9px] text-gray-500">{p.goals}+{p.assists}</p>
                  </div>
                  <span className="text-amber-400 font-bold text-xs">{p.total}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Teams Quick View */}
          <div className="rounded-2xl border border-white/8 backdrop-blur-xl bg-gradient-to-br from-white/[0.03] to-transparent overflow-hidden">
            <div className="bg-gradient-to-r from-white/[0.05] to-transparent px-4 py-3 border-b border-white/5">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                Équipes
              </h3>
            </div>
            <div className="divide-y divide-white/5">
              {teams.map((t: any) => (
                <Link key={t.id} href={`/${slug}/${t.slug}`}
                  className="flex items-center gap-2 px-4 py-2.5 hover:bg-white/[0.03] transition-colors group">
                  <span className="text-lg">{t.flag}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white font-medium truncate group-hover:text-emerald-300 transition-colors">{t.name}</p>
                    <p className="text-[9px] text-gray-500">{t.coach}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400">{t.market_value || 'N/A'}</p>
                  </div>
                  <ArrowRight className="w-3 h-3 text-gray-600 group-hover:text-emerald-400 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Historique 3 saisons */}
      <div className="rounded-2xl border border-white/8 backdrop-blur-xl bg-gradient-to-br from-white/[0.03] to-transparent overflow-hidden">
        <div className="bg-gradient-to-r from-white/[0.05] to-transparent px-5 py-4 border-b border-white/5">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            Historique des 3 dernières saisons
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Équipe</th>
                <th className="text-center px-3 py-3 text-gray-500 font-medium">2023-24</th>
                <th className="text-center px-3 py-3 text-gray-500 font-medium">2024-25</th>
                <th className="text-center px-3 py-3 text-gray-500 font-medium">2025-26</th>
                <th className="text-center px-3 py-3 text-gray-500 font-medium">Tendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {standings.map((s: any) => {
                const teamHistory = history.filter((h: any) => h.team_id === s.team_id);
                const pos2324 = teamHistory.find((h: any) => h.season === '2023-2024');
                const pos2425 = teamHistory.find((h: any) => h.season === '2024-2025');
                const pos2526 = teamHistory.find((h: any) => h.season === '2025-2026');
                const trend = pos2324 && pos2425 
                  ? (pos2425.position < pos2324.position ? '📈' : pos2425.position > pos2324.position ? '📉' : '➡️')
                  : '➡️';
                return (
                  <tr key={s.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2">
                        <span className="text-base">{s.flag}</span>
                        <span className="text-white font-medium">{s.name}</span>
                      </span>
                    </td>
                    <td className="text-center px-3 py-3 text-gray-400">{pos2324 ? `${pos2324.position}e` : '-'}</td>
                    <td className="text-center px-3 py-3 text-gray-400">{pos2425 ? `${pos2425.position}e` : '-'}</td>
                    <td className="text-center px-3 py-3 text-white font-bold">{pos2526 ? `${pos2526.position}e` : '-'}</td>
                    <td className="text-center px-3 py-3">{trend}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ZapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

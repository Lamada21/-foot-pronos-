import Link from 'next/link';
import { Trophy, TrendingUp, Users, Target, ArrowRight } from 'lucide-react';

const leagues = [
  {
    slug: 'ligue1', name: 'Ligue 1 McDonald\'s', country: 'France', flag: '🇫🇷',
    color: 'from-blue-600 to-blue-800', textColor: 'text-blue-400',
    description: 'Championnat de France',
    leader: 'Paris Saint-Germain', leaderPoints: 58,
    topScorer: 'Kylian Mbappé', topScorerGoals: 32,
  },
  {
    slug: 'premier-league', name: 'Premier League', country: 'Angleterre', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    color: 'from-purple-600 to-purple-800', textColor: 'text-purple-400',
    description: 'Championnat d\'Angleterre',
    leader: 'Liverpool FC', leaderPoints: 62,
    topScorer: 'Erling Haaland', topScorerGoals: 36,
  },
  {
    slug: 'la-liga', name: 'La Liga EA Sports', country: 'Espagne', flag: '🇪🇸',
    color: 'from-red-600 to-red-800', textColor: 'text-red-400',
    description: 'Championnat d\'Espagne',
    leader: 'Real Madrid', leaderPoints: 61,
    topScorer: 'Kylian Mbappé', topScorerGoals: 34,
  },
  {
    slug: 'bundesliga', name: 'Bundesliga', country: 'Allemagne', flag: '🇩🇪',
    color: 'from-green-600 to-green-800', textColor: 'text-green-400',
    description: 'Championnat d\'Allemagne',
    leader: 'FC Bayern München', leaderPoints: 57,
    topScorer: 'Harry Kane', topScorerGoals: 32,
  },
  {
    slug: 'serie-a', name: 'Serie A', country: 'Italie', flag: '🇮🇹',
    color: 'from-cyan-600 to-cyan-800', textColor: 'text-cyan-400',
    description: 'Championnat d\'Italie',
    leader: 'FC Internazionale', leaderPoints: 61,
    topScorer: 'Lautaro Martínez', topScorerGoals: 22,
  },
  {
    slug: 'ligue2', name: 'Ligue 2 BKT', country: 'France', flag: '🇫🇷',
    color: 'from-yellow-600 to-yellow-800', textColor: 'text-yellow-400',
    description: 'Championnat de France D2',
    leader: 'FC Metz', leaderPoints: 50,
    topScorer: 'Georges Mikautadze', topScorerGoals: 12,
  },
];

const championnatsAVenir: { name: string; flag: string; country: string; coming: string }[] = [];

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900/40 via-gray-900 to-blue-900/40 border border-emerald-500/10 p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse-slower" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Pronostics Football <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">2025-2026</span>
            </h1>
          </div>
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl">
            Analyse experte des 3 plus grands championnats européens. 
            Classements en direct, statistiques détaillées, meilleurs buteurs/passeurs, 
            effectifs complets et pronostics intelligents basés sur l'IA.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link href="/pronostics"
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-600/25">
              <Target className="w-4 h-4" />
              Voir les pronostics
            </Link>
            <Link href="/stats"
              className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-semibold transition-all border border-white/10">
              <TrendingUp className="w-4 h-4" />
              Statistiques
            </Link>
          </div>
        </div>
      </div>

      {/* Leagues Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {leagues.map(league => (
          <Link key={league.slug} href={`/${league.slug}`}
            className="group relative overflow-hidden rounded-2xl border border-white/8 backdrop-blur-xl bg-gradient-to-br from-white/[0.04] to-transparent p-6 transition-all duration-300 hover:border-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/5">
            <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${league.color} opacity-5 rounded-full blur-3xl group-hover:opacity-10 transition-opacity`} />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl drop-shadow-lg">{league.flag}</span>
                <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-emerald-400 transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">{league.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{league.description}</p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Leader</span>
                  <span className="text-white font-semibold">{league.leader}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Points</span>
                  <span className={`${league.textColor} font-bold`}>{league.leaderPoints}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Meilleur buteur</span>
                  <span className="text-yellow-400 font-semibold">{league.topScorer} ({league.topScorerGoals})</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {championnatsAVenir.length > 0 && (
        <div className="rounded-2xl border border-white/8 backdrop-blur-xl bg-gradient-to-br from-white/[0.02] to-transparent p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-400" />
            Championnats à venir
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {championnatsAVenir.map(c => (
              <div key={c.name} className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-3xl">{c.flag}</span>
                <div>
                  <p className="text-sm font-semibold text-white">{c.name}</p>
                  <p className="text-[10px] text-emerald-400/60">{c.coming}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

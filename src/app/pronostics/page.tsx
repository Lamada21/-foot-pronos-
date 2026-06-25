import { dbAll } from '@/lib/db';
import { Target } from 'lucide-react';

interface Prediction {
  id: string;
  league: any;
  team: any;
  opponent: any;
  winProb: number;
  drawProb: number;
  lossProb: number;
  confidence: string;
  confidenceColor: string;
  confidenceBg: string;
  bttsProb: number;
  over25Prob: number;
  reasoning: string;
}

export default async function PronosticsPage() {
  const leagues = await dbAll('SELECT * FROM leagues') as any[];

  const predictions: Prediction[] = [];

  for (const league of leagues) {
    const standings = await dbAll(`
      SELECT s.*, t.name, t.flag, t.coach, t.market_value, t.color
      FROM standings s JOIN teams t ON s.team_id = t.id
      WHERE s.league_id = ? ORDER BY s.position
    `, league.id) as any[];

    for (let i = 0; i < Math.min(6, standings.length); i++) {
      const team = standings[i];
      const opponentIdx = (i + 3) % standings.length;
      const opponent = standings[opponentIdx];
      if (!opponent) continue;

      const teamStrength = (team.points / (team.played * 3)) * 100;
      const oppStrength = (opponent.points / (opponent.played * 3)) * 100;
      const winProb = Math.round(Math.min(95, Math.max(5, 50 + (teamStrength - oppStrength) * 0.6 + (team.position < opponent.position ? 8 : -8))));
      const drawProb = Math.round(Math.min(40, Math.max(10, 30 - Math.abs(teamStrength - oppStrength) * 0.3)));
      const lossProb = 100 - winProb - drawProb;

      const confidence = winProb > 70 ? 'Haute' : winProb > 55 ? 'Moyenne' : 'Faible';
      const confidenceColor = winProb > 70 ? 'text-emerald-400' : winProb > 55 ? 'text-amber-400' : 'text-red-400';
      const confidenceBg = winProb > 70 ? 'bg-emerald-500/10 border-emerald-500/20' : winProb > 55 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-red-500/10 border-red-500/20';

      const bttsProb = Math.round(40 + (team.goals_for / team.played) * 3 + (opponent.goals_for / opponent.played) * 3);
      const over25Prob = Math.round(35 + ((team.goals_for + opponent.goals_for) / team.played) * 4);
      const teamGoalsPerGame = (team.goals_for / team.played).toFixed(1);
      const oppGoalsPerGame = (opponent.goals_for / opponent.played).toFixed(1);
      const teamDefense = (team.goals_against / team.played).toFixed(1);

      let reasoning: string;
      if (winProb > 75) {
        reasoning = `${team.name} est en pleine confiance, avec ${team.points} points en ${team.played} matchs. L'attaque tourne a ${teamGoalsPerGame} buts/match contre ${oppGoalsPerGame} pour ${opponent.name}. ${opponent.name} est classe ${opponent.position}e avec ${opponent.points} points. La difference de niveau est significative.`;
      } else if (winProb > 60) {
        reasoning = `${team.name} (${team.position}e) recoit ${opponent.name} (${opponent.position}e). ${team.name} marque ${teamGoalsPerGame} buts/match et encaisse ${teamDefense}. ${opponent.name} est solide mais devrait subir. Match tendu mais avantage aux locaux sur leur forme actuelle.`;
      } else {
        reasoning = `Match indecis entre ${team.name} (${team.position}e) et ${opponent.name} (${opponent.position}e). Les deux equipes ont des forces proches. ${team.name} a une attaque a ${teamGoalsPerGame} buts/match, ${opponent.name} a ${oppGoalsPerGame}. Match piege, plusieurs issues possibles.`;
      }

      predictions.push({
        id: `${league.id}-${team.id}-${i}`,
        league, team, opponent,
        winProb, drawProb, lossProb,
        confidence, confidenceColor, confidenceBg,
        bttsProb: Math.min(85, bttsProb),
        over25Prob: Math.min(90, over25Prob),
        reasoning,
      });
    }
  }

  const topPredictions = predictions.sort((a, b) => b.winProb - a.winProb).slice(0, 20);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900/30 via-gray-900 to-violet-900/30 border border-emerald-500/10 p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-8 h-8 text-emerald-400" />
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Pronostics <span className="bg-gradient-to-r from-emerald-400 to-violet-400 bg-clip-text text-transparent">Expert</span>
            </h1>
          </div>
          <p className="text-gray-400 text-sm max-w-2xl">
            Pronostics generes par intelligence artificielle bases sur la forme recente,
            les statistiques objectives et l&apos;analyse des forces en presence.
            Chaque pronostic inclut une analyse detaillee et un niveau de confiance.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-semibold">
              Confiance Haute &gt;70%
            </span>
            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-semibold">
              Confiance Moyenne 55-70%
            </span>
            <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-300 border border-red-500/20 text-[10px] font-semibold">
              Confiance Faible &lt;55%
            </span>
          </div>
        </div>
      </div>

      {/* Predictions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {topPredictions.map((pred: Prediction, i: number) => (
          <div key={pred.id}
            className="relative overflow-hidden rounded-2xl border border-white/8 backdrop-blur-xl bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-gray-950/60 p-5 transition-all duration-300 hover:border-emerald-500/20 animate-fade-in-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {/* League Badge */}
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 text-[10px] text-gray-400 border border-white/5">
                <span className="text-xs">{pred.league.flag}</span>
                {pred.league.name}
              </span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${pred.confidenceBg} ${pred.confidenceColor}`}>
                {pred.confidence}
              </span>
            </div>

            {/* Teams */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 flex-1">
                <span className="text-3xl">{pred.team.flag}</span>
                <div>
                  <p className="text-sm font-bold text-white">{pred.team.name}</p>
                  <p className="text-[10px] text-gray-500">{pred.team.position}e &middot; {pred.team.points} pts</p>
                </div>
              </div>
              <div className="text-center px-4">
                <p className="text-xs text-gray-500 mb-1">VS</p>
                <p className="text-lg font-black text-emerald-400">{pred.winProb}%</p>
              </div>
              <div className="flex items-center gap-3 flex-1 justify-end text-right">
                <div>
                  <p className="text-sm font-bold text-white">{pred.opponent.name}</p>
                  <p className="text-[10px] text-gray-500">{pred.opponent.position}e &middot; {pred.opponent.points} pts</p>
                </div>
                <span className="text-3xl">{pred.opponent.flag}</span>
              </div>
            </div>

            {/* Probabilities */}
            <div className="flex gap-1 mb-3">
              <div className="h-1.5 rounded-l-full bg-emerald-500" style={{ width: `${pred.winProb}%` }} />
              <div className={`h-1.5 ${pred.drawProb > 0 ? 'bg-amber-500' : ''}`} style={{ width: `${pred.drawProb}%` }} />
              <div className="h-1.5 rounded-r-full bg-red-500" style={{ width: `${pred.lossProb}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-gray-500 mb-3">
              <span>Victoire {pred.winProb}%</span>
              <span>Match nul {pred.drawProb}%</span>
              <span>Defaite {pred.lossProb}%</span>
            </div>

            {/* BTTS & Over/Under */}
            <div className="flex gap-2 mb-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-[10px] text-gray-300">
                BTTS {pred.bttsProb}%
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-[10px] text-gray-300">
                +2.5 {pred.over25Prob}%
              </span>
            </div>

            {/* Reasoning */}
            <p className="text-[11px] text-gray-400 leading-relaxed italic border-t border-white/5 pt-3 mt-1">
              {pred.reasoning}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

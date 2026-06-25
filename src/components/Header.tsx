'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Trophy, Swords, Goal, Zap, Users, Star, BarChart3, Home, ArrowRightLeft
} from 'lucide-react';

const leagues = [
  { slug: 'ligue1', label: 'Ligue 1', flag: '🇫🇷', color: 'from-blue-600 to-blue-700' },
  { slug: 'premier-league', label: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: 'from-purple-600 to-purple-700' },
  { slug: 'la-liga', label: 'La Liga', flag: '🇪🇸', color: 'from-red-600 to-red-700' },
  { slug: 'bundesliga', label: 'Bundesliga', flag: '🇩🇪', color: 'from-green-600 to-green-700' },
  { slug: 'serie-a', label: 'Serie A', flag: '🇮🇹', color: 'from-cyan-600 to-cyan-700' },
  { slug: 'ligue2', label: 'Ligue 2', flag: '🇫🇷', color: 'from-yellow-600 to-yellow-700' },
];

const navItems = [
  { href: '/', icon: Home, label: 'Accueil' },
  { href: '/pronostics', icon: Star, label: 'Pronostics' },
  { href: '/stats', icon: BarChart3, label: 'Stats' },
  { href: '/transferts', icon: ArrowRightLeft, label: 'Transferts' },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b border-white/10 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-16 gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Trophy className="w-7 h-7 text-yellow-400" />
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-white tracking-tight">FootPronos</h1>
              <p className="text-[10px] text-gray-400 -mt-0.5">Expert Pronostics Football</p>
            </div>
          </Link>

          {/* Navigation Ligue */}
          <nav className="hidden md:flex items-center gap-1 ml-auto">
            {navItems.map(item => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}

            <div className="w-px h-6 bg-white/10 mx-2" />

            {leagues.map(league => {
              const isActive = pathname === `/${league.slug}`;
              return (
                <Link
                  key={league.slug}
                  href={`/${league.slug}`}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? `bg-gradient-to-r ${league.color} text-white shadow-lg`
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="text-base">{league.flag}</span>
                  <span className="hidden lg:inline">{league.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center gap-1 ml-auto overflow-x-auto scrollbar-hide">
            {navItems.map(item => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <item.icon className="w-3 h-3" />
                  {item.label}
                </Link>
              );
            })}
            {leagues.map(league => {
              const isActive = pathname === `/${league.slug}`;
              return (
                <Link
                  key={league.slug}
                  href={`/${league.slug}`}
                  className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-semibold transition-all whitespace-nowrap ${
                    isActive ? `bg-gradient-to-r ${league.color} text-white` : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span>{league.flag}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}

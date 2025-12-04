import Link from 'next/link';
import Image from 'next/image';
import { Player } from '@/lib/types';
import { getGradeColorForBadge } from '@/lib/utils';

interface PlayerCardProps {
  player: Player;
}

export default function PlayerCard({ player }: PlayerCardProps) {
  // 保存済みのランクを使用（計算不要）
  // フォールバック: rankが未設定の場合は"F"を使用
  const overallGrade = player.rank || 'F';

  return (
    <Link href={`/players/${player.playerId}`}>
      <div className="card group h-full flex flex-col overflow-hidden bg-white hover:ring-2 hover:ring-orange-500/50 hover:shadow-2xl transition-all duration-300">
        {/* Image Container */}
        <div className="relative h-48 sm:h-56 lg:h-64 w-full overflow-hidden bg-slate-50 flex items-end justify-center pt-4">
          {/* Abstract Background Pattern */}
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#0f172a_1px,transparent_1px)] [background-size:16px_16px]"></div>
          
          {player.imageUrl ? (
            <div className="relative h-full w-full transform transition-transform duration-500 group-hover:scale-110 group-hover:translate-y-2">
                <Image
                src={player.imageUrl}
                alt={player.name}
                fill
                className="object-contain object-bottom"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-300">
              <span className="text-6xl">👤</span>
            </div>
          )}
          
          {/* Grade Badge - Positioned absolutely */}
          <div className="absolute right-4 top-4 z-10">
            <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-full shadow-xl border-4 border-white backdrop-blur-sm ${getGradeColorForBadge(overallGrade)}`}>
              <span className="text-2xl font-bold font-oswald leading-none drop-shadow-md">{overallGrade}</span>
            </div>
          </div>
          
           {/* Team Badge */}
           <div className="absolute left-4 top-4 z-10">
               <span className="inline-flex items-center rounded-md bg-white/90 px-2 py-1 text-xs font-bold text-slate-700 shadow-sm backdrop-blur-sm ring-1 ring-inset ring-slate-200">
                 {player.position}
               </span>
           </div>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col border-t border-slate-100">
          <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-1 font-oswald">
                    {player.team}
                </p>
                <h3 className="text-lg font-bold text-slate-900 font-oswald tracking-wide leading-tight group-hover:text-orange-600 transition-colors">
                    {player.name}
                </h3>
              </div>
              <div className="text-right">
                 <span className="text-2xl font-bold text-slate-200 font-oswald leading-none group-hover:text-slate-300 transition-colors">#{player.number}</span>
              </div>
          </div>

          {/* Stats Preview (Optional - if available in data) */}
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
             <div className="text-center">
                <span className="block text-[10px] uppercase text-slate-400 font-bold">PTS</span>
                <span className="block text-sm font-bold text-slate-700 font-oswald">{player.stats?.pts ?? '-'}</span>
             </div>
             <div className="text-center border-l border-slate-100">
                <span className="block text-[10px] uppercase text-slate-400 font-bold">REB</span>
                <span className="block text-sm font-bold text-slate-700 font-oswald">{player.stats?.reb ?? '-'}</span>
             </div>
             <div className="text-center border-l border-slate-100">
                <span className="block text-[10px] uppercase text-slate-400 font-bold">AST</span>
                <span className="block text-sm font-bold text-slate-700 font-oswald">{player.stats?.ast ?? '-'}</span>
             </div>
          </div>

          <div className="flex items-center justify-between pt-4 mt-auto">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <svg
                className="h-4 w-4 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                />
              </svg>
              <span>{player.reviewCount || 0}件のレビュー</span>
            </div>
            
            <span className="text-xs font-bold text-orange-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
              プロフィールを見る <span className="text-lg leading-none">›</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

import Link from 'next/link';
import Image from 'next/image';
import { Player } from '@/lib/types';
import { numberToGrade, getGradeColor } from '@/lib/utils';

interface PlayerCardProps {
  player: Player;
}

export default function PlayerCard({ player }: PlayerCardProps) {
  // 総合評価の計算
  const summaryValues = Object.values(player.summary || {});
  const overallScore =
    summaryValues.length > 0
      ? summaryValues.reduce((acc, val) => acc + val, 0) / summaryValues.length
      : 0;
  const overallGrade = numberToGrade(overallScore);

    return (
      <Link href={`/players/${player.playerId}`}>
        <div className="card group overflow-hidden transition-all duration-300 hover:scale-[1.02] h-full flex flex-col">
          <div className="relative h-32 sm:h-48 lg:h-64 w-full overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
          {player.imageUrl ? (
            <Image
              src={player.imageUrl}
              alt={player.name}
              fill
              className="object-contain transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-3xl sm:text-5xl lg:text-6xl">👤</span>
              </div>
            )}
            
            {/* 総合評価バッジ */}
            <div className="absolute right-1 top-1 sm:right-3 sm:top-3">
              <div className={`flex flex-col items-center rounded-lg px-1.5 py-1 sm:px-3 sm:py-2 shadow-lg backdrop-blur-sm border-2 ${getGradeColor(overallGrade)}`}>
                <span className="text-xs font-medium opacity-80">総合</span>
                <span className="text-sm sm:text-xl lg:text-2xl font-bold">{overallGrade}</span>
                <span className="text-xs opacity-70">{overallScore.toFixed(1)}</span>
              </div>
            </div>
        </div>

          <div className="p-3 sm:p-5 flex-1 flex flex-col">
            <h3 className="mb-1 sm:mb-2 text-sm sm:text-base lg:text-lg font-bold text-gray-900 transition-colors group-hover:text-primary line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]">
              {player.name}
            </h3>
            
            <div className="mb-2 sm:mb-3 flex flex-wrap items-center gap-1 sm:gap-2 text-xs text-gray-600">
              <span className="rounded-full bg-gray-100 px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs font-medium">
                {player.team}
              </span>
              {player.position && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs font-medium text-blue-700">
                  {player.position}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 sm:pt-3 border-t mt-auto">
              <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500">
                <svg
                  className="h-3 w-3 sm:h-4 sm:w-4"
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
                <span className="font-medium">{player.reviewCount || 0}</span>
                <span className="hidden sm:inline">件のレビュー</span>
                <span className="sm:hidden">件</span>
              </div>
              
              <span className="text-xs sm:text-sm font-medium text-primary group-hover:underline">
                <span className="hidden sm:inline">詳細を見る →</span>
                <span className="sm:hidden">詳細 →</span>
              </span>
            </div>
        </div>
      </div>
    </Link>
  );
}


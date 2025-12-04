import { getPlayers } from '@/lib/firebase/firestore';
import HomePageClient from './HomePageClient';
import Link from 'next/link';

// ISR: 5分間キャッシュ（クォータ節約のため）
export const revalidate = 300;

export default async function HomePage() {
  // サーバー側でデータを取得（ISRでキャッシュされる）
  const players = await getPlayers();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative bg-slate-900 py-24 sm:py-32 overflow-hidden">
         {/* Abstract Background */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 rounded-full bg-orange-500/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 rounded-full bg-blue-500/20 blur-3xl"></div>

        <div className="container relative mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <div className="inline-flex items-center rounded-full bg-blue-500/20 px-4 py-1.5 text-xs font-bold text-blue-300 ring-2 ring-inset ring-blue-500/30 mb-4 animate-fade-in uppercase tracking-wider">
            🧪 BETA版
          </div>
          <div className="inline-flex items-center rounded-full bg-orange-500/10 px-3 py-1 text-sm font-medium text-orange-400 ring-1 ring-inset ring-orange-500/20 mb-6 animate-fade-in">
            Next Gen Sports Analytics
          </div>
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-white sm:text-7xl font-oswald animate-fade-in">
            PLAYER REVIEW
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-300 leading-relaxed animate-fade-in delay-100">
            NBA選手のパフォーマンスを分析し、共有しよう。<br className="hidden sm:block"/>
            ファンの熱量とデータが交差する、新しいコミュニティプラットフォーム。
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 animate-fade-in delay-200">
            <Link href="#roster" className="group relative flex items-center gap-3 rounded-2xl bg-white/5 px-5 py-4 ring-1 ring-white/10 transition hover:bg-white/10">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/20 text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </div>
                <div className="text-left">
                    <div className="text-xs text-slate-400">View</div>
                    <div className="text-sm font-bold text-white">選手を見る</div>
                </div>
            </Link>

            <Link href="/about" className="group relative flex items-center gap-3 rounded-2xl bg-white/5 px-5 py-4 ring-1 ring-white/10 transition hover:bg-white/10">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                     <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </div>
                <div className="text-left">
                    <div className="text-xs text-slate-400">About</div>
                    <div className="text-sm font-bold text-white">サイトについて</div>
                </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Player List Section - Client Component */}
      <HomePageClient initialPlayers={players} />

      {/* About Teaser Section */}
      <section className="bg-white py-24 border-t border-slate-100">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 font-oswald uppercase tracking-wide mb-4">
              About Player Review
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed mb-8">
                ファンの声で選手を応援しよう。あなたの評価が選手への最高のエールになる。<br/>
                Player Reviewは、ファンの集合知による究極の選手データベースを目指しています。
            </p>
            <Link href="/about" className="text-orange-600 font-bold hover:text-orange-700 hover:underline">
                詳しく見る →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="container mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-600">
                    <span className="text-lg font-bold text-white font-oswald">PR</span>
                </div>
                <span className="text-xl font-bold text-white font-oswald tracking-wide">
                PLAYER REVIEW
                </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              NBA選手への評価や応援メッセージを自由に投稿・閲覧できるファンコミュニティサイト。
              あなたの声が、選手の力になります。
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold text-white font-oswald tracking-wider uppercase">
              About
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                  <Link href="/about" className="hover:text-orange-500 transition-colors">サイトについて</Link>
              </li>
              <li>
                  <Link href="/terms" className="hover:text-orange-500 transition-colors">利用規約</Link>
              </li>
              <li>
                  <Link href="/privacy" className="hover:text-orange-500 transition-colors">プライバシーポリシー</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold text-white font-oswald tracking-wider uppercase">Tech Stack</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                  Next.js / React
              </li>
              <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                  Firebase
              </li>
              <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                  Tailwind CSS
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800 pt-8 text-center">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Player Review. All rights reserved.
          </p>
          <p className="mt-2 text-xs text-slate-600">
            本サイトで投稿されたレビューは個人の主観的な意見であり、選手の公式評価ではありません。
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <h3 className="mb-4 text-sm font-semibold text-gray-900">
              Player Reviewについて
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              NBA選手への評価や応援メッセージを自由に投稿・閲覧できるファンコミュニティサイトです。
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-gray-900">
              ご利用にあたって
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• 匿名で気軽にレビュー投稿</li>
              <li>• 他のファンの意見を閲覧</li>
              <li>• スパム対策により安心・安全</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-gray-900">技術スタック</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Next.js / React</li>
              <li>• Firebase / Firestore</li>
              <li>• Vercel Hosting</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Player Review. All rights reserved.
          </p>
          <p className="mt-2 text-xs text-gray-400">
            本サイトで投稿されたレビューは個人の主観的な意見であり、選手の公式評価ではありません。
          </p>
        </div>
      </div>
    </footer>
  );
}


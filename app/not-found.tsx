import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8 flex justify-center">
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100">
            <span className="text-6xl">🏀</span>
          </div>
        </div>
        
        <h1 className="mb-4 text-6xl font-bold text-gray-900">404</h1>
        <h2 className="mb-6 text-2xl font-semibold text-gray-700">
          ページが見つかりません
        </h2>
        <p className="mb-8 text-gray-600">
          お探しのページは存在しないか、移動された可能性があります。
        </p>
        
        <Link href="/" className="btn-primary">
          トップページに戻る
        </Link>
      </div>
    </div>
  );
}



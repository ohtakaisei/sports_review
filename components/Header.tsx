import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2 transition-all hover:opacity-80">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
            <span className="text-xl font-bold text-white">🏀</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 sm:text-xl">
              Player Review
            </h1>
            <p className="text-xs text-gray-500">選手レビューサイト</p>
          </div>
        </Link>

        <nav className="flex items-center space-x-6">
          <Link
            href="/"
            className="text-sm font-medium text-gray-700 transition-colors hover:text-primary"
          >
            選手一覧
          </Link>
          <Link
            href="#about"
            className="text-sm font-medium text-gray-700 transition-colors hover:text-primary"
          >
            サイトについて
          </Link>
        </nav>
      </div>
    </header>
  );
}



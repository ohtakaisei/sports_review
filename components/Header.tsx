import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-200">
      <div className="container mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="group flex items-center space-x-3 transition-all hover:opacity-90">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600 shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
            <span className="text-xl font-bold text-white font-oswald">PR</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 font-oswald tracking-wide">
              PLAYER REVIEW
            </h1>
            <p className="text-[10px] font-medium text-slate-500 tracking-wider uppercase">NBA Analytics Community</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center space-x-8">
          <Link
            href="/"
            className="text-sm font-bold text-slate-600 transition-colors hover:text-orange-600 relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-orange-600 after:transition-all hover:after:w-full"
          >
            選手一覧
          </Link>
          <Link
            href="/about"
            className="text-sm font-bold text-slate-600 transition-colors hover:text-orange-600 relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-orange-600 after:transition-all hover:after:w-full"
          >
            サイトについて
          </Link>
        </nav>
        
        {/* Mobile Menu Button (simplified) */}
        <button className="md:hidden p-2 text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
        </button>
      </div>
    </header>
  );
}

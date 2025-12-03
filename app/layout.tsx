import type { Metadata } from 'next';
import { Inter, Noto_Sans_JP, Oswald } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ErrorHandler from '@/components/ErrorHandler';
// import GoogleReCaptchaProvider from '@/components/GoogleReCaptchaProvider'; // 一時的に無効化

// Load fonts
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  variable: '--font-noto-sans-jp',
  display: 'swap',
});

const oswald = Oswald({
  subsets: ['latin'],
  variable: '--font-oswald',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Player Review - NBA選手レビューサイト',
  description: 'NBA選手への評価や応援メッセージを自由に投稿・閲覧できるファンコミュニティサイト',
  keywords: ['NBA', '選手', 'レビュー', '評価', 'バスケットボール'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${inter.variable} ${notoSansJP.variable} ${oswald.variable}`}>
      <body className="min-h-screen flex flex-col font-sans antialiased bg-slate-50 text-slate-800">
        <ErrorHandler />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

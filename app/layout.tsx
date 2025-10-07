import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GoogleReCaptchaProvider from '@/components/GoogleReCaptchaProvider';

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
    <html lang="ja">
      <body className="min-h-screen flex flex-col">
        <GoogleReCaptchaProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </GoogleReCaptchaProvider>
      </body>
    </html>
  );
}

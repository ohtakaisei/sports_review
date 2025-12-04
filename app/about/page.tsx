import Link from 'next/link';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative bg-slate-900 py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 rounded-full bg-orange-500/20 blur-3xl"></div>
        <div className="container mx-auto max-w-4xl px-6 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white font-oswald mb-6 tracking-wide">
            ABOUT <span className="text-orange-500">PLAYER REVIEW</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
            NBAファンのための、次世代分析コミュニティプラットフォームへようこそ。<br />
            ここは、あなたの熱狂的な情熱と客観的な分析が交差する場所です。
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-bold">OUR MISSION</div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-oswald">
                すべてのファンの声を、<br />価値あるデータへ。
              </h2>
              <p className="text-slate-600 leading-relaxed text-lg">
                私たちは、ファン一人ひとりの視点が選手評価において重要な価値を持つと信じています。
                既存のメディアや専門家の評価だけでなく、日々試合を見守るファンの集合知こそが、
                最もリアルで多角的な選手評価を作り出します。
              </p>
              <p className="text-slate-600 leading-relaxed text-lg">
                Player Reviewは、誰でも簡単に、かつ深く選手を評価・議論できる場を提供することで、
                バスケットボール観戦の新たな楽しみ方を提案します。
              </p>
            </div>
            <div className="relative h-80 md:h-96 rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                <Image
                    src="/img/front-1.png"
                    alt="DATA x PASSION"
                    fill
                    className="object-cover"
                    priority
                />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white border-y border-slate-100">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 font-oswald mb-4">SERVICE FEATURES</h2>
            <p className="text-slate-500">Player Reviewが提供する3つのコア機能</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-all duration-300 group">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 font-oswald">16項目の詳細分析</h3>
              <p className="text-slate-600 leading-relaxed">
                オフェンス、ディフェンス、フィジカル、メンタルなど、全16項目で選手を細かく採点。
                SランクからFランクまでの評価で、選手の強みと弱みを可視化します。
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-all duration-300 group">
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 mb-6 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 font-oswald">レーダーチャート</h3>
              <p className="text-slate-600 leading-relaxed">
                集まった評価データは自動的に集計され、美しいレーダーチャートとして生成されます。
                選手のプレースタイルが一目で直感的に理解できます。
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-all duration-300 group">
              <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 font-oswald">安全な匿名コミュニティ</h3>
              <p className="text-slate-600 leading-relaxed">
                Google reCAPTCHAによるスパム対策と厳格な投稿管理により、荒らしや誹謗中傷を排除。
                純粋にバスケットボールを楽しみたいファンのための安全な空間です。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How to use Section */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mb-16">
                <h2 className="text-3xl font-bold font-oswald mb-4">HOW TO USE</h2>
                <p className="text-slate-400">サービスの使い方はとてもシンプルです</p>
            </div>
            
            <div className="space-y-24">
                {/* Step 1 */}
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="order-2 md:order-1">
                        <div className="text-orange-500 font-oswald text-6xl font-bold opacity-20 mb-4">01</div>
                        <h3 className="text-2xl font-bold mb-4">選手を探す</h3>
                        <p className="text-slate-300 leading-relaxed mb-6">
                            トップページから気になる選手を検索しましょう。<br/>
                            チーム名やポジションでフィルタリングすることも可能です。
                            お気に入りの選手が見つからない場合は、順次追加されるのをお待ちください。
                        </p>
                        <Link href="/" className="inline-flex items-center text-orange-500 font-bold hover:text-orange-400 transition-colors">
                            選手一覧を見る <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </Link>
                    </div>
                    <div className="order-1 md:order-2 bg-slate-800 rounded-2xl p-6 border border-slate-700 transform rotate-3 hover:rotate-0 transition-transform duration-500 overflow-hidden">
                         <div className="aspect-video relative rounded-lg">
                            <Image
                                src="/img/front-2.png"
                                alt="選手を探す"
                                fill
                                className="object-cover"
                            />
                         </div>
                    </div>
                </div>

                {/* Step 2 */}
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="order-1 bg-slate-800 rounded-2xl p-6 border border-slate-700 transform -rotate-3 hover:rotate-0 transition-transform duration-500 overflow-hidden">
                         <div className="aspect-video relative rounded-lg">
                            <Image
                                src="/img/front-3.png"
                                alt="評価・レビューを投稿"
                                fill
                                className="object-cover"
                            />
                         </div>
                    </div>
                    <div className="order-2">
                        <div className="text-orange-500 font-oswald text-6xl font-bold opacity-20 mb-4">02</div>
                        <h3 className="text-2xl font-bold mb-4">評価・レビューを投稿</h3>
                        <p className="text-slate-300 leading-relaxed">
                            選手ページから「レビューを書く」ボタンをクリック。<br/>
                            16項目のスライダーを動かして直感的に評価を入力し、
                            熱い応援メッセージと共に投稿してください。会員登録は不要です。
                        </p>
                    </div>
                </div>

                {/* Step 3 */}
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="order-2 md:order-1">
                        <div className="text-orange-500 font-oswald text-6xl font-bold opacity-20 mb-4">03</div>
                        <h3 className="text-2xl font-bold mb-4">チャートの変化を楽しむ</h3>
                        <p className="text-slate-300 leading-relaxed">
                            あなたの投稿が反映されると、選手のレーダーチャートや総合スコアがリアルタイムで変化します。<br/>
                            ファンの声が集まることで、より正確で深みのある選手像が浮かび上がります。
                        </p>
                    </div>
                    <div className="order-1 md:order-2 bg-slate-800 rounded-2xl p-6 border border-slate-700 transform rotate-3 hover:rotate-0 transition-transform duration-500 overflow-hidden">
                         <div className="aspect-video relative rounded-lg">
                            <Image
                                src="/img/front-4.png"
                                alt="チャートの変化を楽しむ"
                                fill
                                className="object-cover"
                            />
                         </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 text-center">
        <div className="container mx-auto max-w-3xl px-6">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 font-oswald mb-6">
                さあ、あなたの声を届けよう
            </h2>
            <p className="text-slate-600 text-lg mb-10">
                NBAの興奮をデータと熱量で共有する新しい体験がここにあります。
            </p>
            <Link 
                href="/" 
                className="inline-block bg-orange-600 text-white font-bold px-10 py-4 rounded-full text-lg hover:bg-orange-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
                今すぐ始める
            </Link>
        </div>
      </section>
    </div>
  );
}



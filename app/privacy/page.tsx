import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 sm:py-20">
      <div className="container mx-auto max-w-4xl px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 sm:p-12">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 font-oswald mb-4">プライバシーポリシー</h1>
            <p className="text-slate-500">最終更新日: {new Date().toLocaleDateString('ja-JP')}</p>
          </div>

          <div className="prose prose-slate max-w-none">
            <p className="lead">
              Player Review（以下「当サイト」といいます。）は、本ウェブサイト上で提供するサービス（以下「本サービス」といいます。）における、ユーザーの個人情報の取扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」といいます。）を定めます。
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4 pb-2 border-b border-slate-200">第1条（個人情報）</h2>
            <p>
              「個人情報」とは、個人情報保護法にいう「個人情報」を指すものとし、生存する個人に関する情報であって、当該情報に含まれる氏名、生年月日、住所、電話番号、連絡先その他の記述等により特定の個人を識別できる情報及び容貌、指紋、声紋にかかるデータ、及び健康保険証の保険者番号などの当該情報単体から特定の個人を識別できる情報（個人識別情報）を指します。
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4 pb-2 border-b border-slate-200">第2条（収集する情報）</h2>
            <p>当サイトでは、以下の情報を収集する場合があります。</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>端末情報・ログ情報:</strong> ユーザーが本サービスを利用する際に、IPアドレス、ブラウザ種類、ブラウザ言語等の情報を自動的に収集します。</li>
              <li><strong>Cookie（クッキー）:</strong> 設定内容の保存や、利用状況の分析のためにCookieを使用します。</li>
              <li><strong>投稿コンテンツ:</strong> ユーザーが投稿したレビュー内容、評価データ。</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4 pb-2 border-b border-slate-200">第3条（個人情報の利用目的）</h2>
            <p>当サイトが個人情報を収集・利用する目的は、以下のとおりです。</p>
            <ol className="list-decimal pl-5 space-y-2 mt-2">
              <li>本サービスの提供・運営のため</li>
              <li>ユーザーからのお問い合わせに回答するため（本人確認を行うことを含む）</li>
              <li>利用規約に違反したユーザーや、不正・不当な目的でサービスを利用しようとするユーザーの特定をし、ご利用をお断りするため</li>
              <li>本サービスの改善・新規サービスの開発のため</li>
              <li>上記の利用目的に付随する目的</li>
            </ol>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4 pb-2 border-b border-slate-200">第4条（利用目的の変更）</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>当サイトは、利用目的が変更前と関連性を有すると合理的に認められる場合に限り、個人情報の利用目的を変更するものとします。</li>
              <li>利用目的の変更を行った場合には、変更後の目的について、本ウェブサイト上に公表するものとします。</li>
            </ol>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4 pb-2 border-b border-slate-200">第5条（個人情報の第三者提供）</h2>
            <p>
              当サイトは、次に掲げる場合を除いて、あらかじめユーザーの同意を得ることなく、第三者に個人情報を提供することはありません。ただし、個人情報保護法その他の法令で認められる場合を除きます。
            </p>
            <ol className="list-decimal pl-5 space-y-2 mt-2">
              <li>人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難であるとき</li>
              <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって、本人の同意を得ることが困難であるとき</li>
              <li>国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがあるとき</li>
            </ol>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4 pb-2 border-b border-slate-200">第6条（外部サービスの利用）</h2>
            <h3 className="text-lg font-bold text-slate-800 mt-4 mb-2">Google Analytics</h3>
            <p>
              当サイトでは、Googleによるアクセス解析ツール「Google Analytics」を利用しています。このGoogle Analyticsはトラフィックデータの収集のためにCookieを使用しています。このトラフィックデータは匿名で収集されており、個人を特定するものではありません。この機能はCookieを無効にすることで収集を拒否することが出来ますので、お使いのブラウザの設定をご確認ください。
            </p>

            <h3 className="text-lg font-bold text-slate-800 mt-4 mb-2">Google reCAPTCHA</h3>
            <p>
              当サイトでは、スパムなどからサイトを守るため、Google reCAPTCHA v3 を利用しています。その使用には Google の<a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">プライバシーポリシー</a>と<a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">利用規約</a>が適用されます。reCAPTCHA API は、ハードウェアやソフトウェアの情報（デバイスやアプリのデータなど）を収集し、それらのデータを分析のために Google へ送信することをご理解ください。
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4 pb-2 border-b border-slate-200">第7条（プライバシーポリシーの変更）</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>本ポリシーの内容は、法令その他本ポリシーに別段の定めのある事項を除いて、ユーザーに通知することなく、変更することができるものとします。</li>
              <li>当サイトが別途定める場合を除いて、変更後のプライバシーポリシーは、本ウェブサイトに掲載したときから効力を生じるものとします。</li>
            </ol>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4 pb-2 border-b border-slate-200">第8条（お問い合わせ窓口）</h2>
            <p>本ポリシーに関するお問い合わせは、サイト内の機能等を通じてご連絡ください。</p>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-200 text-center">
            <Link href="/" className="text-orange-600 font-bold hover:text-orange-700 hover:underline">
              ホームに戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


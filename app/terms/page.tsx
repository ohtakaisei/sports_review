import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 sm:py-20">
      <div className="container mx-auto max-w-4xl px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 sm:p-12">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 font-oswald mb-4">利用規約</h1>
            <p className="text-slate-500">最終更新日: {new Date().toLocaleDateString('ja-JP')}</p>
          </div>

          <div className="prose prose-slate max-w-none">
            <p className="lead">
              この利用規約（以下「本規約」といいます。）は、Player Review（以下「当サイト」といいます。）が提供するサービス（以下「本サービス」といいます。）の利用条件を定めるものです。ユーザーの皆様（以下「ユーザー」といいます。）には、本規約に従って、本サービスをご利用いただきます。
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4 pb-2 border-b border-slate-200">第1条（適用）</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>本規約は、ユーザーと当サイトとの間の本サービスの利用に関わる一切の関係に適用されるものとします。</li>
              <li>当サイトは本サービスに関し、本規約のほか、ご利用にあたってのルール等、各種の定め（以下「個別規定」といいます。）をすることがあります。これら個別規定はその名称のいかんに関わらず、本規約の一部を構成するものとします。</li>
              <li>本規約の規定が前項の個別規定の規定と矛盾する場合には、個別規定において特段の定めなき限り、個別規定の規定が優先されるものとします。</li>
            </ol>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4 pb-2 border-b border-slate-200">第2条（サービスの利用）</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>ユーザーは、本規約および当サイトが定める方法に従って本サービスを利用するものとします。</li>
              <li>本サービスは、NBA選手の評価やレビューを投稿・閲覧するためのプラットフォームです。ユーザーは、自己の責任において本サービスを利用するものとし、投稿された内容について一切の責任を負うものとします。</li>
            </ol>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4 pb-2 border-b border-slate-200">第3条（禁止事項）</h2>
            <p>ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>法令または公序良俗に違反する行為</li>
              <li>犯罪行為に関連する行為</li>
              <li>当サイト、本サービスの他のユーザー、または第三者のサーバーまたはネットワークの機能を破壊したり、妨害したりする行為</li>
              <li>当サイトのサービスの運営を妨害するおそれのある行為</li>
              <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
              <li>不正アクセスをし、またはこれを試みる行為</li>
              <li>他のユーザーに成りすます行為</li>
              <li>当サイトのサービスに関連して、反社会的勢力に対して直接または間接に利益を供与する行為</li>
              <li>当サイト、本サービスの他のユーザー、または第三者の知的財産権、肖像権、プライバシー、名誉その他の権利または利益を侵害する行為</li>
              <li>過度に暴力的、残虐な表現を含む投稿</li>
              <li>人種、国籍、信条、性別、社会的身分、門地等による差別につながる表現を含む投稿</li>
              <li>自殺、自傷行為、薬物乱用を誘引または助長する表現を含む投稿</li>
              <li>その他、当サイトが不適切と判断する行為</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4 pb-2 border-b border-slate-200">第4条（本サービスの提供の停止等）</h2>
            <p>当サイトは、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>本サービスにかかるコンピュータシステムの保守点検または更新を行う場合</li>
              <li>地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合</li>
              <li>コンピュータまたは通信回線等が事故により停止した場合</li>
              <li>その他、当サイトが本サービスの提供が困難と判断した場合</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4 pb-2 border-b border-slate-200">第5条（投稿コンテンツの権利と利用）</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>ユーザーが本サービスに投稿したレビューや評価などのコンテンツ（以下「投稿コンテンツ」といいます。）の著作権は、当該ユーザーに帰属します。</li>
              <li>ユーザーは、投稿コンテンツについて、当サイトに対し、世界的、非独占的、無償、サブライセンス可能かつ譲渡可能な使用、複製、配布、派生著作物の作成、表示及び実行に関するライセンスを付与するものとします。</li>
              <li>ユーザーは、当サイト及び当サイトから権利を承継しまたは許諾された者に対して著作者人格権を行使しないことに同意するものとします。</li>
            </ol>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4 pb-2 border-b border-slate-200">第6条（免責事項）</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>当サイトは、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます。）がないことを明示的にも黙示的にも保証しておりません。</li>
              <li>当サイトは、本サービスに起因してユーザーに生じたあらゆる損害について、一切の責任を負いません。ただし、本サービスに関する当サイトとユーザーとの間の契約（本規約を含みます。）が消費者契約法に定める消費者契約となる場合、この免責規定は適用されません。</li>
              <li>当サイトは、本サービスに関して、ユーザーと他のユーザーまたは第三者との間において生じた取引、連絡または紛争等について一切責任を負いません。</li>
            </ol>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4 pb-2 border-b border-slate-200">第7条（利用規約の変更）</h2>
            <p>
              当サイトは、ユーザーに通知することなく、いつでも本規約を変更することができるものとします。変更後の利用規約は、本ウェブサイトに掲示されたときに効力を生じるものとします。
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4 pb-2 border-b border-slate-200">第8条（準拠法・裁判管轄）</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>本規約の解釈にあたっては、日本法を準拠法とします。</li>
              <li>本サービスに関して紛争が生じた場合には、当サイト管理者の居住地を管轄する裁判所を専属的合意管轄とします。</li>
            </ol>
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


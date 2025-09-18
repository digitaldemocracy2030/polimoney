
## Flow と Transaction の関係

Flow: サンキー図用のデータ、カテゴリごとの合計値
Transaction: 収支一覧用のデータ、各項目の詳細

Flow は Transaction から生成可能
ページ表示時に生成してもよいが、プレ生成しているのが現状

### 整合性要件

- Transaction の category ごとに Flow が存在すること（総収入は除く）
- Flow と同じ category を持つ Transaction[].amount 合計値が Flow.value になっていること


## 対応方針

下記に示す通り現状不整合が起きているが、あくまででもデータのため問題ではない
ただ Flow は動的生成できるため Transaction さえあればよく、生成処理の負荷も非常に低いはず
また今後 RDB などを使えばビューなどで処理を DB に任せることも可能

よって、サンキー図のデータは整合性が確実に担保される動的生成に変更する


## 現状

現在定義されているデータに不整合あり
※ チェック用スクリプトで確認

```plaintext
[demo-comingsoon.ts] OK
[demo-example.ts] category='寄附' の Flow が存在しません
[demo-example.ts] Flow.name='個人からの寄附' に対応する Transaction がありません
[demo-example.ts] Flow.name='総収入' に対応する Transaction がありません
[demo-example.ts] Flow.name='翌年への繰越額' に対応する Transaction がありません
[demo-example.ts] Flow.name='人件費' に対応する Transaction がありません
[demo-kokifujisaki.ts] category='前年繰越' の Flow が存在しません
[demo-kokifujisaki.ts] category='党費・会費' の Flow が存在しません
[demo-kokifujisaki.ts] category='交付金' の Flow が存在しません
[demo-kokifujisaki.ts] Flow.name='前年からの繰越額' に対応する Transaction がありません
[demo-kokifujisaki.ts] Flow.name='本年の収入額' に対応する Transaction がありません
[demo-kokifujisaki.ts] Flow.name='個人の負担する党費又は会費' に対応する Transaction がありません
[demo-kokifujisaki.ts] Flow.name='本部又は支部から供与された交付金' に対応する Transaction がありません
[demo-kokifujisaki.ts] Flow.name='総収入' に対応する Transaction がありません
[demo-kokifujisaki.ts] Flow.name='組織活動費' に対応する Transaction がありません
[demo-kokifujisaki.ts] Flow.name='翌年への繰越' に対応する Transaction がありません
[demo-ryosukeidei.ts] category='前年繰越' の Flow が存在しません
[demo-ryosukeidei.ts] category='党費・会費' の Flow が存在しません
[demo-ryosukeidei.ts] category='交付金' の Flow が存在しません
[demo-ryosukeidei.ts] category='その他収入' の Flow が存在しません
[demo-ryosukeidei.ts] category='政治活動費' の合計値不一致: Transaction合計=7723335, Flow.value=14575541
[demo-ryosukeidei.ts] Flow.name='前年からの繰越額' に対応する Transaction がありません
[demo-ryosukeidei.ts] Flow.name='個人の負担する党費又は会費' に対応する Transaction がありません
[demo-ryosukeidei.ts] Flow.name='個人からの寄附' に対応する Transaction がありません
[demo-ryosukeidei.ts] Flow.name='法人その他の団体からの寄附' に対応する Transaction がありません
[demo-ryosukeidei.ts] Flow.name='政治団体からの寄附' に対応する Transaction がありません
[demo-ryosukeidei.ts] Flow.name='本部又は支部から供与された交付金' に対応する Transaction がありません
[demo-ryosukeidei.ts] Flow.name='その他の収入' に対応する Transaction がありません
[demo-ryosukeidei.ts] Flow.name='本年の収入額' に対応する Transaction がありません
[demo-ryosukeidei.ts] Flow.name='総収入' に対応する Transaction がありません
[demo-ryosukeidei.ts] Flow.name='人件費' に対応する Transaction がありません
[demo-ryosukeidei.ts] Flow.name='光熱水費' に対応する Transaction がありません
[demo-ryosukeidei.ts] Flow.name='備品・消耗品費' に対応する Transaction がありません
[demo-ryosukeidei.ts] Flow.name='事務所費' に対応する Transaction がありません
[demo-ryosukeidei.ts] Flow.name='組織活動費' に対応する Transaction がありません
[demo-ryosukeidei.ts] Flow.name='選挙関係費' に対応する Transaction がありません
[demo-ryosukeidei.ts] Flow.name='宣伝事業費' に対応する Transaction がありません
[demo-ryosukeidei.ts] Flow.name='寄附・交付金' に対応する Transaction がありません
[demo-ryosukeidei.ts] Flow.name='翌年への繰越' に対応する Transaction がありません
[demo-takahiroanno.ts] category='組織活動費' の Flow が存在しません
[demo-takahiroanno.ts] Flow.name='総収入' に対応する Transaction がありません
[demo-takahiroanno.ts] Flow.name='事務所費' に対応する Transaction がありません
[demo-takahiroanno.ts] Flow.name='宣伝事業費' に対応する Transaction がありません
[demo-takahiroanno.ts] Flow.name='政治活動費' に対応する Transaction がありません
[demo-takahiroanno.ts] Flow.name='翌年への繰越額' に対応する Transaction がありません
```

### 計算

- 総収入はすべての income の合計、サンキー図描画の都合上、expense 扱い
- 総支出はすべての expense の合計（ただし画面上で表現はしないためデータ生成もされない）
- 翌年への繰越額は 総収入 - 総支出

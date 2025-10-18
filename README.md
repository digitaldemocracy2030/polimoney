# Polimoney

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/digitaldemocracy2030/polimoney)

Polimoney は[デジタル民主主義2030](https://dd2030.org/)の一環として、政治資金の透明性を高めるために開発されたオープンソースのプロジェクトです。政治資金収支報告書のデータを視覚化し、市民が政治資金の流れを容易に理解できるようにすることを目指しています。

### Polimoneyの目的（なんで見える化するんだっけ？）
まずデジタル民主主義2030は「技術の力で市民の声を活かし、政治をより良い形に進化させること」を目的として、「一人ひとりの声が政治・行政に届き、適切に合意形成・政策反映されていくような社会」を目指しています。

その中でPolimaneyは、政治資金がどんな目的で使われているかを見える化することで、
各政治団体や政治家がどのような方向を目指しているかを伝えられる、コミュニケーションチャネルを目指します。
また、政治資金の問題が議会で話されることで、他の議題に割く時間が減っていることは、健全ではなく、こうした状況の解決も目指します。

Polimoneyがよいコミュニケーションチャネルの一つとなり、政治資金の問題がなくなる2030年にしていきたいと思っています。

## プロダクトの方向性 v1.1

### 透明化へのアプローチ
単式簿記ではなく、複式簿記でシステムを動かすこと  
透明化できる！ではなく・・・透明化を目指してます！というロードマップとして伝える

### ペルソナ3つ
- ライト ー 政治の関心低め  
機能：見る、シェア、いいね
- ミドル ー インフルエンサー、政治家さんを応援している人、政治団体会計担当  
機能：比較議論
- ヘビー ー 会計士さん、議員さん  
機能：ダッシュボードカスタム、ダウンロード、API

### マイルストーン
- STEP1（～9/15）  
気軽に見る・シェア・SNSでのいいねができる機能。
公認バッジの実装。
- STEP2（～12/15）  
専用会計ソフトの開発・公開。
- STEP3（～3/15）  
Polimoneyから寄付できるようにする。
- STEP4（～6/15）  
人毎（議員・立候補者毎）に複数政治団体分を合計して見れるようにする。
- STEP5（～9/15）  
人と人を比較できるようにする。
- STEP6（～12/15）  
公開データのダウンロード。
公開データを取得できるAPIの公開。

## 技術スタック

### フロントエンド

- **Next.js**
- **TypeScript**

```
npm install --legacy-peer-deps
npm run dev
```

### PDFからWeb表示用のJSONを作成

** 前提条件 **

 - tools/README.md を参照して、Pythonの環境をセットアップしておく。
 - 環境変数 GOOGLE_API_KEY を設定しておく。

```bash
./scripts/create-json-for-web.sh hoge.pdf ./public/reports/hoge.json
```

### データ処理ツール

- **Python**
  - **pdf2image**
  - **LangChain**

詳細は`tools/README.md`を参照してください。

### converter

OCR処理で作成したJSONをウェブフロントエンド用のデータ構造に変換します。

```bash
# 実行例
npx tsx data/converter.ts -i data/sample_input.json -o data/sample_output.json
# エラーを無視してJSONを出力
npx tsx data/converter.ts --ignore-errors -i data/sample_input.json -o data/sample_output.json
```


## 貢献ガイドライン

このプロジェクトはオープンソース(APGLライセンス)であり、誰でも貢献することができます。
詳細は以下のドキュメントを参照してください。
- [CONTRIBUTING](CONTRIBUTING.md)
- [LICENSE](LICENSE)
- [CLA](CLA.md)
- [PROJECTS](PROJECTS.md)
- [CODE_REVIEW_GUIDELINES](CODE_REVIEW_GUIDELINES.md)
- [DEVIN_COLLABORATION](DEVIN_COLLABORATION.md)
- [ADR](docs/adr/ADR.md)

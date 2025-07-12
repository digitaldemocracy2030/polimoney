# Polimoney

Polimoney は[デジタル民主主義2030](https://dd2030.org/)の一環として、政治資金の透明性を高めるために開発されたオープンソースのプロジェクトです。政治資金収支報告書のデータを視覚化し、市民が政治資金の流れを容易に理解できるようにすることを目指しています。

## プロダクトの方向性 v1.0

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
- 短期：シェアボタン、ダッシュボードの開発（目標2025/7末） ←いまココ！
- 中期：API連携、会計ソフトの開発（半年～1年くらい？）
- 長期：ダッシュボードのカスタマイズ機能開発、クレジットカードで自動記帳、国で運営してもらう、Polimoneyから寄付できる


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

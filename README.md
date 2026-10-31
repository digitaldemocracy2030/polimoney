# Polimoney

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/digitaldemocracy2030/polimoney)

Polimoney は[デジタル民主主義2030](https://dd2030.org/)の一環として、政治資金の透明性を高めるために開発されたオープンソースのプロジェクトです。政治資金収支報告書のデータを視覚化し、市民が政治資金の流れを容易に理解できるようにすることを目指しています。

## Polimoneyの目的（なんで見える化するんだっけ？）

デジタル民主主義2030では「技術の力で市民の声を活かし、政治をより良い形に進化させること」を目的として、「一人ひとりの声が政治・行政に届き、適切に合意形成・政策反映されていくような社会」を目指しています。

その中でPolimoneyは、政治資金がどんな目的で使われているかを見える化することで、各政治団体や政治家がどのような方向を目指しているかを伝えられる、コミュニケーションチャネルを目指します。
また、政治資金の問題が議会で話されることで、他の議題に割く時間が減っていることは、健全ではなく、こうした状況の解決も目指します。

Polimoneyがよいコミュニケーションチャネルの一つとなり、政治資金の問題がなくなる2030年にしていきたいと思っています。

## プロダクトの方向性 v1.1

### 透明化へのアプローチ

単式簿記ではなく、複式簿記でシステムを動かすこと透明化できる！ではなく・・・透明化を目指してます！というロードマップとして伝える

### ペルソナ

- ライト: 政治の関心低め機能：見る、シェア、いいね
- ミドル: インフルエンサー、政治家さんを応援している人、政治団体会計担当機能：比較議論
- ヘビー: 会計士さん、議員さん機能：ダッシュボードカスタム、ダウンロード、API

### マイルストーン

- STEP1: 気軽に見る・シェア・SNSでのいいねができる機能。公認バッジの実装。
- STEP2: 専用会計ソフトの開発・公開。
- STEP3: Polimoneyから寄付できるようにする。
- STEP4: 人毎（議員・立候補者毎）に複数政治団体分を合計して見れるようにする。
- STEP5: 人と人を比較できるようにする。
- STEP6: 公開データのダウンロード。公開データを取得できるAPIの公開。

## 技術情報

### Getting Started

```bash
npm install --legacy-peer-deps
npm run dev
```

### プロジェクト構成

```text
polimoney/
├── app/                  # Next.js App Router のページ
├── components/           # React コンポーネント
├── data/                 # 政治家・政治資金・選挙収支のデータ
├── models/               # TypeScript 型定義
├── public/               # 静的アセット
├── utils/                # データ変換・集計ユーティリティ
├── docs/                 # ドキュメント
├── next.config.ts        # Next.js 設定
├── biome.json            # Biome 設定
└── package.json          # npm scripts / 依存関係
```

### 主なページ

- `/` - トップページ
- `/politicians` - 政治家一覧
- `/politicians/[politicianId]` - 政治家詳細
- `/politicians/[politicianId]/political/[dataId]` - 政治資金収支報告
- `/politicians/[politicianId]/election/[dataId]` - 選挙運動費用収支報告

### データの追加・更新

政治家一覧に表示する情報は `data/politician-master.ts` で管理しています。

政治資金収支報告のデータは `data/demo-*.ts` と `data/politician-data.ts` に定義されています。選挙運動費用収支報告のデータは `data/election-finance/ef-*.json` に配置します。

## 貢献ガイドライン

このプロジェクトはオープンソース（AGPLライセンス）であり、誰でも貢献することができます。詳細は以下のドキュメントを参照してください。

- [CONTRIBUTING](CONTRIBUTING.md)
- [LICENSE](LICENSE)
- [CLA](CLA.md)
- [CODE_REVIEW_GUIDELINES](docs/CODE_REVIEW_GUIDELINES.md)
- [ADR](docs/adr/ADR.md)

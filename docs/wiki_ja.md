# Polimoney オンボーディングガイド

## 概要

Polimoney（ポリマネー）は、日本の政治資金の透明性を高めるために設計されたオープンソースプロジェクトです。デジタル民主主義2030イニシアチブの一部として、政治資金収支報告や選挙運動費用収支報告のデータを、市民が理解しやすい形で可視化します。

ユーザーは政治家ごとのプロフィール、収入・支出の概要、資金の流れ、明細、報告書メタデータを確認できます。

## 技術スタック

- Next.js App Router
- React
- TypeScript
- Chakra UI
- Nivo
- Biome

## プロジェクト構成

現在のアプリケーションはリポジトリ直下に Next.js プロジェクトとして配置されています。`frontend/` ディレクトリは使用していません。

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

## 主なルート

- `/` - トップページ
- `/politicians` - 政治家一覧
- `/politicians/[politicianId]` - 政治家詳細
- `/politicians/[politicianId]/political/[dataId]` - 政治資金収支報告
- `/politicians/[politicianId]/election/[dataId]` - 選挙運動費用収支報告
- `/organizations` - 政治団体一覧
- `/organizations/[orgId]` - 政治団体詳細
- `/preview` - プレビュー用ページ

## 主要なファイル

- `app/layout.tsx` - アプリケーション共通レイアウト、メタデータ、構造化データ
- `app/page.tsx` - トップページ
- `data/politician-master.ts` - 政治家一覧と各データIDの対応
- `data/politician-data.ts` - 政治資金収支データモジュールの対応
- `data/election-finance/ef-*.json` - 選挙運動費用収支報告データ
- `models/type.d.ts` - 政治資金収支報告で使う型
- `models/election-finance.ts` - 選挙運動費用収支報告で使う型
- `utils/flowGenerator.ts` - 取引データからサンキー図用フローを生成
- `utils/election-finance.ts` - 選挙収支データのカテゴリ変換

## 主要コンポーネント

- `components/PoliticianCard.tsx` - 政治家カード
- `components/BoardSummary.tsx` - 政治資金収支の概要、プロフィール、サンキー図
- `components/BoardChart.tsx` - Nivo Sankey による資金フロー表示
- `components/BoardTransactions.tsx` - 収入・支出明細テーブル
- `components/BoardMetadata.tsx` - 報告書メタデータ
- `app/politicians/[politicianId]/election/[dataId]/ElectionFinanceContent.tsx` - 選挙収支ページ本体
- `app/politicians/[politicianId]/election/[dataId]/TransactionSection.tsx` - 選挙収支明細セクション

## データの流れ

政治資金収支報告は、`data/demo-*.ts` に定義した `AccountingReports` を `data/politician-data.ts` に登録し、政治家IDとレポートIDに基づいてページ側で読み込みます。サンキー図のフローは `utils/flowGenerator.ts` で取引データとカテゴリ定義から生成されます。

選挙運動費用収支報告は、`data/election-finance/ef-*.json` を `data/politician-master.ts` の `electionDataIds` から参照します。ページ側では該当 JSON を読み込み、収入、支出、公費、繰越を集計して表示します。

## デプロイ

Vercel で配信する場合、Next.js プロジェクトはリポジトリ直下にあるため `vercel.json` は必須ではありません。Vercel 側の Project Root をリポジトリ直下にし、Framework Preset を Next.js として扱えば、`package.json` の `build` スクリプトからビルドできます。

詳しくは [デプロイメントガイド](wiki_ja/deployment.md) を参照してください。

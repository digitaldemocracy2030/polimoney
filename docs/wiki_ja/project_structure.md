# プロジェクト構成

Polimoney は、リポジトリ直下に配置された Next.js アプリケーションです。過去のドキュメントにある `frontend/` 配下の構成は現在の構成ではありません。

## コア領域

1. **Next.js ウェブアプリケーション**
   - `app/` に App Router のページを配置
   - `components/` に再利用可能な UI コンポーネントを配置
   - Chakra UI と Nivo を使って画面と可視化を構築

2. **データ**
   - `data/` に政治家マスター、政治資金収支報告、選挙運動費用収支報告を配置
   - `models/` に TypeScript 型定義を配置
   - `utils/` にデータ変換・集計ロジックを配置

3. **静的アセット**
   - `public/` にプロフィール画像、背景画像、OGP 画像などを配置

4. **開発・品質管理**
   - `package.json` に開発、ビルド、チェック、フォーマット用 npm scripts を定義
   - `biome.json` で lint / format の設定を管理
   - `.github/workflows/nextjs-check.yml` で CI チェックを実行

## ディレクトリ構成

```text
polimoney/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   ├── politicians/
│   ├── organizations/
│   └── preview/
├── components/
├── data/
│   ├── election-finance/
│   ├── politician-master.ts
│   └── politician-data.ts
├── models/
├── public/
│   └── ogp/
├── utils/
├── docs/
├── next.config.ts
├── tsconfig.json
├── biome.json
└── package.json
```

## 主要ページ

### `app/page.tsx`

トップページです。`data/politician-master.ts` の政治家マスターから、表示対象の政治家カードを並べます。

### `app/politicians/page.tsx`

政治家一覧ページです。Coming Soon 用のエントリを除外し、登録済み政治家を一覧表示します。

### `app/politicians/[politicianId]/page.tsx`

政治家詳細ページです。政治資金収支報告と選挙運動費用収支報告への導線を表示します。

### `app/politicians/[politicianId]/political/[dataId]/page.tsx`

政治資金収支報告ページです。政治家IDとレポートIDから `AccountingReports` を特定し、概要、サンキー図、収入・支出明細、メタデータを表示します。

### `app/politicians/[politicianId]/election/[dataId]/page.tsx`

選挙運動費用収支報告ページです。`data/election-finance/ef-*.json` を読み込み、収入、支出、公費、繰越、明細を表示します。

### `app/organizations/*`

政治団体ページです。政治資金収支報告の団体軸表示に使います。

### `app/preview/page.tsx`

表示確認用のプレビューページです。

## 主要データファイル

### `data/politician-master.ts`

政治家一覧の基点です。政治家ID、プロフィール、政治資金収支報告のデータID、選挙収支JSONのデータIDを紐づけます。

### `data/politician-data.ts`

政治資金収支報告の TypeScript データモジュールを政治家IDごとに登録します。

### `data/demo-*.ts`

政治資金収支報告のサンプルまたは実データです。`AccountingReports` 型に沿って、プロフィール、レポート、取引、カテゴリを持ちます。

### `data/election-finance/ef-*.json`

選挙運動費用収支報告の JSON データです。ファイル名の `ef-` 以降が `politician-master.ts` の `electionDataIds` と対応します。

## デプロイ設定

このリポジトリでは Next.js アプリケーションがリポジトリ直下にあるため、通常の Vercel 配信では `vercel.json` は不要です。Vercel 側で Project Root をリポジトリ直下にし、Framework Preset を Next.js として扱います。

カスタムルーティング、特殊なビルド出力、monorepo のサブディレクトリ指定などが必要になった場合にのみ、`vercel.json` の追加を検討します。

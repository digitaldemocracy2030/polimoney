# プロジェクト構成

Polimoneyプロジェクトは、複数のコアシステムと関連ファイルで構成されています。このドキュメントでは、プロジェクトの構造と主要なファイル・ディレクトリについて詳しく説明します。

## コアシステム

プロジェクトは主に4つのシステムで構成されています：

1. **Next.jsウェブアプリケーション**

- 政治資金データを表示するフロントエンドアプリケーション
- React、TypeScriptを使用した最新のウェブ技術で構築
- Next.js の標準ビルド（SSG + サーバーランタイム）で柔軟に配信

2. **データ処理ツール**
   - 政治資金報告書を処理するPythonスクリプト
   - PDF変換、画像分析、データ抽出の自動化ワークフロー
   - vLLMを活用したAI画像解析

3. **データモデル**
   - コアデータ構造のTypeScript定義
   - 一貫したデータ形式の保証
   - 型安全なデータ操作

4. **デプロイメントインフラ**

- Vercelでのホスティングを制御する`vercel.json`
- Next.js のサーバーレス実行を前提としたデプロイ手順
- 必要に応じた手動デプロイ／プレビュー運用

## プロジェクト構造図

> フロントエンドの Next.js ソースは `frontend/` ディレクトリ以下に集約されている。

```
polimoney/
├── frontend/
│   ├── app/                  # Next.jsアプリケーション
│   ├── components/           # Reactコンポーネント群
│   ├── data/                 # データファイル
│   ├── models/               # TypeScript型定義
│   ├── public/               # 静的アセット
│   ├── utils/                # 共通ユーティリティ
│   ├── next.config.ts        # Next.js設定
│   └── tsconfig.json         # TypeScript設定
├── backend/                  # FastAPIバックエンド
├── tools/                    # データ処理ツール
├── scripts/                  # 補助スクリプト
└── docs/                     # ドキュメント
```

## 主要なファイルとディレクトリ

### ウェブアプリケーション（`frontend/app/` と `frontend/components/`）

#### `app/page.tsx`

メインランディングページで、政治家カードのグリッドを表示します。ユーザーはここから特定の政治家の詳細ページに移動できます。

```typescript
// frontend/app/page.tsx の主要部分（概念的な例）
export default function Home() {
  return (
    <main>
      <h1>Polimoney - 政治資金透明化プロジェクト</h1>
      <div className="grid">
        {politicians.map(politician => (
          <PoliticianCard
            key={politician.id}
            name={politician.name}
            party={politician.party}
            slug={politician.slug}
          />
        ))}
      </div>
    </main>
  );
}
```

#### `app/[slug]/page.tsx`

特定の政治家の詳細情報を表示する動的ページです。URLパラメータ（slug）に基づいて政治家データを取得し、複数のボードコンポーネントを表示します。

```typescript
// frontend/app/[slug]/page.tsx の主要部分（概念的な例）
export default function PoliticianPage({ params }: { params: { slug: string } }) {
  const data = getData(params.slug);

  return (
    <div>
      <BoardSummary profile={data.profile} summary={data.summary} />
      <BoardChart flows={data.flows} />
      <BoardTransactions transactions={data.transactions} />
      <BoardMetadata metadata={data.metadata} />
    </div>
  );
}
```

#### `app/layout.tsx`

アプリケーションシェルを定義するルートレイアウトコンポーネントです。ヘッダー、フッター、メタデータなどの共通要素を含みます。

#### `frontend/components/BoardChart.tsx`

資金の流れを視覚化するサンキー図コンポーネントです。収入源から支出先までの資金フローを直感的に表示します。

#### `frontend/components/BoardSummary.tsx`

政治家のプロフィールと財務情報を表示する概要コンポーネントです。基本情報と財務サマリーを含みます。

#### `frontend/components/BoardTransactions.tsx`

収入/支出取引のテーブル表示コンポーネントです。フィルタリングとページネーション機能を備えています。

#### `frontend/components/BoardMetadata.tsx`

資金報告書に関するメタデータを表示するコンポーネントです。データソースの情報を提供します。

#### `frontend/components/Header.tsx`と`frontend/components/Footer.tsx`

ナビゲーションと帰属情報を表示するコンポーネントです。

### データファイル（`frontend/data/`）

#### `frontend/data/demo-takahiroanno.ts`と`frontend/data/demo-ryosukeidei.ts`

政治家データの例を含むファイルです。実際のデータ構造と形式を示しています。

#### `frontend/data/example.ts`

テンプレートデータ構造を定義するファイルです。新しい政治家データを追加する際の参考になります。

#### `frontend/data/converter.ts`

データ形式間の変換ユーティリティを提供するファイルです。外部データソースからのデータをアプリケーション形式に変換します。

### データ処理ツール（`tools/`）

#### `tools/pdf_to_images.py`

PDF報告書をPNG画像に変換するPythonスクリプトです。データ抽出プロセスの最初のステップを担当します。

#### `tools/analyze_image.py`

vLLMを使用して画像からテキストを抽出するPythonスクリプトです。OCRとAI解析を組み合わせています。

#### `tools/merge_jsons.py`

個別のJSON出力を統合データセットに結合するPythonスクリプトです。複数の政治家データを一つのデータセットにまとめます。

#### `tools/generate-og-images.js`

ソーシャルシェア用のOpen Graphプレビュー画像を作成するJavaScriptスクリプトです。

### デプロイ設定

#### `vercel.json`

Vercelがどのディレクトリを Next.js プロジェクトとしてビルドするかを指定する設定ファイルです。

#### `frontend/next.config.ts`

Next.jsのランタイム設定ファイルです。React Strict Mode や最適化オプションを定義します。

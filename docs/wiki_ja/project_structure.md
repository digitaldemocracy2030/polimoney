# プロジェクト構成

Polimoneyプロジェクトは、複数のコアシステムと関連ファイルで構成されています。このドキュメントでは、プロジェクトの構造と主要なファイル・ディレクトリについて詳しく説明します。

## コアシステム

プロジェクトは主に4つのシステムで構成されています：

1. **Next.jsウェブアプリケーション**
   - 政治資金データを表示するフロントエンドアプリケーション
   - React、TypeScriptを使用した最新のウェブ技術で構築
   - 静的サイト生成（SSG）を活用した高速なパフォーマンス

2. **データ処理ツール**
   - 政治資金報告書を処理するPythonスクリプト
   - PDF変換、画像分析、データ抽出の自動化ワークフロー
   - Google Gemini APIを活用したAI画像解析

3. **データモデル**
   - コアデータ構造のTypeScript定義
   - 一貫したデータ形式の保証
   - 型安全なデータ操作

4. **デプロイメントインフラ**
   - GitHub Pagesへのデプロイ用のGitHub Actionsワークフロー
   - 継続的インテグレーション（CI）とデプロイ（CD）の自動化
   - 静的サイトホスティングの最適化

## プロジェクト構造図

```
polimoney/
├── app/                  # Next.jsアプリケーション
│   ├── page.tsx          # メインランディングページ
│   ├── [slug]/           # 動的ルーティング
│   │   └── page.tsx      # 政治家詳細ページ
│   └── layout.tsx        # ルートレイアウト
├── components/           # Reactコンポーネント
│   ├── BoardChart.tsx    # サンキー図コンポーネント
│   ├── BoardSummary.tsx  # 概要コンポーネント
│   ├── BoardTransactions.tsx # 取引コンポーネント
│   └── BoardMetadata.tsx # メタデータコンポーネント
├── data/                 # データファイル
│   ├── demo-*.ts         # デモデータ
│   ├── example.ts        # テンプレート
│   └── converter.ts      # データ変換ユーティリティ
├── tools/                # データ処理ツール
│   ├── pdf_to_images.py  # PDF→画像変換
│   ├── analyze_image_gemini.py # 画像分析
│   └── merge_jsons.py    # JSONデータ統合
└── .github/workflows/    # CI/CDワークフロー
    └── nextjs.yml        # デプロイ設定
```

## 主要なファイルとディレクトリ

### ウェブアプリケーション（`app/`と`components/`）

#### `app/page.tsx`
メインランディングページで、政治家カードのグリッドを表示します。ユーザーはここから特定の政治家の詳細ページに移動できます。

```typescript
// app/page.tsx の主要部分（概念的な例）
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
// app/[slug]/page.tsx の主要部分（概念的な例）
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

#### `components/BoardChart.tsx`
資金の流れを視覚化するサンキー図コンポーネントです。収入源から支出先までの資金フローを直感的に表示します。

#### `components/BoardSummary.tsx`
政治家のプロフィールと財務情報を表示する概要コンポーネントです。基本情報と財務サマリーを含みます。

#### `components/BoardTransactions.tsx`
収入/支出取引のテーブル表示コンポーネントです。フィルタリングとページネーション機能を備えています。

#### `components/BoardMetadata.tsx`
資金報告書に関するメタデータを表示するコンポーネントです。データソースの情報を提供します。

#### `components/Header.tsx`と`components/Footer.tsx`
ナビゲーションと帰属情報を表示するコンポーネントです。

### データファイル（`data/`）

#### `data/demo-takahiroanno.ts`と`data/demo-ryosukeidei.ts`
政治家データの例を含むファイルです。実際のデータ構造と形式を示しています。

#### `data/example.ts`
テンプレートデータ構造を定義するファイルです。新しい政治家データを追加する際の参考になります。

#### `data/converter.ts`
データ形式間の変換ユーティリティを提供するファイルです。外部データソースからのデータをアプリケーション形式に変換します。

### データ処理ツール（`tools/`）

#### `tools/pdf_to_images.py`
PDF報告書をPNG画像に変換するPythonスクリプトです。データ抽出プロセスの最初のステップを担当します。

#### `tools/analyze_image_gemini.py`
Google Gemini APIを使用して画像からテキストを抽出するPythonスクリプトです。OCRとAI解析を組み合わせています。

#### `tools/merge_jsons.py`
個別のJSON出力を統合データセットに結合するPythonスクリプトです。複数の政治家データを一つのデータセットにまとめます。

#### `tools/generate-og-images.js`
ソーシャルシェア用のOpen Graphプレビュー画像を作成するJavaScriptスクリプトです。

### デプロイ設定

#### `.github/workflows/nextjs.yml`
GitHub PagesへのビルドとデプロイのためのGitHub Actionsワークフローです。継続的インテグレーションと自動デプロイを設定しています。

#### `next.config.ts`
静的サイト生成のためのNext.js設定ファイルです。ビルドとエクスポートの設定を含みます。

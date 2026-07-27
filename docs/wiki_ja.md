# Polimoney オンボーディングガイド

# 概要

Polimoney（ポリマネー）は、日本の政治資金の透明性を高めるために設計されたオープンソースプロジェクトです。このプロジェクトはデジタル民主主義2030イニシアチブの一部です。市民、ジャーナリスト、研究者に政治資金データをわかりやすく視覚化して提供します。ユーザーは政治家の収入源、支出、資金の流れなどの財務情報を探索できます。このプラットフォームにより、ユーザーは以下のことが可能になります：

1. 政治家のプロフィールと財務概要の閲覧
2. インタラクティブなサンキー図による資金の流れの視覚化
3. 収入と支出の両方の詳細な取引記録の探索
4. 政治資金報告書に関するメタデータへのアクセス

このプロジェクトは、公式の政治資金報告書からのデータ抽出と直感的なウェブインターフェースを組み合わせて、通常は不透明な財務情報を一般に公開しています。

# プロジェクト構成

## コアシステム

プロジェクトは主に4つのシステムで構成されています：

1. **Next.jsウェブアプリケーション**：政治資金データを表示するフロントエンドアプリケーション
2. **データ処理ツール**：政治資金報告書を処理するPythonスクリプト
3. **データモデル**：コアデータ構造のTypeScript定義
4. **デプロイメントインフラ**：Vercelでのホスティングを制御する`vercel.json`と関連設定

## 主要なファイルとディレクトリ

> フロントエンドの Next.js ソースは `frontend/` 配下に集約されており、以下で言及する `app/` や `components/`、`data/`、`type.d.ts` などのパスはすべて `frontend/` を起点とする。

### ウェブアプリケーション（`app/`と`components/`）

- `app/page.tsx`：政治家カードを表示するメインランディングページ
- `app/[slug]/page.tsx`：特定の政治家の詳細情報を表示する動的ページ
- `app/layout.tsx`：アプリケーションシェルを定義するルートレイアウトコンポーネント
- `components/BoardChart.tsx`：資金の流れを視覚化するサンキー図
- `components/BoardSummary.tsx`：プロフィールと財務情報を表示する概要コンポーネント
- `components/BoardTransactions.tsx`：収入/支出取引のテーブル表示
- `components/BoardMetadata.tsx`：資金報告書に関するメタデータを表示
- `components/Header.tsx`と`components/Footer.tsx`：ナビゲーションと帰属コンポーネント

### データモデル（`frontend/models/type.d.ts`）

- コアデータ型の定義：`Profile`、`Support`、`Summary`、`Metadata`、`Flow`、`Transaction`
- これらの型はアプリケーション全体で一貫したデータ構造を確保するために使用されます

### データファイル（`frontend/data/`）

- `frontend/data/demo-takahiroanno.ts`と`frontend/data/demo-ryosukeidei.ts`：政治家データの例
- `frontend/data/example.ts`：テンプレートデータ構造
- `frontend/data/converter.ts`：データ形式間の変換ユーティリティ

### データ処理ツール（`tools/`）

- `tools/pdf_to_images.py`：PDF報告書をPNG画像に変換
- `tools/analyze_image.py`：LangChainを使用して画像からテキストを抽出
- `tools/merge_jsons.py`：個別のJSON出力を統合データセットに結合
- `tools/generate-og-images.js`：ソーシャルシェア用のOpen Graphプレビュー画像を作成

### デプロイ設定

- `vercel.json`：Vercelで`frontend/`配下のNext.jsアプリをビルドする設定
- `frontend/next.config.ts`：Next.js全体のランタイム設定

## 主要コンポーネントと機能

### 主要コンポーネント

- `BoardChart`：サンキー図を使用して資金の流れを視覚化
- `BoardSummary`：政治家のプロフィールと財務概要を表示
- `BoardTransactions`：フィルタリングとページネーションを備えた詳細な取引リストを表示
- `BoardMetadata`：データソースに関する情報を表示

### 主要機能

- `getData(slug)`：特定の政治家のデータを取得（`app/[slug]/page.tsx`）
- `convert(data)`：入力データ形式をアプリケーション形式に変換（`frontend/data/converter.ts`）
- `analyze_image()`：政治資金報告書の画像からテキストを抽出（`tools/analyze_image.py`）
- `pdf_to_png()`：PDFページをPNG画像に変換（`tools/pdf_to_images.py`）

# コードベース固有の用語集

1. **Profile**：名前、肩書き、政党などの政治家情報を含むデータ構造（`frontend/models/type.d.ts`、`BoardSummary.tsx`で使用）

2. **Flow**：階層構造を持つ収入/支出の流れを表す - 方向、値、親を持つ（`frontend/models/type.d.ts`）

3. **Transaction**：カテゴリ、日付、値、パーセンテージを持つ個別の財務記録（`frontend/models/type.d.ts`、`BoardTransactions.tsx`で表示）

4. **Support**：政治家を支援する組織。idと名前を含む（`frontend/models/type.d.ts`）

5. **Summary**：収入、支出、残高、年を含む財務概要（`frontend/models/type.d.ts`、`BoardSummary.tsx`で表示）

6. **Metadata**：資金報告書のソース、組織、代表者に関する情報（`frontend/models/type.d.ts`、`BoardMetadata.tsx`で表示）

7. **BoardChart**：サンキー図を使用して資金の流れを視覚化するコンポーネント（`components/BoardChart.tsx`）

8. **BoardSummary**：政治家のプロフィールと財務概要を表示するコンポーネント（`components/BoardSummary.tsx`）

9. **BoardTransactions**：ページネーション付きの取引テーブルを表示するコンポーネント（`components/BoardTransactions.tsx`）

10. **BoardMetadata**：資金報告書に関するメタデータを表示するコンポーネント（`components/BoardMetadata.tsx`）

11. **BoardContainer**：ボードコンポーネントに一貫したスタイリングを提供するラッパーコンポーネント（`components/BoardContainer.tsx`）

12. **generateStaticParams()**：既知のルートを事前生成する`[slug]/page.tsx`内の関数

13. **analyze_image()**：LLMを使用して画像からテキストを抽出する関数（`tools/analyze_image.py`）

14. **LangChainLLMClient**：画像分析のためのLLMとの対話を処理するクラス（`tools/analyze_image.py`）

15. **captureGraph()**：OGP画像用のサンキー図のスクリーンショットを撮る関数（`tools/generate-og-images.js`）

16. **デジタル民主主義2030**：Polimoneyの親プロジェクト（メタデータとフッターに表示）

17. **総収入**：財務フローチャートの特別なノード（`components/BoardChart.tsx`）

18. **incomeTransactions**：政治家データファイル内の収入取引記録の配列（`frontend/data/demo-*.ts`）

19. **expenseTransactions**：政治家データファイル内の支出取引記録の配列（`frontend/data/demo-*.ts`）

20. **convert()**：入力形式からアプリ形式に財務データを変換する関数（`frontend/data/converter.ts`）

21. **pdf_to_png()**：PDF報告書のページをPNG画像に変換する関数（`tools/pdf_to_images.py`）

22. **merge_jsons.py**：個別のJSONファイルを統合データセットに結合するスクリプト（`tools/merge_jsons.py`）

23. **generateMetadata()**：SEOとOpenGraph用のメタデータを作成する関数（`app/[slug]/page.tsx`）

24. **generateOgImages.js**：ソーシャルメディアプレビュー画像を作成するスクリプト（`tools/generate-og-images.js`）

25. **InputData/OutputData**：変換に使用されるデータ構造（`frontend/data/converter.ts`）

# デプロイメント

Polimoneyプロジェクトは、GitHub Pagesを使用して静的ウェブサイトとしてデプロイされます。このドキュメントでは、デプロイメントプロセスとインフラストラクチャについて詳しく説明します。

## デプロイメントインフラストラクチャ

Polimoneyは、以下のインフラストラクチャを使用してデプロイされます：

1. **GitHub Pages**
   - 静的ウェブサイトホスティングサービス
   - 無料で高速なコンテンツ配信
   - HTTPS対応

2. **GitHub Actions**
   - 継続的インテグレーション（CI）と継続的デプロイメント（CD）
   - 自動ビルドとテスト
   - 自動デプロイメントワークフロー

## デプロイメントワークフロー

デプロイメントプロセスは、`.github/workflows/nextjs.yml`ファイルで定義されています。以下は、ワークフローの概要です：

```yaml
# .github/workflows/nextjs.yml の概念的な例
name: Deploy Next.js site to Pages

on:
  # mainブランチへのプッシュ時に実行
  push:
    branches: ["main"]
  # 手動実行も可能
  workflow_dispatch:

# GITHUB_TOKENのパーミッション設定
permissions:
  contents: read
  pages: write
  id-token: write

# 同時実行を1つに制限
concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  # ビルドジョブ
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: 'npm'
      - name: Setup Pages
        uses: actions/configure-pages@v3
      - name: Install dependencies
        run: npm ci
      - name: Build with Next.js
        run: npm run build
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: ./out

  # デプロイジョブ
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v2
```

## デプロイメントフロー図

以下の図は、コードがリポジトリからウェブサイトにデプロイされるまでの流れを示しています：

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  コード変更  │     │   GitHub    │     │  GitHub     │     │  GitHub     │
│  プッシュ    │────▶│   リポジトリ │────▶│  Actions    │────▶│  Pages      │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │  ビルド     │
                                        │  プロセス    │
                                        └─────────────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │  静的ファイル │
                                        │  生成        │
                                        └─────────────┘
```

## Next.js設定

Next.jsの設定は`next.config.ts`ファイルで定義されており、静的サイト生成（SSG）のための設定が含まれています：

```typescript
// next.config.ts の概念的な例
import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 出力を静的HTMLとJSファイルに
  output: 'export',
  
  // ベースパスの設定（GitHub Pagesのリポジトリ名に対応）
  basePath: '/polimoney',
  
  // 画像の最適化設定
  images: {
    unoptimized: true,
  },
  
  // TypeScriptの厳格モード
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // 環境変数の設定
  env: {
    SITE_URL: 'https://digitaldemocracy2030.github.io/polimoney',
  },
};

export default nextConfig;
```

## デプロイメントプロセス

### 1. ビルドプロセス

ビルドプロセスでは、Next.jsアプリケーションが静的HTMLとJavaScriptファイルに変換されます：

```bash
# ビルドコマンド
npm run build

# 出力ディレクトリ
./out/
```

ビルドプロセスでは以下の処理が行われます：

- TypeScriptコードのコンパイル
- Reactコンポーネントのレンダリング
- 静的ページの生成
- アセット（CSS、JavaScript、画像）の最適化
- メタデータとOGP画像の生成

### 2. デプロイプロセス

GitHub Actionsワークフローは、ビルドされた静的ファイルをGitHub Pagesにデプロイします：

1. ビルド成果物（`./out/`ディレクトリ）をアップロード
2. GitHub Pagesサービスにデプロイ
3. カスタムドメイン設定の適用（設定されている場合）

### 3. コンテンツ配信

デプロイ後、サイトは以下のURLでアクセス可能になります：

```
https://digitaldemocracy2030.github.io/polimoney/
```

## OGP画像生成

ソーシャルメディア共有用のOpen Graph Protocol（OGP）画像は、`tools/generate-og-images.js`スクリプトによって生成されます。このスクリプトは、以下の処理を行います：

1. サンキー図のスクリーンショットを撮影
2. 政治家名と財務情報をオーバーレイ
3. 最適化された画像を`public/og/`ディレクトリに保存

```javascript
// tools/generate-og-images.js の概念的な例
async function captureGraph(politician) {
  // ブラウザを起動
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // サンキー図ページを読み込み
  await page.goto(`http://localhost:3000/${politician.slug}`);
  
  // グラフ要素を待機
  await page.waitForSelector('.sankey-diagram');
  
  // スクリーンショットを撮影
  const screenshot = await page.screenshot({
    clip: { x: 0, y: 0, width: 1200, height: 630 }
  });
  
  // 画像を処理（テキストオーバーレイなど）
  const processedImage = await processImage(screenshot, politician);
  
  // 画像を保存
  await fs.writeFile(`public/og/${politician.slug}.png`, processedImage);
  
  await browser.close();
}
```

## デプロイメントのベストプラクティス

### 1. プレビューデプロイメント

プルリクエスト（PR）ごとにプレビューデプロイメントを行うことで、変更の影響を本番環境に反映する前に確認できます：

```yaml
# プレビューデプロイメントの設定例
on:
  pull_request:
    branches: ["main"]
```

### 2. 環境変数の管理

環境変数はGitHub Secretsを使用して安全に管理します：

```yaml
# 環境変数の使用例
jobs:
  build:
    env:
      API_KEY: ${{ secrets.API_KEY }}
```

### 3. キャッシュの活用

ビルド時間を短縮するために、依存関係とビルド成果物をキャッシュします：

```yaml
# キャッシュの設定例
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

### 4. デプロイメントの監視

GitHub Actionsのステータスとログを監視して、デプロイメントの問題を早期に発見します：

```bash
# デプロイメントステータスの確認
gh run list --workflow=nextjs.yml --limit=5
```

## トラブルシューティング

### 1. ビルドエラー

ビルドエラーが発生した場合は、以下を確認します：

- 依存関係のバージョンの互換性
- TypeScriptの型エラー
- 未使用のインポートや変数

### 2. デプロイメントエラー

デプロイメントエラーが発生した場合は、以下を確認します：

- GitHub Actionsの権限設定
- リポジトリのGitHub Pages設定
- ワークフローYAMLの構文エラー

### 3. 404エラー

デプロイ後に404エラーが発生する場合は、以下を確認します：

- `next.config.ts`の`basePath`設定
- 静的エクスポートの設定
- ルーティング設定

## デプロイメントチェックリスト

新しいバージョンをデプロイする前に、以下のチェックリストを確認します：

1. ✅ すべてのテストが通過していることを確認
2. ✅ リンターエラーがないことを確認
3. ✅ TypeScriptの型チェックが通過していることを確認
4. ✅ ローカル環境でビルドが成功することを確認
5. ✅ OGP画像が正しく生成されていることを確認
6. ✅ 主要なページが正しく表示されることを確認
7. ✅ レスポンシブデザインが機能していることを確認

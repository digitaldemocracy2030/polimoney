# デプロイメントガイド

Polimoney のフロントエンドは Next.js の標準ビルド成果物を **Vercel** で配信する。`vercel.json` と Vercel 側のプロジェクト設定のみで公開状態を管理する。

## ホスティング構成

| 役割 | サービス | 補足 |
| --- | --- | --- |
| 本番ホスティング | Vercel | `vercel.json` が `frontend/` 配下の Next.js をビルドするよう指定 |
| 品質ゲート | GitHub Actions (`.github/workflows/nextjs-check.yml`) | PR 時に lint + `npm run build` を検証（デプロイ無し） |
| 画像生成 | `tools/generate-og-images.js` | OGP 画像は `frontend/public/ogp/` 以下に出力 |

## デプロイフロー

```
開発者の push
    │
    ├─▶ GitHub Actions (lint/build)
    │
    └─▶ main マージ
            │
            └─▶ Vercel が自動ビルド → Production 反映
```

- main ブランチにマージされたコミットが Vercel に接続されていれば自動デプロイされる。
- プレビューが欲しい場合は Pull Request ごとに Vercel の Preview デプロイを有効化しておく。

## ローカルビルド手順

1. 依存インストール
   ```bash
   npm install --legacy-peer-deps
   ```
2. ビルド
   ```bash
   npm run build
   ```
   ルート `package.json` のスクリプトが `frontend` ワークスペースへ委譲するので、`frontend/.next` が生成される。
3. 動作確認
   ```bash
   npm run start
   ```
   事前に `npm run build` 済みであること。

## Vercel 側設定

- プロジェクトルート: リポジトリ直下
- Build Command: `npm run build`
- Install Command: `npm install --legacy-peer-deps`
- Framework Preset: Next.js（自動認識で OK）
- Environment Variables: `GOOGLE_API_KEY` などを Vercel のダッシュボードで設定

`vercel.json` には `frontend/package.json` を Next.js プロジェクトとして扱う設定が書かれているため、追加のルーティング指定は不要。

## 手動デプロイ（Vercel CLI）

即時リリースしたい場合や Preview を作りたい場合：

```bash
npm install --legacy-peer-deps
npm run build
npx vercel build
npx vercel deploy --prebuilt          # Preview
npx vercel deploy --prebuilt --prod   # 本番
```

`vercel build` で `.vercel/output` を生成し、`--prebuilt` 付きの `vercel deploy` でその成果物をアップロードする。Preview を確認後、`--prod` で本番へ昇格させる。

## Next.js 設定のポイント

- `frontend/next.config.ts` は React Strict Mode や `optimizePackageImports` などのランタイム設定のみを担う。
- `experimental.optimizePackageImports` により Chakra UI を最適化している。Node 20 以上の実行環境を前提とする。

## OGP 画像フロー

1. データソース: `frontend/data/demo-*.ts`
2. 生成: `node tools/generate-og-images.js`
3. 出力: `frontend/public/ogp/*.png`

Vercel は `frontend/public` をそのままホストするので、画像を追加した場合は再ビルドするだけで公開される。

## トラブルシューティング

| 症状 | 確認ポイント |
| --- | --- |
| Vercel ビルド失敗 | `npm run build` をローカルで再現、環境変数や Node バージョンが正しいか確認 |
| 404 が発生 | `npm run build` の結果として `.next/server/app` に対象ルートが生成されているか確認 |
| 画像が表示されない | `frontend/public` にファイルがあるか、デプロイ前に `npm run build` をやり直したか確認 |

## デプロイ前チェックリスト

1. ✅ `npm run build` と `npm run check` をローカルで完走
2. ✅ 追加したデータ/画像が `frontend/` 以下に存在
3. ✅ `tools/generate-og-images.js` を回して必要な OGP を再生成
4. ✅ Vercel Preview でトップ・個別詳細・uniformed 系ページが表示される
5. ✅ 環境変数や API キーが最新になっている

# デプロイメントガイド

Polimoney はリポジトリ直下に Next.js アプリケーションがあるため、Vercel では標準の Next.js プロジェクトとして配信できます。

この構成では `vercel.json` は必須ではありません。Vercel がリポジトリ直下の `package.json`、`next.config.ts`、`app/` を認識できるため、Vercel 側の Project Root をリポジトリ直下に設定すれば十分です。

## ホスティング構成

| 役割 | サービス | 補足 |
| --- | --- | --- |
| 本番ホスティング | Vercel | Project Root はリポジトリ直下 |
| 品質ゲート | GitHub Actions (`.github/workflows/nextjs-check.yml`) | PR 時に check / build を検証 |
| 静的アセット | Next.js public directory | `public/` 以下を配信 |

## Vercel 側設定

- Project Root: リポジトリ直下
- Framework Preset: Next.js
- Install Command: `npm install --legacy-peer-deps`
- Build Command: `npm run build`
- Output Directory: 未指定（Next.js / Vercel の標準設定に任せる）
- Environment Variables: 必要な環境変数を Vercel のダッシュボードで設定

`vercel.json` は、以下のような事情が出た場合に追加を検討します。

- monorepo 化して Next.js アプリをサブディレクトリに移す
- Vercel の自動検出では表現できない rewrites / redirects / headers が必要になる
- ビルドコマンドや出力先をリポジトリ設定として固定したい
- Vercel Functions の地域や実行設定を明示したい

現状の構成では、`vercel.json` を置かず Vercel のプロジェクト設定で管理する方がシンプルです。

## デプロイフロー

```text
開発者の push
    │
    ├─▶ GitHub Actions (check / build)
    │
    └─▶ main マージ
            │
            └─▶ Vercel が自動ビルド → Production 反映
```

- main ブランチにマージされたコミットが Vercel に接続されていれば自動デプロイされます。
- Pull Request ごとの Preview デプロイは、Vercel 側で GitHub 連携を有効化しておくと利用できます。

## ローカルビルド手順

1. 依存インストール

   ```bash
   npm install --legacy-peer-deps
   ```

2. チェック

   ```bash
   npm run check
   ```

3. ビルド

   ```bash
   npm run build
   ```

4. 本番ビルドのローカル起動

   ```bash
   npm run start
   ```

## 手動デプロイ（Vercel CLI）

即時リリースしたい場合や Preview を手元から作りたい場合は、Vercel CLI を使えます。

```bash
npm install --legacy-peer-deps
npm run build
npx vercel build
npx vercel deploy --prebuilt
npx vercel deploy --prebuilt --prod
```

`npx vercel build` で `.vercel/output` を生成し、`--prebuilt` 付きの `vercel deploy` でその成果物をアップロードします。Preview を確認後、必要に応じて `--prod` で本番へ反映します。

## Next.js 設定

- `next.config.ts` は React Strict Mode と `experimental.optimizePackageImports` を設定しています。
- `metadataBase` は `app/layout.tsx` で `NODE_ENV` に応じて production URL と localhost を切り替えています。
- 静的アセットは `public/` 以下に置くと、そのままルートパスから配信されます。

## OGP 画像

OGP 画像は `public/ogp/` に配置します。例:

- `public/ogp/polimoney.png`
- `public/ogp/demo-ryosuke-idei-2024.png`
- `public/ogp/demo-takahiro-anno-2024.png`

画像を追加・更新した場合は、通常の Next.js ビルドに含まれます。

## トラブルシューティング

| 症状 | 確認ポイント |
| --- | --- |
| Vercel ビルド失敗 | `npm run build` をローカルで再現し、Node バージョンや環境変数を確認 |
| 404 が発生 | 対象ルートが `app/` 配下に存在するか、動的ルートのIDがデータと一致するか確認 |
| 画像が表示されない | `public/` にファイルがあるか、参照パスが `/ogp/...` のような public ルート基準になっているか確認 |
| Preview とローカルで表示が違う | Vercel の環境変数、ブランチ、ビルドログを確認 |

## デプロイ前チェックリスト

1. `npm run check` が通る
2. `npm run build` が通る
3. 追加したデータが `data/` に登録されている
4. 追加した画像が `public/` に配置されている
5. Vercel Preview でトップ、政治家詳細、政治資金収支、選挙収支の代表ページを確認する

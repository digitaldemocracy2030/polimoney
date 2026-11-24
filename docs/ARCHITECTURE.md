# Polimoney システム全体アーキテクチャ

Polimoney は、政治資金の透明化を目的とした 3 つのプロダクトで構成されます。
この文書はプロダクト間の関係・データの流れ・責任範囲をまとめたものです。各プロダクトの内部構成は各リポジトリのドキュメントを参照してください。

> 2026-11-23 時点の各リポジトリの実装に基づきます。「計画」「未実装」と書いた箇所は現状と異なります。

## 1. プロダクト一覧

| プロダクト | 役割 | 利用者 | リポジトリ |
| --- | --- | --- | --- |
| **Polimoney** | 政治資金の可視化（公開サイト） | 市民・研究者・メディア | [digitaldemocracy2030/polimoney](https://github.com/digitaldemocracy2030/polimoney) |
| **Polimoney Hub** | 政治家・政治団体・選挙のマスタ、本人確認、公開データの保管と配信 | Hub 管理者、Ledger、Polimoney、外部の API 利用者 | [digitaldemocracy2030/polimoney_hub](https://github.com/digitaldemocracy2030/polimoney_hub) |
| **Polimoney Ledger** | 政治資金の収支を記録する会計アプリ | 政治家・会計責任者・事務担当者 | [digitaldemocracy2030/polimoney_ledger](https://github.com/digitaldemocracy2030/polimoney_ledger) |

## 2. 全体構成

```
                       ┌──────────────────────────── Polimoney Ledger ────────────────────────────┐
 政治家・会計担当 ───▶ │ Ledger Web (Next.js) ──Bearer JWT──▶ Ledger API (Hono / Deno)              │
                       │        │ 認証のみ                          │ ユーザーの JWT（RLS 適用）       │
                       │        └──────────────┬────────────────────┘                                  │
                       │               Supabase A（Ledger 専用: 台帳・仕訳・関係者・証憑 / Auth）       │
                       └───────────────────────────────────────┬──────────────────────────────────────┘
                                                               │ X-API-Key（Ledger 専用キー）
                                                               │ ・マスタ参照 / 本人確認申請
                                                               │ ・公開データの同期（匿名化済み）
                                                               ▼
                       ┌──────────────────────────── Polimoney Hub ───────────────────────────────┐
 Hub 管理者 ─────────▶ │ Hub Admin (Fresh)  ──▶  Hub API (FastAPI / Python)                        │
                       │                                   │                                       │
                       │               Supabase B（Hub 専用: マスタ・本人確認・公開データ / Auth）     │
                       └───────────────────────────────────┬──────────────────────────────────────┘
                                                           │ 公開 API（読み取り）
                               ┌───────────────────────────┴───────────────────────────┐
                               ▼                                                       ▼
 市民 ───────────────▶ Polimoney (Next.js)                              外部の API 利用者（計画）
                       ※ 現状はリポジトリ内の静的データを表示                 市民の分析・議員サイトなど
```

**原則**

- **DB は 2 つで、互いに直接アクセスしない。** Supabase A（Ledger）と Supabase B（Hub）は別プロジェクト。プロダクト間の連携は必ず API を通す。
- **Hub が唯一の情報源（Single Source of Truth）。** 政治家・政治団体・選挙と、その紐付け（政治家×団体、政治家×選挙）は Hub だけが持つ。Ledger は `hub_*` の ID だけを保存する。
- **非公開データは Ledger から出さない。** 仕訳の明細・関係者の非公開情報・証憑は Ledger に留まる。Hub に送るのは匿名化・非公開フラグ適用済みの公開データだけ。
- **Polimoney は Hub の公開データだけを読む。** Ledger には接続しない。

## 3. 各プロダクトの構成

| | Polimoney | Hub API | Hub Admin | Ledger Web | Ledger API |
| --- | --- | --- | --- | --- | --- |
| ディレクトリ | リポジトリ直下 | `polimoney_hub/backend` | `polimoney_hub/admin` | `polimoney_ledger/apps/web` | `polimoney_ledger/apps/api` |
| 技術 | Next.js 15 / Mantine 8 / Nivo | Python / FastAPI | Deno / Fresh | Next.js 16 / Mantine 9 | Deno / Hono |
| ホスティング | Vercel | Azure Container Apps（GitHub Actions で `main` から自動デプロイ） | Deno Deploy | Deno Deploy | Deno Deploy |
| DB / 認証 | なし | Supabase B | Supabase B の Auth（管理者） | Supabase A の Auth（認証のみ） | Supabase A |
| ローカルのポート | 3000 | 3722（コンテナ内は 8000） | 3002 | 3721 | 3723 |

- Ledger は「フロントエンドと API を分離」した構成。将来のネイティブアプリも同じ Ledger API を使う想定。
- Hub Admin は将来 Next.js + Mantine に移行する予定（Ledger と構成を揃える）。

## 4. データの責任範囲

| データ | 持ち主 | 他プロダクトからの参照方法 |
| --- | --- | --- |
| 政治家・政治団体・選挙・選挙区・自治体 | Hub | ID（`hub_politician_id` など）で参照し、内容は Hub API から取得 |
| 政治家×政治団体、政治家×選挙 の紐付け | Hub（`politician_organizations` / `politician_elections`） | Ledger の台帳が ID を保持（`ledgers.hub_politician_organization_id` / `hub_politician_election_id`） |
| 政治家・団体管理者の本人確認、各種申請（選挙・団体の登録、年度ロック解除） | Hub | Ledger から申請し、Hub 管理者が審査 |
| 勘定科目マスタ | Hub（`account_codes`） | Ledger が Hub API から取得 |
| 台帳・仕訳・関係者・補助科目・メンバー・証憑ファイル | Ledger（非公開） | 外部には出さない |
| 公開用の台帳・仕訳・関係者 | Hub（`public_ledgers` / `public_journals` / `public_contacts`） | Ledger が同期して書き込み、Polimoney と外部利用者が読む |

## 5. データの流れ

### 5.1 本人確認と台帳の作成

1. 政治家（または団体の管理者）が Ledger に登録し、Ledger から Hub に本人確認を申請する（公式メールのドメイン確認・DNS TXT 確認など）。
2. Hub 管理者が Hub Admin で審査・承認する。
3. 認証済みになると、Ledger で政治団体・選挙の台帳を作れるようになる。台帳は Hub の政治団体 / 選挙と、政治家×団体 / 政治家×選挙 の紐付け ID を保持する。

### 5.2 公開データの同期（Ledger → Hub）

1. Ledger で仕訳が承認されると、Ledger API が公開用に変換する（非公開項目を除外・匿名化）。
2. `POST /api/v1/sync/contacts` → `/sync/journals` → `/sync/ledger` の順に Hub に送る。キーは Ledger の ID（`*_source_id`）で、Hub 側は upsert。
3. 仕訳は内容のハッシュで差分を判定し、変わっていなければ更新しない。

### 5.3 公開（Hub → Polimoney・外部利用者）

- Hub の公開 API（`/api/v1/polimoney/*`、`/api/v1/political-funds/{id}`、`/api/v1/election-funds/{id}`）が公開データを返す。
- Polimoney はこれを可視化する。**現状の Polimoney はリポジトリ内の静的データ（`data/`）を表示しており、Hub API への切り替えは未実施。**

## 6. 認証とアクセス制御

| 通信 | 方式 | 補足 |
| --- | --- | --- |
| Ledger Web → Ledger API | `Authorization: Bearer <Supabase A のアクセストークン>` | API は JWT を検証し、ユーザーの JWT のまま DB にアクセスする（RLS で台帳メンバー・ロールごとに制御） |
| Ledger API → Hub API | `X-API-Key` | Ledger 専用キー。本番用と開発用の 2 本（下記） |
| Hub Admin → Hub API | Supabase B の管理者ログイン | |
| Polimoney・外部 → Hub 公開データ API | 現在は Ledger 専用キーが必要（計画: 一般公開用の利用キーとレート制限） | 一般公開するまでは `/health` 以外のすべての API が Ledger 専用 |

**Ledger 専用キー**

| Ledger API の環境変数 | Hub API の環境変数 | 用途 |
| --- | --- | --- |
| `HUB_API_KEY_PROD` | `LEDGER_SYNC_API_KEY_PROD` | 本番データ |
| `HUB_API_KEY_DEV` | `LEDGER_SYNC_API_KEY_DEV` | テストデータ。このキーで同期したデータは常に `is_test=true` になり、本番データは上書きできない |

- 両側に同じ値を設定する。Hub 側が未設定なら同期 API は 503 を返す。
- Ledger のテストユーザー（`00000000-0000-0000-0000-000000000001`）は常に開発用キーで Hub に接続する。

## 7. テストデータ

- Hub と Ledger のテストデータは ID を揃えている（例: 政治家「山田 太郎」`11111111-1111-1111-1111-111111111111`、政治団体「山田太郎後援会」`aaaa1111-1111-1111-1111-111111111111`）。
- 公開データの `is_test` で本番と区別する。Polimoney などの公開表示では `is_test=false` だけを使う。
- 詳細は各リポジトリの `docs/TEST_DATA.md` / `db/seed-supabase.ts`。

## 8. 公開 API の方針（計画）

Hub の公開データは、Polimoney 以外にも市民の分析・独自サイト・議員自身のサイトなどで使えるよう API として公開する。

- **書き込み（同期 API）は Ledger 専用**とし、公開 API とは別のキーで守る。
- 読み取り API は基本無料とし、乱用対策として**利用キー（無料登録）とレート制限**を設ける。大量利用には一括ダウンロード（CSV / JSON）を用意する。
- レスポンスにデータの更新日時を含め、出典表示を利用規約の条件にする。
- 寄附者などの個人情報は、法令上の公開範囲より狭く返すことを検討する（機械的な名寄せを防ぐため）。
- API はバージョン（`/api/v1`）を付け、互換性を壊す変更は新しいバージョンで行う。

## 9. 現状の課題（2026-11-23 時点）

- **Hub API が一部不足している。** 勘定科目・政治家・政治団体・選挙・紐付け・同期の API は揃った（2026-11-24）。本人確認・各種申請・政治家と団体の情報の更新の API と、Hub Admin が使う管理 API が未実装。一覧は Ledger の `docs/HUB_API_GAP.md`。
- **公開データ API は現在 Ledger 専用。** 一般公開用の利用キーの仕組みができるまで、Hub の API と Hub DB の直接読み取りはどちらも閉じている。Polimoney が Hub API を使うには、この仕組みが必要。
- **Polimoney は Hub API 未接続。** 静的データから Hub の公開 API への切り替えが必要。

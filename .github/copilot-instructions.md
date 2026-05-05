# AI Coding Instructions

政治資金透明化プラットフォームのためのオープンソースプロジェクト。

## 会話ルール

- 特に指示がない場合、日本語でコミュニケーションを行う
- 作業説明的なコメントを避ける（`// この行を追加` など）
- シンプルな関数型プログラミングを心掛ける

## 作業ルール

- コードの変更を行った際、ワークスペース内で検出されている問題を確認（`get_errors`）する
- エラー発生時は根本原因の特定を行ったうえで修正を行う

## プロジェクト構成

### 技術スタック

- Next.js 15
- Chakra UI v3
- Nivo charts

### サイト構成

```
/                                                - トップ（政治家・政治団体の上位数件）
/politicians                                     - 政治家一覧
/politicians/{politician_id}                     - 政治家詳細（政治・選挙収支一覧）
/politicians/{politician_id}/political/{data_id} - 政治資金収支報告
/politicians/{politician_id}/election/{data_id}  - 選挙運動収支報告
/organizations                                   - 政治団体一覧
/organizations/{org_id}                          - 政治団体詳細（政治収支一覧・代表者）
/organizations/{org_id}/political/{data_id}      - 政治資金収支報告
```

### データ

| ファイル                          | 説明                       | 備考                                                           |
| --------------------------------- | -------------------------- | -------------------------------------------------------------- |
| `data/politician-master.ts`       | 政治家エントリの単一ソース | `id`, `profile`, `politicalDataId?`, `electionDataIds?` を持つ |
| `data/politician-data.ts`         | 政治資金収支データマップ   | キーは政治家IDと同一                                           |
| `data/demo-*.ts`                  | 各政治家のデモデータ       |                                                                |
| `data/election-finance/ef-*.json` | 選挙運動収支データ（JSON） |                                                                |

### コンポーネント

| ファイル                      | 説明                   | 備考                                                         |
| ----------------------------- | ---------------------- | ------------------------------------------------------------ |
| `components/Breadcrumb.tsx`   | パンくずコンポーネント |                                                              |
| `components/BoardSummary.tsx` | 収支サマリー           | `reportPathPrefix` prop で org/politician 両コンテキスト対応 |

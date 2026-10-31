# データモデル

Polimoney のデータモデルは、大きく「政治資金収支報告」と「選挙運動費用収支報告」に分かれています。

## ファイル配置

- `models/type.d.ts` - 政治資金収支報告の型
- `models/election-finance.ts` - 選挙運動費用収支報告の型
- `data/politician-master.ts` - 政治家マスター
- `data/politician-data.ts` - 政治資金収支報告データの登録
- `data/demo-*.ts` - 政治資金収支報告データ
- `data/election-finance/ef-*.json` - 選挙運動費用収支報告データ

## 政治家マスター

`data/politician-master.ts` の `politicianMaster` が、一覧表示と詳細ページへの導線の基点です。

```typescript
export type PoliticianMasterEntry = {
  id: string;
  profile: ProfileList;
  politicalDataId?: string;
  electionDataIds?: string[];
};
```

- `id` は `/politicians/[politicianId]` の URL に使います。
- `profile` はカードや詳細ページのプロフィール表示に使います。
- `politicalDataId` は `data/politician-data.ts` のキーと対応します。
- `electionDataIds` は `data/election-finance/ef-*.json` の `*` 部分と対応します。

## 政治資金収支報告

政治資金収支報告は `models/type.d.ts` の `AccountingReports` を中心に扱います。

```typescript
export type AccountingReports = {
  id: string;
  latestReportId: string;
  profile: Profile;
  data: {
    report: Report;
    transactions: Transaction[];
    categories?: {
      income: Category[];
      expense: Category[];
    };
  }[];
};
```

### Profile

政治家の基本情報です。

```typescript
export type Profile = {
  name: string;
  title: string;
  party: string;
  district?: string;
  image: string;
  birth_year?: number;
  birth_place?: string;
  description?: string;
};
```

### Report

政治資金収支報告のメタデータと合計値です。

```typescript
export type Report = {
  id: string;
  totalIncome: number;
  totalExpense: number;
  totalBalance: number;
  year: number;
  orgType: string;
  orgName: string;
  activityArea: string;
  representative: string;
  fundManagementOrg: string;
  accountingManager: string;
  administrativeManager: string;
  lastUpdate: string;
};
```

### Transaction

収入・支出の明細です。

```typescript
export type Transaction = {
  id: string;
  direction: 'income' | 'expense';
  category: string;
  subCategory?: string;
  purpose: string;
  name: string;
  amount: number;
  date: string;
  tooltip?: string;
};
```

### Flow

サンキー図表示用の資金フローです。通常は直接データに手で書くのではなく、`utils/flowGenerator.ts` の `generateFlowsFromTransactions()` で `Transaction` とカテゴリ定義から生成します。

```typescript
export type Flow = {
  id: string;
  name: string;
  direction: 'income' | 'expense';
  value: number;
  parent: string | null;
};
```

## 選挙運動費用収支報告

選挙運動費用収支報告は `models/election-finance.ts` の `EfData` を中心に扱います。

```typescript
export type EfData = {
  metadata: EfMetadata;
  transactions: EfTransaction[];
};
```

### EfMetadata

```typescript
export type EfMetadata = {
  date: string;
  title: string;
  name: string;
};
```

### EfTransaction

```typescript
export type EfTransaction = {
  data_id: string;
  category: EfCategory;
  date: string | null;
  price: number;
  public_expense_amount?: number;
  type: string;
  purpose?: string;
  non_monetary_basis?: string;
  note?: string;
};
```

### EfCategory

カテゴリは `efCategories` で定義します。表示時には `utils/election-finance.ts` の `getCategoryJpName()` で日本語ラベルに変換します。

```typescript
export const efCategories = [
  { key: 'income', label: '収入' },
  { key: 'personnel', label: '人件' },
  { key: 'building', label: '家屋' },
  { key: 'communication', label: '通信' },
  { key: 'transportation', label: '交通' },
  { key: 'printing', label: '印刷' },
  { key: 'advertising', label: '広告' },
  { key: 'stationery', label: '文具' },
  { key: 'food', label: '食料' },
  { key: 'accommodation', label: '休泊' },
  { key: 'miscellaneous', label: '雑費' },
] as const;
```

## ページとの対応

政治資金収支報告:

1. `/politicians/[politicianId]/political/[dataId]` にアクセス
2. `politicianId` で `data/politician-data.ts` の登録データを取得
3. `dataId` と一致する `report.id` を探す
4. `BoardSummary`、`BoardTransactions`、`BoardMetadata` で表示

選挙運動費用収支報告:

1. `/politicians/[politicianId]/election/[dataId]` にアクセス
2. `politicianId` で `data/politician-master.ts` の `electionDataIds` を取得
3. `data/election-finance/ef-${dataId}.json` を読み込む
4. `ElectionFinanceContent` と `TransactionSection` で表示

## データ追加時の確認ポイント

- 政治家ID、政治資金データID、選挙収支データIDが URL と一致しているか
- `profile.image` が `public/` 配下の実在ファイルを参照しているか
- `report.id` が URL の `[dataId]` と一致しているか
- `electionDataIds` と `ef-*.json` のファイル名が一致しているか
- 金額の合計値と明細の整合性が取れているか
- カテゴリ名がカテゴリ定義と一致しているか

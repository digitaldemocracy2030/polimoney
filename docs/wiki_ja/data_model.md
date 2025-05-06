# データモデル

Polimoneyプロジェクトのデータモデルは、政治資金データを効率的に表現し操作するために設計されています。このドキュメントでは、コアデータ構造とその関係について詳しく説明します。

## コアデータ型

データモデルは`type.d.ts`ファイルで定義されており、以下の主要なデータ型が含まれています：

### Profile（プロフィール）

政治家の基本情報を表すデータ構造です。

```typescript
interface Profile {
  id: string;          // 一意の識別子
  name: string;        // 政治家の氏名
  nameKana?: string;   // 氏名のふりがな（オプション）
  title?: string;      // 肩書き（例：衆議院議員）
  party?: string;      // 所属政党
  image?: string;      // プロフィール画像のURL
  description?: string; // 簡単な説明文
}
```

### Support（支援組織）

政治家を支援する組織の情報を表します。

```typescript
interface Support {
  id: string;          // 一意の識別子
  name: string;        // 支援組織の名称
}
```

### Summary（財務概要）

政治家の財務概要情報を表します。

```typescript
interface Summary {
  year: number;        // 対象年
  income: number;      // 総収入額
  expense: number;     // 総支出額
  balance: number;     // 残高（収入 - 支出）
  currency: string;    // 通貨単位（例：JPY）
}
```

### Metadata（メタデータ）

資金報告書のソース情報を表します。

```typescript
interface Metadata {
  source: string;      // データソース（例：政治資金収支報告書）
  organization: string; // 提出組織名
  representatives: string[]; // 代表者名
  year: number;        // 報告書の対象年
  notes?: string;      // 追加情報（オプション）
}
```

### Flow（資金フロー）

収入または支出の資金フローを階層構造で表します。

```typescript
interface Flow {
  id: string;          // 一意の識別子
  name: string;        // フロー名（例：「党費」「事務所費」）
  value: number;       // 金額
  direction: 'income' | 'expense'; // 方向（収入または支出）
  parentId?: string;   // 親フローのID（階層構造用）
  percentage?: number; // 全体に対する割合（%）
  color?: string;      // 表示色（可視化用）
}
```

### Transaction（取引）

個別の財務取引記録を表します。

```typescript
interface Transaction {
  id: string;          // 一意の識別子
  date: string;        // 取引日（YYYY-MM-DD形式）
  category: string;    // 取引カテゴリ
  description: string; // 取引の説明
  value: number;       // 金額
  direction: 'income' | 'expense'; // 方向（収入または支出）
  percentage: number;  // 全体に対する割合（%）
}
```

## データモデルの関係図

以下の図は、各データ型の関係を示しています：

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Profile   │       │   Summary   │       │  Metadata   │
│             │       │             │       │             │
│  id         │       │  year       │       │  source     │
│  name       │       │  income     │       │  organization│
│  title      │       │  expense    │       │  representatives│
│  party      │       │  balance    │       │  year       │
│  image      │       │  currency   │       │  notes      │
└─────────────┘       └─────────────┘       └─────────────┘
       │                     │                     │
       │                     │                     │
       ▼                     ▼                     ▼
┌─────────────────────────────────────────────────────────┐
│                      PoliticianData                     │
└─────────────────────────────────────────────────────────┘
       │                     │                     │
       │                     │                     │
       ▼                     ▼                     ▼
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    Flow     │       │ Transaction │       │   Support   │
│             │       │             │       │             │
│  id         │       │  id         │       │  id         │
│  name       │       │  date       │       │  name       │
│  value      │       │  category   │       └─────────────┘
│  direction  │       │  description│
│  parentId   │       │  value      │
│  percentage │       │  direction  │
│  color      │       │  percentage │
└─────────────┘       └─────────────┘
```

## データ変換プロセス

外部データソースからのデータは、アプリケーションで使用される形式に変換する必要があります。この変換プロセスは`data/converter.ts`で定義されています。

### 入力データ形式（InputData）

```typescript
interface InputData {
  profile: {
    name: string;
    party?: string;
    // その他のプロフィール情報
  };
  incomeTransactions: {
    category: string;
    date: string;
    value: number;
    description: string;
  }[];
  expenseTransactions: {
    category: string;
    date: string;
    value: number;
    description: string;
  }[];
  // その他のメタデータ
}
```

### 出力データ形式（OutputData）

```typescript
interface OutputData {
  profile: Profile;
  summary: Summary;
  metadata: Metadata;
  flows: Flow[];
  incomeTransactions: Transaction[];
  expenseTransactions: Transaction[];
  supports: Support[];
}
```

### 変換関数

```typescript
// 概念的な例
function convert(input: InputData): OutputData {
  // プロフィール情報の変換
  const profile = {
    id: generateId(input.profile.name),
    name: input.profile.name,
    party: input.profile.party,
    // その他のプロフィール情報
  };

  // 収入・支出取引の変換
  const incomeTransactions = input.incomeTransactions.map(t => ({
    id: generateId(t.description),
    date: t.date,
    category: t.category,
    description: t.description,
    value: t.value,
    direction: 'income',
    percentage: calculatePercentage(t.value, totalIncome)
  }));

  // 同様に支出取引も変換
  // ...

  // フローデータの生成
  const flows = generateFlows(incomeTransactions, expenseTransactions);

  // 概要情報の計算
  const summary = {
    year: extractYear(input),
    income: calculateTotalIncome(incomeTransactions),
    expense: calculateTotalExpense(expenseTransactions),
    balance: calculateBalance(incomeTransactions, expenseTransactions),
    currency: 'JPY'
  };

  // 結果の返却
  return {
    profile,
    summary,
    metadata: input.metadata,
    flows,
    incomeTransactions,
    expenseTransactions,
    supports: input.supports || []
  };
}
```

## データモデルの使用例

### BoardSummary.tsxでのProfile・Summaryの使用

```typescript
// 概念的な例
function BoardSummary({ profile, summary }: { profile: Profile, summary: Summary }) {
  return (
    <div className="board-summary">
      <div className="profile">
        <h2>{profile.name}</h2>
        {profile.party && <p>所属: {profile.party}</p>}
        {profile.title && <p>肩書: {profile.title}</p>}
      </div>
      <div className="financial-summary">
        <h3>{summary.year}年度 財務概要</h3>
        <p>総収入: {formatCurrency(summary.income)}</p>
        <p>総支出: {formatCurrency(summary.expense)}</p>
        <p>残高: {formatCurrency(summary.balance)}</p>
      </div>
    </div>
  );
}
```

### BoardChart.tsxでのFlowの使用

```typescript
// 概念的な例
function BoardChart({ flows }: { flows: Flow[] }) {
  // サンキー図のデータ準備
  const nodes = flows.map(flow => ({
    id: flow.id,
    name: flow.name,
    color: flow.color
  }));

  const links = flows
    .filter(flow => flow.parentId)
    .map(flow => ({
      source: flow.parentId,
      target: flow.id,
      value: flow.value
    }));

  // サンキー図の描画
  return (
    <div className="board-chart">
      <h3>資金フロー図</h3>
      <SankeyDiagram nodes={nodes} links={links} />
    </div>
  );
}
```

### BoardTransactions.tsxでのTransactionの使用

```typescript
// 概念的な例
function BoardTransactions({ transactions }: { transactions: Transaction[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('');
  
  // フィルタリングと並べ替え
  const filteredTransactions = transactions
    .filter(t => t.description.includes(filter) || t.category.includes(filter))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // ページネーション
  const itemsPerPage = 10;
  const pageCount = Math.ceil(filteredTransactions.length / itemsPerPage);
  const currentItems = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  return (
    <div className="board-transactions">
      <h3>取引記録</h3>
      <input
        type="text"
        placeholder="フィルター..."
        value={filter}
        onChange={e => setFilter(e.target.value)}
      />
      <table>
        <thead>
          <tr>
            <th>日付</th>
            <th>カテゴリ</th>
            <th>説明</th>
            <th>金額</th>
            <th>割合</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map(transaction => (
            <tr key={transaction.id}>
              <td>{formatDate(transaction.date)}</td>
              <td>{transaction.category}</td>
              <td>{transaction.description}</td>
              <td>{formatCurrency(transaction.value)}</td>
              <td>{transaction.percentage.toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination
        currentPage={currentPage}
        pageCount={pageCount}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
```

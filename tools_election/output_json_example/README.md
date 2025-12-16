# Polimoney API JSON フォーマット仕様

## 概要

このディレクトリには、Polimoney API から取得できる選挙収支データの JSON サンプルが含まれています。

---

## ファイル構造

```
{
  "meta": { ... },    // メタ情報（政治家、選挙、集計）
  "data": [ ... ]     // 仕訳データの配列
}
```

---

## meta オブジェクト

### meta.api_version

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `api_version` | string | API バージョン（例: `"v1"`） |

### meta.politician（政治家情報）

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `id` | UUID | 政治家の一意識別子 |
| `name` | string | 政治家名（漢字） |
| `name_kana` | string | 政治家名（カタカナ） |

### meta.election（選挙情報）

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `id` | UUID | 選挙の一意識別子 |
| `name` | string | 選挙の正式名称（例: `"2024年 第50回衆議院議員総選挙"`） |
| `type` | string | 選挙タイプコード（下記参照） |
| `type_name` | string | 選挙タイプ日本語名 |
| `district_id` | UUID | 選挙区の一意識別子 |
| `district_name` | string | 選挙区名（例: `"東京都第1区"`） |
| `election_date` | date | 投票日（ISO 8601 形式: `YYYY-MM-DD`） |

#### 選挙タイプコード一覧

| コード | 日本語名 | 短縮名 |
|--------|----------|--------|
| `HR` | 衆議院議員選挙 | 衆院選 |
| `HC` | 参議院議員選挙 | 参院選 |
| `PG` | 都道府県知事選挙 | 知事選 |
| `PA` | 都道府県議会議員選挙 | 県議選 |
| `GM` | 市区町村長選挙 | 首長選 |
| `CM` | 市区町村議会議員選挙 | 市議選 |

### meta.summary（集計サマリー）

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `total_income` | number | 収入合計（円） |
| `total_expense` | number | 支出合計（円） |
| `balance` | number | 収支差額（収入 - 支出） |
| `public_expense_total` | number | 公費負担合計（円） |
| `journal_count` | number | 仕訳件数 |

### meta.generated_at

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `generated_at` | datetime | JSON 生成日時（ISO 8601 形式） |

---

## data 配列（仕訳データ）

各仕訳エントリのフィールド：

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `data_id` | UUID | ✅ | 仕訳の一意識別子 |
| `date` | date | ❌ | 取引日（`YYYY-MM-DD`）※公費負担の場合 null |
| `amount` | number | ✅ | 金額（円） |
| `category` | string | ✅ | カテゴリコード（下記参照） |
| `category_name` | string | ✅ | カテゴリ日本語名 |
| `type` | string | ✅ | 収支タイプ（下記参照） |
| `purpose` | string | ❌ | 使途（支出の場合） |
| `non_monetary_basis` | string | ❌ | 金銭以外の寄附の内容 |
| `note` | string | ❌ | 備考・摘要 |
| `public_expense_amount` | number | ❌ | 公費負担額（該当する場合） |

### カテゴリコード一覧

#### 支出カテゴリ

| コード | 日本語名 | 説明 |
|--------|----------|------|
| `personnel` | 人件費 | 運動員・事務員の報酬 |
| `building` | 家屋費 | 事務所・会場の賃借料 |
| `communication` | 通信費 | 電話・郵便・インターネット |
| `transportation` | 交通費 | 移動・運搬費用 |
| `printing` | 印刷費 | ポスター・ビラ・名刺等 |
| `advertising` | 広告費 | 看板・新聞広告・宣伝 |
| `stationery` | 文具費 | 事務用品・消耗品 |
| `food` | 食糧費 | 弁当・茶菓子・飲料 |
| `lodging` | 休泊費 | 宿泊費 |
| `miscellaneous` | 雑費 | その他の支出 |

#### 収入カテゴリ

| コード | 日本語名 | 説明 |
|--------|----------|------|
| `income` | 収入 | 一般的な収入 |
| `donation` | 寄附 | 金銭・物品の寄附 |
| `other_income` | その他の収入 | 自己資金等 |

### 収支タイプ一覧

| 値 | 説明 |
|----|------|
| `選挙運動` | 選挙運動期間中の支出 |
| `立候補準備のための支出` | 立候補届出前の準備活動 |
| `寄附` | 金銭または物品の寄附（収入） |
| `その他の収入` | 自己資金等（収入） |

---

## 使用例

### JavaScript / TypeScript

```typescript
// JSON の読み込み
const response = await fetch('/api/v1/elections/{id}/journals');
const data = await response.json();

// 政治家名の取得
const politicianName = data.meta.politician.name;

// 選挙日での年集計
const year = new Date(data.meta.election.election_date).getFullYear();

// カテゴリ別集計
const expenseByCategory = data.data
  .filter(j => j.category !== 'income')
  .reduce((acc, j) => {
    acc[j.category_name] = (acc[j.category_name] || 0) + j.amount;
    return acc;
  }, {});
```

### Python

```python
import json
from collections import defaultdict

# JSON の読み込み
with open('テスト太郎_2024衆院選.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# 政治家名の取得
politician_name = data['meta']['politician']['name']

# カテゴリ別集計
expense_by_category = defaultdict(int)
for journal in data['data']:
    if journal['category'] != 'income':
        expense_by_category[journal['category_name']] += journal['amount']
```

---

## 関連ファイル

- `constants.ts` - カテゴリコード・選挙タイプの TypeScript 定義
  - 場所: `polimoney_hub/src/lib/constants.ts`

---

## 更新履歴

- 2024-12-14: 初版作成

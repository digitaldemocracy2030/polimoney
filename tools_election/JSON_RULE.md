# JSONフォーマット仕様書

このドキュメントは、選挙収支報告書のExcelファイルから生成されるJSONファイルの共通フォーマットを定義します。

## 基本構造

すべてのJSONファイルは、UTF-8エンコーディングで保存され、インデント4スペースで整形されます。

## 1. 個別データ（individual_*）

個別の取引データを格納する配列。各カテゴリ（印刷費、広告費、交通費など）で使用されます。

### フォーマット

```json
{
    "individual_<カテゴリ名>": [
        {
            "date": "YYYY-MM-DD" | null,
            "price": number,
            "category": string,
            "purpose": string | null,
            "note": string | null
        },
        ...
    ],
    "json_checksum": number
}
```

**注意**: 個別データの配列の最後に`{"total": number}`要素は含まれません。代わりに、`json_checksum`フィールドが別フィールドとして存在します。

### フィールド説明

- `date` (string | null): 日付。YYYY-MM-DD形式。日付がない場合はnull。
- `price` (number): 金額。整数または浮動小数点数。
- `category` (string): カテゴリ（例: "立候補準備"、"選挙運動"、"寄附"、"その他の収入"）。
- `purpose` (string | null): 用途。支出データの場合のみ存在する場合がある。収入データの場合は通常存在しない。
- `note` (string | null): 備考。レシート番号やその他のメモ。

### 使用例

原則、各種大項目(広告、建物、交通費)を英訳

- `advertising_data.json`
- `building_data.json`
- `transportation_data.json`

### json_checksumについて

- `json_checksum`は、**個別データを含むファイル（`individual_*`を含むファイル）にのみ存在**します
- 合計データファイル（`total_data.json`、`income_total_data.json`など）には含まれません
- 個別データファイルにおいて、`json_checksum`を最後に用意
- 個別の`price`を合計したら`json_checksum`と一致するはず
- 一致しない場合は後の処理に影響があるので、入力元の収支報告書を確認
  - 収支報告書に問題がある場合、提供元の議員さんと協議
  - (polimoneyチームは収支報告書をジャッジする機関ではないので、柔軟に対応)

## 2. 収入データ（income_data.json）

### 基本構造

```json
{
    "individual_income": [
        {
            "date": "YYYY-MM-DD" | null,
            "price": number,
            "category": string,
            "note": string | null
        },
        ...
    ],
    "total_income": [  // optional: 地域によっては存在しない場合がある
        {
            "name": string,
            "price": number
        },
        ...
    ],
    "public_expense_equivalent": {  // optional: 地域によっては存在しない場合がある
        "total": number,
        "breakdown": {  // optional: 内訳がある場合のみ存在
            "<項目名>": number,
            ...
        }
    }
}
```

### フィールド説明

- `individual_income` (必須): 収入の個別データの配列。`purpose`フィールドは通常存在しない。
- `json_checksum` (optional): 個別データの合計値。個別データファイルにのみ存在する。
- `total_income` (optional): 収入の合計情報。各要素は`name`と`price`を持つ。
- `public_expense_equivalent` (optional): 公費負担相当額。`total`は必須（存在する場合）。`breakdown`は内訳がある場合のみ存在。

支出と違って、収入には**purposeが存在しない**

## 3. 収入計データ（income_total_data.json）

optional。地域によっては別ファイルとして存在する場合がある。

**注意**: このファイルは合計データファイルのため、`json_checksum`フィールドは含まれません。

```json
{
    "individual_income_total": [
        {
            "name": string,
            "price": number
        },
        ...
    ],
    "public_expense_equivalent": {
        "total": number
    }
}
```

### フィールド説明

- `individual_income_total`: 収入計の情報。各要素は`name`と`price`を持つ。`name`の値は地域によって異なる。
- `public_expense_equivalent`: 公費負担相当額の合計。

## 4. 支出計データ（total_data.json）

**注意**: このファイルは合計データファイルのため、`json_checksum`フィールドは含まれません。

```json
{
    "individual_total": [
        {
            "name": string,
            "price": number
        },
        ...
    ],
    "public_expense_equivalent_total": [  // optional: 地域によっては存在しない場合がある
        {
            "item": string,
            "unit_price": number,
            "quantity": number,
            "price": number
        },
        ...
        {
            "total": number
        }  // optional: 地域によっては含まれない場合がある
    ]
}
```

### フィールド説明

- `individual_total`: 支出計の情報。各要素は`name`と`price`を持つ。`name`の値は地域によって異なる。
- `public_expense_equivalent_total` (optional): 公費負担相当額の内訳。各要素は:
  - `item`: 項目名
  - `unit_price`: 単価
  - `quantity`: 数量（枚数など）
  - `price`: 金額（単価×数量）
  - 最後の要素として`{"total": number}`が含まれる場合がある（地域によって異なる）。

## 5. 合計データ（total_*）

個別データの合計を格納する配列。地域によっては各カテゴリに存在する場合がある。

### フォーマット

```json
{
    "total_<カテゴリ名>": [
        {
            "name": string,
            "price": number
        },
        ...
    ]
}
```

### フィールド説明

- `name` (string): 合計項目の名称。地域によって異なる値が設定される。
- `price` (number): 合計金額。

## 6. カテゴリ別データ

各カテゴリ（印刷、広告、交通、文具、食料、雑費など）のデータは、以下のいずれかの形式で格納される。

### 形式A: 個別データのみ（json_checksumを含む）

```json
{
    "individual_<カテゴリ名>": [
        {
            "date": "YYYY-MM-DD" | null,
            "price": number,
            "category": string,
            "purpose": string | null,
            "note": string | null
        },
        ...
    ],
    "json_checksum": number
}
```

### 形式B: 個別データと合計データを分離

```json
{
    "individual_<カテゴリ名>": [
        {
            "date": "YYYY-MM-DD" | null,
            "price": number,
            "category": string,
            "purpose": string | null,
            "note": string | null
        },
        ...
    ],
    "total_<カテゴリ名>": [
        {
            "name": string,
            "price": number
        },
        ...
    ],
    "json_checksum": number
}
```

### 形式C: 複数のサブカテゴリに分割

一部のカテゴリ（例: 家屋費）は、地域によって複数のサブカテゴリに分割される場合がある。

```json
{
    "individual_<サブカテゴリ名1>": [
        {
            "date": "YYYY-MM-DD" | null,
            "price": number,
            "category": string,
            "purpose": string | null,
            "note": string | null
        },
        ...
    ],
    "total_<サブカテゴリ名1>": [
        {
            "name": string,
            "price": number
        },
        ...
    ],
    "individual_<サブカテゴリ名2>": [
        ...
    ],
    "total_<サブカテゴリ名2>": [
        ...
    ],
    "json_checksum": number
}
```

**注意**: `json_checksum`は、複数のサブカテゴリの合計を合算した値になります。

## データ型の詳細

### 数値（number）

- 整数値は整数型で保存される。
- 小数点がある場合は浮動小数点数型で保存される。
- カンマ区切りの文字列から数値が抽出される。

### 日付（date）

- 日付は`YYYY-MM-DD`形式の文字列。
- 日付がない場合は`null`。
- Excelの日付セルから自動的に変換される。

### 文字列（string）

- すべての文字列はUTF-8エンコーディング。
- `null`値が許可されるフィールドでは、値がない場合は`null`が設定される。

## バリデーション

- `json_checksum`フィールドが存在する場合、その値は`individual_<カテゴリ名>`配列内のすべての`price`の合計と一致する必要がある。
- `total_<カテゴリ名>`フィールドが存在する場合、その合計は対応する`individual_<カテゴリ名>`の合計と一致する必要がある。
- `date`フィールドは、存在する場合は有効な日付形式（YYYY-MM-DD）である必要がある。

## ファイル命名規則

- ファイル名は`<カテゴリ名>_data.json`の形式。
- 例: `income_data.json`, `printing_data.json`, `total_data.json`, `income_total_data.json`

## 7. 結合データ（{timestamp}_combined.json）

すべての個別データファイルから`individual_*`配列を抽出し、1つの配列に結合したファイル。

### 基本構造

```json
[
    {
        "date": "YYYY-MM-DD" | null,
        "price": number,
        "category": string,
        "purpose": string | null,  // optional: 収入データの場合は無し
        "note": string | null
    },
    ...
]
```

### フィールド説明

- 各要素は個別データの形式と同じ構造を持つ。
- `purpose`フィールドは、支出データの場合のみ存在する。収入データの場合は存在しない。
- 収入と支出の両方のデータが含まれる。

### 生成ルール

- ファイル名は`{timestamp}_combined.json`の形式。`{timestamp}`は`YYYYMMDDHHMMSS`形式（例: `20251110152950`）。
- 個別データファイル（`individual_*`を含むファイル）から`individual_*`配列を抽出して結合する。
- 合計データファイル（`total_data.json`、`income_total_data.json`など）は結合対象外。
- データの順序は、元の個別データファイルの順序に従う（ソートは行われない）。
- `json_checksum`フィールドは含まれない。

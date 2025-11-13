# JSONフォーマット仕様書

このドキュメントは、選挙収支報告書のExcelファイルから生成されるJSONファイルの共通フォーマットを定義します。

## 共通ルール

### エンコーディングと整形

- すべてのJSONファイルはUTF-8エンコーディングで保存される
- インデントは4スペースで整形される
- キーはダブルクォーテーションで囲む

### ファイル命名規則

- ファイル名は`<カテゴリ名>_data.json`の形式
- 例: `income_data.json`, `printing_data.json`, `total_data.json`, `income_total_data.json`
- 結合ファイルは`{timestamp}_combined.json`の形式（`{timestamp}`は`YYYYMMDDHHMMSS`形式）

### json_checksumについて

- `json_checksum`は、**個別データを含むファイル（`individual_*`を含むファイル）に存在する場合があります**
- 合計データファイル（`total_data.json`、`income_total_data.json`など）には含まれません
- 個別データファイルにおいて、`json_checksum`を最後に用意（存在する場合）
- 個別の`price`を合計したら`json_checksum`と一致するはず（存在する場合）
- 一致しない場合は後の処理に影響があるので、入力元の収支報告書を確認
  - 収支報告書に問題がある場合、提供元の議員さんと協議
  - (polimoneyチームは収支報告書をジャッジする機関ではないので、柔軟に対応)
- **例外**: `income_data.json`は地域によって`json_checksum`を含む場合と含まない場合があります
  - 前回計・総額などの差分データを取り扱う場合`json_checksum`を含まない

### 共通用語

- **`individual_*`**: 個別の取引明細をまとめた配列。`*`部分はカテゴリ名やサブカテゴリ名が入る（例: `individual_income`, `individual_advertising`）
- **`total_*`**: 集計済みの合計情報をまとめた配列。`*`部分はカテゴリ名が入る（例: `total_income`, `total_advertising`）
- **`public_expense_summary`**: 公費負担相当額の総額および内訳をまとめた辞書（オプショナル）
- **`public_expense_amount`**: 個別明細に付与される公費負担額を表す数値（`price`と同額の場合は全額公費負担、`-1`は不明を示す）
- **`category`**: データの大分類。シート名や処理名を英語で表したもの（例: `"personnel"`, `"communication"`, `"income"`）
- **`type`**: Excel上の細分類（例: `"立候補準備"`, `"選挙運動"`, `"寄附"`）。
- **`purpose`**: 支出の用途。支出データではキーが必ず存在し、値がない場合は`null`または空文字になる。収入データでは用途欄が存在しないため、このキー自体が出力されない
- **`non_monetary_basis`**: 金銭以外の見積もり（寄附）の根拠。該当しない場合は空文字または`null`が設定される。Excel上で「－」などのプレースホルダーが入力されている場合はその値を保持する
- **`note`**: 備考欄。レシート番号やその他の補足情報を格納する。入力がない場合は空文字または`null`。Excel上で「－」などのプレースホルダーが入力されている場合はその値を保持する。複数行テキストは改行コード（`\n`）を含んだまま保存される
- **`date`**: 取引日。`YYYY-MM-DD`形式の文字列。日付がない場合は`null`
- **`price`**: 金額。整数または浮動小数点数。カンマ区切りの文字列から数値が抽出される
- **`name`**: 合計項目の名称。地域によって異なる値が設定される（例: "計"、"総計"、"寄附"、"その他の収入"）

### データ型

- **数値（number）**: 整数値は整数型で保存される。小数点がある場合は浮動小数点数型で保存される。カンマ区切りの文字列から数値が抽出される
- **日付（date）**: `YYYY-MM-DD`形式の文字列。日付がない場合は`null`。Excelの日付セルから自動的に変換される
- **文字列（string）**: すべての文字列はUTF-8エンコーディング。`null`値が許可されるフィールドでは、値がない場合は`null`が設定される

### バリデーション

- `json_checksum`フィールドが存在する場合、その値は`individual_<カテゴリ名>`配列内のすべての`price`の合計と一致する必要がある
- `total_<カテゴリ名>`フィールドが存在する場合、その合計は対応する`individual_<カテゴリ名>`の合計と一致する必要がある
- `date`フィールドは、存在する場合は有効な日付形式（YYYY-MM-DD）である必要がある

## 形式一覧

### 1. 個別カテゴリファイル（`<カテゴリ名>_data.json`）

各カテゴリ（広告費、家屋費、交通費、印刷費、文具費、食料費、雑費など）の詳細を格納するファイル。地域やカテゴリによって複数の形式が存在する。

#### 形式A: 個別データのみ

```json
{
    "individual_<カテゴリ名>": [
        {
            "category": string,
            "date": "YYYY-MM-DD",
            "price": number,
            "type": string,
            "non_monetary_basis": string,
            "note": string
        },
        ...
    ],
    "json_checksum": number
}
```

**用語説明**:
- **`individual_<カテゴリ名>`**: 個別の取引明細をまとめた配列。カテゴリ名は英訳される（例: `individual_advertising`, `individual_transportation`）
- **`category`**: データの大分類。シート名などを英語で表した値（例: `"advertising"`, `"transportation"`）
- **`date`**: 取引日。`YYYY-MM-DD`形式。取得できない場合は`null`
- **`price`**: 金額
- **`type`**: Excel上の分類名（例: "立候補準備"、"選挙運動"）
- **`purpose`**: 支出の用途。値がない場合でもキーを保持し、`null`または空文字になる
- **`non_monetary_basis`**: 金銭以外の見積もりの根拠。該当しない場合は空文字または`null`。Excel上で「－」などのプレースホルダーが入力されている場合はその値を保持する
- **`note`**: 備考。レシート番号やその他のメモ。入力がない場合は空文字または`null`。Excel上で「－」などのプレースホルダーが入力されている場合はその値を保持する。複数行テキストは改行コード（`\n`）を含んだまま保存される
- **`json_checksum`**: `individual_<カテゴリ名>`配列内のすべての`price`の合計値

**注意**: 個別データの配列の最後に`{"total": number}`要素は含まれません。代わりに、`json_checksum`フィールドが別フィールドとして存在します。

**使用例**: `advertising_data.json`, `transportation_data.json`など

#### 形式B: 個別データと合計データを分離

```json
{
    "individual_<カテゴリ名>": [
        {
            "category": string,
            "date": "YYYY-MM-DD",
            "price": number,
            "type": string,
            "non_monetary_basis": string,
            "note": string
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

**用語説明**:
- **`individual_<カテゴリ名>`**: 個別の取引明細をまとめた配列（形式Aと同様）
- **`total_<カテゴリ名>`**: 個別データをまとめた集計配列
- **`name`**: 合計項目名（例: "計"、"総計"など）。地域によって異なる値が設定される
- **`price`**: 合計金額
- **`json_checksum`**: `individual_<カテゴリ名>`配列内のすべての`price`の合計値

**使用例**: 和歌山の`general_data.json`など

#### 形式C: 複数サブカテゴリを持つ形式

```json
{
    "individual_<サブカテゴリ名1>": [
        {
            "category": string,
            "date": "YYYY-MM-DD",
            "price": number,
            "type": string,
            "non_monetary_basis": string,
            "note": string
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
        {
            "category": string,
            "date": "YYYY-MM-DD",
            "price": number,
            "type": string,
            "non_monetary_basis": string,
            "note": string
        },
        ...
    ],
    "total_<サブカテゴリ名2>": [
        {
            "name": string,
            "price": number
        },
        ...
    ],
    "json_checksum": number
}
```

**用語説明**:
- **`<サブカテゴリ名>`**: 地域固有の細分類名。カテゴリが複数のサブカテゴリに分割される場合に使用される（例: "選挙事務所費"と"集会会場費"）
- **`individual_<サブカテゴリ名>`**: 各サブカテゴリの個別明細配列
- **`total_<サブカテゴリ名>`**: 各サブカテゴリの合計配列
- **`json_checksum`**: すべてのサブカテゴリの`individual_*`配列内の`price`を合算した値

**注意**: `json_checksum`は、複数のサブカテゴリの合計を合算した値になります。

**使用例**: 和歌山の`building_data.json`（選挙事務所費と集会会場費に分割）

### 2. 収入ファイル（`income_data.json`）

収入の個別データを扱うファイル。地域によって2種類の形式が存在する。収入データでは用途が記録されないため、`purpose`キーは出力されない。

#### 形式A: json_checksumを含む形式

```json
{
    "individual_income": [
        {
            "category": string,
            "date": "YYYY-MM-DD",
            "price": number,
            "type": string,
            "non_monetary_basis": string,
            "note": string
        },
        ...
    ],
    "json_checksum": number
}
```

**用語説明**:
- **`individual_income`**: 収入の個別明細をまとめた配列
- **`category`**: データの大分類。収入の場合は常に`"income"`
- **`date`**: 取引日。`YYYY-MM-DD`形式。取得できない場合は`null`
- **`price`**: 金額
- **`type`**: 収入区分（例: "寄附"、"その他の収入"）
- **`non_monetary_basis`**: 金銭以外の寄附等の見積もり根拠。該当しない場合は空文字または`null`。Excel上で「－」などのプレースホルダーが入力されている場合はその値を保持する
- **`note`**: 備考（例: "自己資金"）。入力がない場合は空文字または`null`。Excel上で「－」などのプレースホルダーが入力されている場合はその値を保持する。複数行テキストは改行コード（`\n`）を含んだまま保存される
- **`json_checksum`**: `individual_income`配列内のすべての`price`の合計値

**使用例**: 東京の`income_data.json`

#### 形式B: 合計情報を含む形式

```json
{
    "individual_income": [
        {
            "category": string,
            "date": "YYYY-MM-DD",
            "price": number,
            "type": string,
            "purpose": string,
            "non_monetary_basis": string,
            "note": string
        },
        ...
    ],
    "total_income": [
        {
            "name": string,
            "price": number
        },
        ...
    ],
    "public_expense_summary": {
        "total": number,
        "breakdown": {
            "<項目名>": number,
            ...
        }
    }
}
```

**用語説明**:
- **`individual_income`**: 収入の個別明細をまとめた配列（形式Aと同様）
- **`total_income`**: 収入の合計情報。各要素は`name`と`price`を持つ
  - **`name`**: 項目名（例: "寄附"、"その他の収入"、"計"、"総計"など）
  - **`price`**: 合計金額
- **`public_expense_summary`**: 公費負担相当額の情報をまとめた辞書（optional）
  - **`total`**: 公費負担相当額の総額（必須、存在する場合）
  - **`breakdown`**: 項目ごとの内訳。項目名をキー、金額を値とする辞書（optional: 内訳がある場合のみ存在）

**使用例**: 和歌山の`income_data.json`

### 3. 収入計ファイル（`income_total_data.json`）

収入を集計したデータを格納するファイル。地域によっては別ファイルとして存在する場合がある。合計データファイルのため、`json_checksum`フィールドは含まれない。

#### 形式A: 合計情報のみ

```json
{
    "individual_income_total": [
        {
            "name": string,
            "price": number
        },
        ...
    ],
    "public_expense_summary": {
        "total": number
    }
}
```

**用語説明**:
- **`individual_income_total`**: 収入計の情報。各要素は`name`と`price`を持つ
  - **`name`**: 項目名。地域によって異なる値が設定される
  - **`price`**: 合計金額
- **`public_expense_summary`**: 公費負担相当額の合計
  - **`total`**: 公費負担相当額の総額

**使用例**: 東京の`income_total_data.json`

### 4. 支出計ファイル（`total_data.json`）

支出の合計情報を扱うファイル。合計データファイルのため、`json_checksum`フィールドは含まれない。

#### 形式A: 合計配列 + 公費負担相当額

```json
{
    "individual_total": [
        {
            "name": string,
            "price": number
        },
        ...
    ],
    "public_expense_equivalent_total": [
        {
            "item": string,
            "unit_price": number,
            "quantity": number,
            "price": number
        },
        ...
        {
            "total": number
        }
    ]
}
```

**用語説明**:
- **`individual_total`**: 支出計の情報。各要素は`name`と`price`を持つ
  - **`name`**: 項目名。地域によって異なる値が設定される
  - **`price`**: 合計金額
- **`public_expense_equivalent_total`**: 公費負担相当額の内訳（optional: 地域によっては存在しない場合がある）
  - **`item`**: 項目名
  - **`unit_price`**: 単価
  - **`quantity`**: 数量（枚数など）
  - **`price`**: 金額（単価×数量）
  - **`{"total": number}`**: 最後の要素として合計が含まれる場合がある（optional: 地域によっては含まれない場合がある）

**使用例**: `total_data.json`

### 5. 合計ファイル（`total_<カテゴリ名>.json`）

カテゴリごとの合計値を格納するファイル。地域によっては各カテゴリに存在する場合がある。

#### 形式A: 合計情報のみ

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

**用語説明**:
- **`total_<カテゴリ名>`**: 合計情報をまとめた配列。カテゴリ名は英訳される
- **`name`**: 合計項目の名称。地域によって異なる値が設定される
- **`price`**: 合計金額

**使用例**: 地域によっては各カテゴリごとに存在する場合がある

### 6. 結合ファイル（`{timestamp}_combined.json`）

すべての個別データファイルから`individual_*`配列を抽出し、1つの配列に結合したファイル。

#### 形式A: 個別データの単純結合

```json
[
    {
        "category": string,
        "date": "YYYY-MM-DD",
        "price": number,
        "type": string,
        "purpose": string,
        "non_monetary_basis": string,
        "note": string,
        "public_expense_amount": number
    },
    ...
]
```

**用語説明**:
- **各要素**: `individual_*`配列から抽出したオブジェクト。個別データの形式と同じ構造を持つ
- **`category`**: データの大分類。元のシートや処理名を英語で表した値
- **`date`**: 取引日。`YYYY-MM-DD`形式。日付がない場合は`null`
- **`price`**: 金額
- **`type`**: Excel上の分類名（例: "立候補準備"、"選挙運動"、"寄附"）
- **`purpose`**: 支出の用途。支出データではキーが存在し、値がない場合は`null`または空文字で表現される。収入データ由来の要素にはこのキー自体が含まれない
- **`non_monetary_basis`**: 金銭以外の見積もりの根拠。該当しない場合は空文字または`null`。Excel上で「－」などのプレースホルダーが入力されている場合はその値を保持する
- **`note`**: 備考。Excel上で「－」などのプレースホルダーが入力されている場合はその値を保持する。複数行テキストは改行コード（`\n`）を含んだまま保存される
- **`public_expense_amount`** (optional): 公費負担額。公費負担が不明な場合は-1が設定され、logging.errorを返す。
- **`{timestamp}`**: ファイル名の`YYYYMMDDHHMMSS`部分。生成時刻を表す（例: `20251110152950`）

**生成ルール**:
- ファイル名は`{timestamp}_combined.json`の形式。`{timestamp}`は`YYYYMMDDHHMMSS`形式
- 個別データファイル（`individual_*`を含むファイル）から`individual_*`配列を抽出して結合する
- 合計データファイル（`total_data.json`、`income_total_data.json`など）は結合対象外
- データの順序は、元の個別データファイルの順序に従う（ソートは行われない）
- `json_checksum`フィールドは含まれない

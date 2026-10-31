# 岩永さん Hub DB 登録用追加情報

このファイルは、`岩永さん.json` を Polimoney Hub DB に登録するために必要な追加情報をまとめたものです。

---

## 📌 必須入力項目

### 1. 政治家情報 (politicians)

| 項目                           | 値                              | 備考             |
| ------------------------------ | ------------------------------- | ---------------- |
| 氏名（name）                   | 岩永淳志                        | フルネームを記載 |
| 氏名カナ（name_kana）          | イワナガ アツシ                 |                  |
| 所属政党（party）              | 無所属                          |                  |
| 公式サイト URL（official_url） | https://www.atsushi-iwanaga.jp/ | 任意             |

---

### 2. 選挙情報 (elections)

| 項目                     | 値                                   | 備考            |
| ------------------------ | ------------------------------------ | --------------- |
| 選挙名（name）           | 和歌山県議会議員日高郡選挙区補欠選挙 |                 |
| 選挙タイプ（type）       | PA                                   |                 |
| 選挙日（election_date）  | 2025-06-01                           | YYYY-MM-DD 形式 |
| 選挙区 ID（district_id） | 自動生成                             |                 |

**選挙タイプ一覧:**

| コード | 名称                 |
| ------ | -------------------- |
| `HR`   | 衆議院議員選挙       |
| `HC`   | 参議院議員選挙       |
| `PG`   | 都道府県知事選挙     |
| `PA`   | 都道府県議会議員選挙 |
| `CM`   | 市区町村長選挙       |
| `GM`   | 市区町村議会議員選挙 |

---

### 3. 選挙区情報 (districts)

※ 地方選挙（PA/CM/GM）の場合は選挙区の登録が必要です。

| 項目                                | 値           | 備考               |
| ----------------------------------- | ------------ | ------------------ |
| 選挙区名（name）                    | 日高郡選挙区 |                    |
| 選挙タイプ（type）                  | PA           |                    |
| 市区町村コード（municipality_code） | 300004       | 6 桁の総務省コード |
| 都道府県名                          | 和歌山県     | 参考情報           |
| 市区町村名                          | 日高郡       | 参考情報           |

**市区町村コード検索:**

- [総務省 全国地方公共団体コード](https://www.soumu.go.jp/denshijiti/code.html)
- polimoney の `city_code.csv` を参照

---

## 📊 JSON データ → Hub DB マッピング

### category → account_code 変換表

JSON の `category` フィールドは Hub DB の `account_code` に変換されます。

#### 収入 (income)

| JSON の値 | type                           | Hub account_code               | 説明           |
| --------- | ------------------------------ | ------------------------------ | -------------- |
| `income`  | その他の収入 + note:"自己資金" | `REV_SELF_FINANCING`           | 自己資金       |
| `income`  | 寄附                           | `REV_DONATION_INDIVIDUAL_ELEC` | 個人からの寄附 |
| `income`  | その他の収入                   | `REV_MISC_ELEC`                | その他の収入   |

#### 支出

| JSON の category    | Hub account_code           | 説明         |
| ------------------- | -------------------------- | ------------ |
| `personnel`         | `EXP_PERSONNEL_ELEC`       | 人件費       |
| `building`          | `EXP_BUILDING_ELEC`        | 家屋費       |
| `building` (事務所) | `EXP_BUILDING_ELEC_OFFICE` | 選挙事務所費 |
| `building` (会場)   | `EXP_BUILDING_ELEC_VENUE`  | 演説会場費等 |
| `communication`     | `EXP_COMMUNICATION_ELEC`   | 通信費       |
| `printing`          | `EXP_PRINTING_ELEC`        | 印刷費       |
| `advertising`       | `EXP_ADVERTISING_ELEC`     | 広告費       |
| `stationery`        | `EXP_STATIONERY_ELEC`      | 文具費       |
| `food`              | `EXP_FOOD_ELEC`            | 食料費       |
| `miscellaneous`     | `EXP_MISC_ELEC`            | 雑費         |

---

## 📝 JSON → Hub DB フィールド対応

| JSON フィールド         | Hub public_journals カラム | 備考                       |
| ----------------------- | -------------------------- | -------------------------- |
| `data_id`               | `journal_source_id`        | UUID                       |
| `date`                  | `date`                     | YYYY-MM-DD                 |
| `price`                 | `amount`                   | 整数（小数点以下切り捨て） |
| `category`              | `account_code`             | 上記変換表参照             |
| `type`                  | `classification`           | 下記参照                   |
| `purpose`               | `description`              | 摘要                       |
| `non_monetary_basis`    | `non_monetary_basis`       | 金銭以外の寄附             |
| `note`                  | `note`                     | 備考                       |
| `public_expense_amount` | `public_expense_amount`    | 公費負担額                 |

### classification 変換

| JSON type                | Hub classification | 備考                 |
| ------------------------ | ------------------ | -------------------- |
| `選挙運動`               | `campaign`         | 選挙運動費用         |
| `立候補準備のための支出` | `pre-campaign`     | 立候補準備           |
| `立候補準備`             | `pre-campaign`     | 立候補準備           |
| `寄附`                   | `campaign`         | 選挙運動期間中の寄附 |
| `その他の収入`           | `campaign`         |                      |

---

## 📈 データサマリー（JSON から集計）

| 項目       | 値               | 備考                    |
| ---------- | ---------------- | ----------------------- |
| 仕訳件数   | 60 件            | JSON のエントリ数       |
| 収入件数   | 13 件            |                         |
| 支出件数   | 47 件            |                         |
| 収入合計   | **1,255,000 円** |                         |
| 支出合計   | **2,219,400 円** |                         |
| 公費負担額 | **1,135,856 円** | ビラ・ポスター印刷費    |
| 差引       | -964,400 円      | 収入 - 支出             |
| 会計年度   | 2025             | date フィールドから導出 |

> ⚠️ 支出が収入を上回っていますが、公費負担を考慮すると実質負担は約 17 万円です。

---

## ✅ 登録前チェックリスト

- [x] 政治家の正式な氏名を確認した
- [x] 選挙の正式名称を確認した
- [x] 選挙日を確認した
- [x] 選挙タイプを選択した
- [x] 市区町村コードを確認した（地方選挙の場合）
- [x] is_test = false で登録する（本番データ）

---

## 📋 登録手順（概要）

1. **選挙区（districts）を登録**（既存にない場合）
2. **選挙（elections）を登録**
3. **政治家（politicians）を登録**
4. **公開台帳（public_ledgers）を作成**
5. **公開仕訳（public_journals）を一括登録**

※ 具体的な SQL またはスクリプトは別途作成

---

## 💡 補足情報

### データの特徴

岩永さんの JSON データから読み取れる情報:

- **活動期間**: 2025 年 5 月〜7 月
- **選挙運動期間の推定**: 5 月 23 日〜5 月 31 日頃（弁当代等の日付から）
- **公費負担あり**: ビラ印刷、ポスター印刷
- **金銭以外の寄附あり**: 看板制作・取付（10 万円相当）

### 注意事項

- `price` が小数の場合があります（例: 20496.6）→ 整数に変換が必要
  - 少数の場合は切り上げてください。
- `date` が `null` のエントリがあります（公費負担項目）→ 適切な日付を設定
  - 公費負担は性質上日付がわかりません。date は null にしてください。
- 寄附者名等の個人情報は JSON に含まれていません（匿名化済み）

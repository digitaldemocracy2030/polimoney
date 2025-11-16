# 新規都道府県データ処理の追加ガイド

このドキュメントでは、選挙収支報告書の新規都道府県データ処理を追加する際の共通ルールについて説明します。

## 前提条件

都道府県によってExcelファイルの仕様が大きく異なるため、完全に統一されたフォーマットはありません。しかし、以下の共通ルールを守ることで、メンテナビリティを保つことができます。

## 必須の共通事項

### 1. ファイル構成

新しい都道府県（例：`osaka`）を追加する場合：

```
osaka/
├── __init__.py
├── general.py     # 共通フォーマットのデータ処理（任意）
└── [その他の独自処理ファイル]
osaka.py           # メインの処理ファイル
```

### 2. util.pyの使用

#### 必須で使用する関数・定数

- **`util.extract_number()`**: 値から数値を抽出する際は必ずこの関数を使用
- **`util.create_output_folder()`**: 出力フォルダ作成時は必ずこの関数を使用
- **列定数（`A_COL`, `B_COL`, `C_COL`, ...）**: セルの列指定時は必ずこれらの定数を使用

```python
from util import extract_number, create_output_folder, A_COL, B_COL, C_COL
```

### 3. メインファイル（都道府県名.py）の構成

#### 必須のインポート

```python
import json
import logging
import sys
import openpyxl
import util
```

#### 必須のログ設定

```python
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
```

#### 必須の関数構成

```python
def analyze(input_file):
    """
    指定されたExcelファイルを解析し、各シートのデータをJSONファイルとして出力する。

    Args:
        input_file (str): 解析対象のExcelファイルのパス
    """
    # Excelファイルの読み込み
    wb = openpyxl.load_workbook(input_file, data_only=True)

    # 各シートの処理
    # ...

    # 出力フォルダの作成
    safe_input_file = util.create_output_folder(input_file)

    # JSONファイルの出力
    data_list = [
        ("income_data.json", income_data),
        # その他のデータ...
    ]

    for file_name, data in data_list:
        path = f"output_json/{safe_input_file}/{file_name}"
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4, ensure_ascii=False)


def main():
    if len(sys.argv) != 2:
        logging.error("python [都道府県名].py <input_file> と入力してください")
        sys.exit(1)

    logging.info(f"分析を開始します: {sys.argv[1]}")
    input_file = sys.argv[1]
    analyze(input_file)
    logging.info(f"分析を完了しました: {sys.argv[1]}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
```

### 4. サブモジュールの作成ルール

#### 関数の命名規則

- **個別データ取得**: `get_individual_[データ種別](worksheet)` - 個別のデータ行を取得する内部関数
- **収支計データ取得**: `get_summary(worksheet)` または `get_income_summary(worksheet)` - 支出計や収入計などの収支全体の合計を取得する内部関数
- **メイン処理**: `get_[データ種別](worksheet)` - メインファイル（都道府県名.py）から呼び出される関数

**注意**: メインファイルからは `get_[データ種別]()` 関数を呼び出してください。

#### 必須の引数とDocstring

```python
def get_income(income: Worksheet):
    """
    収入データを取得する

    Args:
        income (Worksheet): 収入シート

    Returns:
        dict: 収入データの辞書
    """
```

#### 数値処理の統一

```python
from util import extract_number

# 必ずextract_numberを使用
price = extract_number(cell.value)
```

#### 日付処理の統一

```python
# 日付がNoneの場合を考慮
date = date_cell.value.strftime("%Y-%m-%d") if date_cell.value else None
```

### 5. データ出力形式

#### JSONファイル名の規則

- `income_data.json`: 収入データ
- `summary_data.json`: 支出計データ
- `income_summary_data.json`: 収入計データ
- `[カテゴリ名]_data.json`: その他のカテゴリデータ

#### 出力データの構造例

```python
{
    "individual_income": [
        {
            "date": "2024-01-01",
            "price": 100000,
            "category": "寄附",
            "note": "備考"
        }
    ],
    "total_income": [  # カテゴリ内の小計（収支全体の合計ではない）
        {
            "name": "総計",
            "price": 1000000
        }
    ]
}
```

**注意**: `total_*`は各カテゴリファイル内の小計を表し、収支全体の合計（`summary_data.json`や`income_summary_data.json`）とは異なります。

## 都道府県固有の実装について

以下の点については都道府県ごとに異なるため、個別に実装してください：

- シート名の取得方法
- データの開始行・終了条件
- セルの配置（列の位置）
- 特殊なデータ形式の処理
- 独自のカテゴリ分類

## 参考例

- **東京都**: `tokyo.py`, `tokyo/`フォルダ
- **和歌山県**: `wakayama.py`, `wakayama/`フォルダ

これらの実装を参考にして、新しい都道府県のデータ処理を実装してください。

import re

from openpyxl import utils
from openpyxl.worksheet.worksheet import Worksheet

# AからJの列インデックスを取得（0始まり）
B_COL = utils.column_index_from_string("B") - 1
C_COL = utils.column_index_from_string("C") - 1
G_COL = utils.column_index_from_string("G") - 1
H_COL = utils.column_index_from_string("H") - 1
I_COL = utils.column_index_from_string("I") - 1


def extract_number(value):
    """
    値から数字のみを抽出する（小数点対応）

    Args:
        value: 抽出対象の値（数値、文字列など）

    Returns:
        int or float or None: 抽出された数値（小数点がある場合は整数に変換）、抽出できない場合はNone
    """
    if value is None:
        return None

    # 既に数値の場合はそのまま整数に変換
    if isinstance(value, (int, float)):
        return int(value)

    # 文字列から数字（小数点含む）を抽出
    if isinstance(value, str):
        # カンマを除去してから数字と小数点のみを抽出するパターン
        clean_value = value.replace(",", "")
        match = re.search(r"(\d+(?:\.\d+)?)", clean_value)
        if match:
            num_str = match.group(1)
            if "." in num_str:
                return float(num_str)
            else:
                return int(num_str)

    return None


def get_individual_total(total: Worksheet):
    """合計の個別データを取得する
    合計に関しては、データの追加はないため、4~13列目を指定するだけで取得できる

    Args:
        total (Worksheet): 合計のシート
    """

    total_data = []

    # 4~13列目を取得
    for i, row in enumerate(total.iter_rows(min_row=5, max_row=13, max_col=C_COL + 1)):
        if 0 <= i <= 2:
            name = "計 " + row[B_COL].value
        elif 3 <= i <= 5:
            name = "前回計 " + row[B_COL].value
        elif 6 <= i <= 8:
            name = "総計 " + row[B_COL].value
        price_value = row[C_COL].value
        # Excelの計算による小数点誤差を避けるため、整数に変換
        if price_value is not None:
            price_value = int(price_value)
        total_data.append({"name": name, "price": price_value})

    return total_data


def get_public_expense_equivalent_total(total: Worksheet):
    """支出のうち公費負担相当額のデータを取得する

    Args:
        total (Worksheet): 合計のシート
    """

    get_public_expense_equivalent_total_data = []

    for row in total.iter_rows(min_row=15, max_row=23, max_col=I_COL + 1):
        get_public_expense_equivalent_total_data.append(
            {
                "item": row[C_COL].value,  # 項目（C列）
                "unit_price": extract_number(row[G_COL].value),  # 単価（G列）
                "quantity": extract_number(row[H_COL].value),  # 枚数（H列）
                "price": extract_number(row[I_COL].value),  # 金額（I列）
            }
        )

    return get_public_expense_equivalent_total_data


def get_total(total: Worksheet):
    """合計のデータを取得する

    Args:
        total (Worksheet): 合計のシート
    """

    individual_total = get_individual_total(total)
    public_expense_equivalent_total = get_public_expense_equivalent_total(total)

    return {
        "individual_total": individual_total,
        "public_expense_equivalent_total": public_expense_equivalent_total,
    }

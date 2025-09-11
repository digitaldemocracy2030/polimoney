from openpyxl.worksheet.worksheet import Worksheet

from util import B_COL, C_COL, G_COL, H_COL, I_COL, extract_number


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
        price_value = extract_number(row[C_COL].value)
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

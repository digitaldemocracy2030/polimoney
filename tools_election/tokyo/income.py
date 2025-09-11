from openpyxl.worksheet.worksheet import Worksheet

from util import A_COL, B_COL, C_COL, H_COL, extract_number


def get_individual_income(income: Worksheet):
    """収入の部の個別データを取得する

    A列 = 0, B列 = 1, ...
    結合されているセルは、左端のセルに情報が入っている

    Args:
        income (Worksheet): 収入の部のシート

    Returns:
        list: 収入の部のデータ
    """
    income_data = []

    # 4行目以降, AからJの列を取得
    min_row = 4

    for row in income.iter_rows(min_row=min_row, max_col=H_COL + 1):
        date_cell = row[A_COL]
        price_cell = row[B_COL]
        category_cell = row[C_COL]
        note_cell = row[H_COL]

        # 空白の場合は、小計を探すためスキップ
        if date_cell.value is None:
            continue

        # 小計になったら終了
        if date_cell.value == "小計":
            income_data.append({"total": extract_number(price_cell.value)})
            break

        income_data.append(
            {
                "date": date_cell.value.strftime("%Y-%m-%d"),
                "price": extract_number(price_cell.value),
                "category": category_cell.value,
                "note": note_cell.value,
            }
        )

    return income_data


def get_income(income: Worksheet):
    individual_income = get_individual_income(income)

    return {
        "individual_income": individual_income,
    }

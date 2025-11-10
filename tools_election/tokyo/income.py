import datetime

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
    json_checksum = 0  # jsonファイルの検証に使用

    # 3行目以降, AからJの列を取得
    min_row = 3

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
            json_checksum = extract_number(price_cell.value)
            break

        income_data.append(
            {
                "date": (
                    date_cell.value.strftime("%Y-%m-%d")
                    if isinstance(date_cell.value, (datetime.date, datetime.datetime))
                    else None
                ),
                "price": extract_number(price_cell.value),
                "category": category_cell.value,
                "note": note_cell.value,
            }
        )

    return income_data, json_checksum


def get_income(income: Worksheet):
    """収入の部の全データを取得する。

    個別の収入データとチェックサムを取得し、1つの辞書にまとめて返す。

    Args:
        income (Worksheet): 収入の部のExcelシート。

    Returns:
        dict: 以下のキーを持つ辞書:
            - individual_income (list[dict]): 収入の個別データリスト。
            - json_checksum (int or float): チェックサム（小計の金額）。
    """
    individual_income, json_checksum = get_individual_income(income)

    return {
        "individual_income": individual_income,
        "json_checksum": json_checksum,
    }

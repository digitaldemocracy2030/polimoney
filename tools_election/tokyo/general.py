import datetime

from openpyxl.worksheet.worksheet import Worksheet

from util import A_COL, B_COL, C_COL, D_COL, I_COL, extract_number


def get_individual_general(general: Worksheet):
    """共通フォーマットの個別データを取得する

    Args:
        general (Worksheet): 共通フォーマットのシート
    """

    general_data = []
    json_checksum = 0  # jsonファイルの検証に使用

    # 4行目以降, AからJの列を取得
    min_row = 4
    for row in general.iter_rows(min_row=min_row, max_col=I_COL + 1):
        date_cell = row[A_COL]
        price_cell = row[B_COL]
        category_cell = row[C_COL]
        purpose_cell = row[D_COL]
        note_cell = row[I_COL]

        # 小計になったら終了
        if date_cell.value == "小計":
            json_checksum = extract_number(price_cell.value)
            break

        general_data.append(
            {
                "date": (
                    date_cell.value.strftime("%Y-%m-%d")
                    if isinstance(date_cell.value, (datetime.date, datetime.datetime))
                    else None  # 日付は無い場合もある
                ),
                "price": extract_number(price_cell.value),
                "category": category_cell.value,
                "purpose": purpose_cell.value,
                "note": note_cell.value,
            }
        )

    return general_data, json_checksum


def get_general(general: Worksheet, name: str):
    individual_general, json_checksum = get_individual_general(general)

    return {
        f"individual_{name}": individual_general,
        "json_checksum": json_checksum,
    }

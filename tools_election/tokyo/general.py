from openpyxl import utils
from openpyxl.worksheet.worksheet import Worksheet

from util import extract_number

# AからJの列インデックスを取得（0始まり）
A_COL = utils.column_index_from_string("A") - 1
B_COL = utils.column_index_from_string("B") - 1
C_COL = utils.column_index_from_string("C") - 1
D_COL = utils.column_index_from_string("D") - 1
I_COL = utils.column_index_from_string("I") - 1


def get_individual_general(general: Worksheet):
    """共通フォーマットの個別データを取得する

    Args:
        general (Worksheet): 共通フォーマットのシート
    """

    general_data = []

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
            general_data.append({"total": extract_number(price_cell.value)})
            break

        general_data.append(
            {
                "date": date_cell.value.strftime("%Y-%m-%d")
                if date_cell.value
                else None,  # 日付は無い場合もある
                "price": extract_number(price_cell.value),
                "category": category_cell.value,
                "purpose": purpose_cell.value,
                "note": note_cell.value,
            }
        )

    return general_data


def get_general(general: Worksheet, name: str):
    individual_general = get_individual_general(general)

    return {
        f"individual_{name}": individual_general,
    }

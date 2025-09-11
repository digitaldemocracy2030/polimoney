from openpyxl import utils
from openpyxl.worksheet.worksheet import Worksheet

# AからJの列インデックスを取得（0始まり）
A_COL = utils.column_index_from_string("A") - 1
B_COL = utils.column_index_from_string("B") - 1
C_COL = utils.column_index_from_string("C") - 1
E_COL = utils.column_index_from_string("E") - 1
F_COL = utils.column_index_from_string("F") - 1
K_COL = utils.column_index_from_string("K") - 1


def get_individual_general(general: Worksheet):
    """共通フォーマットの個別データを取得する

    Args:
        general (Worksheet): 共通フォーマットのシート
    """

    general_data = []

    # 4行目以降, AからJの列を取得
    min_row = 4
    for row in general.iter_rows(min_row=min_row, max_col=K_COL + 1):
        date_cell = row[A_COL]
        price_cell = row[C_COL]
        category_cell = row[E_COL]
        purpose_cell = row[F_COL]
        note_cell = row[K_COL]
        # Noneになったら終了
        if price_cell.value is None:
            break

        general_data.append(
            {
                "date": date_cell.value.strftime("%Y-%m-%d")
                if date_cell.value
                else None,  # 日付は無い場合もある
                "price": int(price_cell.value),
                "category": category_cell.value,
                "purpose": purpose_cell.value,
                "note": note_cell.value,
            }
        )

    return general_data


def get_total_general(general: Worksheet):
    """共通フォーマットの合計データを取得する
    合計に関する記述は3行あり、位置は個別データの数によって変わるので、動的に取得する

    Args:
        general (Worksheet): 共通フォーマットのシート
    """

    total_general_data = []
    count = 0

    # 合計に関する記述は16行目より下にある
    min_row = 16

    for row in general.iter_rows(min_row=min_row, max_col=C_COL + 1):
        # 型をチェック
        value = row[B_COL].value
        if not isinstance(value, str):
            continue

        # B列が立候補準備のための支出、選挙運動のための支出、計のいずれでもなければスキップ
        value_str = value.strip().replace("　", "")
        if value_str not in ["立候補準備のための支出", "選挙運動のための支出", "計"]:
            continue

        # 3行取得したら終了
        if count == 3:
            break

        price_value = row[C_COL].value
        # Excelの計算による小数点誤差を避けるため、整数に変換
        if price_value is not None:
            price_value = int(price_value)
        total_general_data.append({"name": value_str, "price": price_value})
        count += 1

    return total_general_data


def get_general(general: Worksheet, name: str):
    individual_general = get_individual_general(general)

    total_general = get_total_general(general)

    return {
        f"individual_{name}": individual_general,
        f"total_{name}": total_general,
    }

import json

from openpyxl import utils
from openpyxl.worksheet.worksheet import Worksheet

# AからJの列インデックスを取得（0始まり）
A_COL = utils.column_index_from_string("A") - 1
B_COL = utils.column_index_from_string("B") - 1
C_COL = utils.column_index_from_string("C") - 1
E_COL = utils.column_index_from_string("E") - 1
F_COL = utils.column_index_from_string("F") - 1
K_COL = utils.column_index_from_string("K") - 1


def get_individual_personnel(personnel: Worksheet):
    """人件の部の個別データを取得する

    Args:
        personnel (Worksheet): 人件の部のシート
    """

    personnel_data = []

    # 4行目以降, AからJの列を取得
    min_row = 4
    for row in personnel.iter_rows(min_row=min_row, max_col=K_COL + 1):
        date_cell = row[A_COL]
        price_cell = row[C_COL]
        category_cell = row[E_COL]
        purpose_cell = row[F_COL]
        note_cell = row[K_COL]
        # Noneになったら終了
        if date_cell.value is None:
            break

        personnel_data.append(
            {
                "date": date_cell.value.strftime("%Y-%m-%d"),
                "price": int(price_cell.value),
                "category": category_cell.value,
                "purpose": purpose_cell.value,
                "note": note_cell.value,
            }
        )

    return personnel_data


def get_total_personnel(personnel: Worksheet):
    """人件の部の合計データを取得する
    合計に関する記述は3行あり、位置は個別データの数によって変わるので、動的に取得する

    Args:
        personnel (Worksheet): 人件の部のシート
    """

    total_personnel_data = []
    count = 0

    # 合計に関する記述は16行目より下にある
    min_row = 16

    for row in personnel.iter_rows(min_row=min_row, max_col=C_COL + 1):
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

        total_personnel_data.append({"name": value_str, "price": row[C_COL].value})
        count += 1

    return total_personnel_data


def get_personnel(personnel: Worksheet):
    individual_personnel = get_individual_personnel(personnel)
    print(json.dumps(individual_personnel, indent=4, ensure_ascii=False))

    total_personnel = get_total_personnel(personnel)
    print(json.dumps(total_personnel, indent=4, ensure_ascii=False))

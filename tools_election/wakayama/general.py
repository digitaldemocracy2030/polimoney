from openpyxl.worksheet.worksheet import Worksheet

from util import (
    A_COL,
    B_COL,
    C_COL,
    E_COL,
    F_COL,
    J_COL,
    K_COL,
    convert_date,
    extract_number,
)


def get_individual_general(general: Worksheet, name: str):
    """共通フォーマットの個別データを取得する。

    Excelシートの4行目以降から、日付、金額、種別、目的、備考を取得する。
    金額セルがNoneになったら処理を終了する。

    Args:
        general (Worksheet): 共通フォーマットのExcelシート。
        name (str): データの種類を表す名前（例: "personnel", "communication"）。

    Returns:
        list[dict]: 個別データのリスト。各要素は以下のキーを持つ辞書:
            - category (str): データの種類を表す名前（例: "personnel", "communication"）。
            - date (str or None): 日付（YYYY-MM-DD形式）。日付がない場合はNone。date_cell.valueがdatetime型であることを前提とする。
            - price (int or float): 金額。
            - type (str or None): 種別。
            - purpose (str or None): 目的。
            - non_monetary_basis (str or None): 金銭以外の見積もりの根拠。
            - note (str or None): 備考。
    """

    general_data = []

    # 4行目以降, AからJの列を取得
    min_row = 4
    for row in general.iter_rows(min_row=min_row, max_col=K_COL + 1):
        date_cell = row[A_COL]  # 日付
        price_cell = row[C_COL]  # 金額
        type_cell = row[E_COL]  # 種別
        purpose_cell = row[F_COL]  # 支出の目的
        non_monetary_basis_cell = row[J_COL]  # 金銭以外の見積もりの根拠
        note_cell = row[K_COL]  # 備考
        # Noneになったら終了
        if price_cell.value is None:
            break

        general_data.append(
            {
                "category": name,  # シート名をカテゴリとして使用
                "date": convert_date(date_cell.value),
                "price": extract_number(price_cell.value),  # 金額
                "type": type_cell.value,  # 種別
                "purpose": purpose_cell.value,  # 支出の目的
                # 金銭以外の見積もりの根拠
                "non_monetary_basis": non_monetary_basis_cell.value,
                "note": note_cell.value,  # 備考
            }
        )

    return general_data


def get_total_general(general: Worksheet):
    """共通フォーマットの合計データを取得する。

    Excelシートの16行目以降から、「立候補準備のための支出」「選挙運動のための支出」「計」の
    3行を動的に検索して取得する。位置は個別データの数によって変わるため、動的に取得する。

    Args:
        general (Worksheet): 共通フォーマットのExcelシート。

    Returns:
        tuple[list[dict], int or float]: 合計データのリストとチェックサム（「計」の金額）のタプル。
            合計データの各要素は以下のキーを持つ辞書:
            - name (str): 項目名（「立候補準備のための支出」「選挙運動のための支出」「計」のいずれか）。
            - price (int or float): 金額。
    """

    total_general_data = []
    count = 0
    json_checksum = 0  # jsonファイルの検証に使用

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
        price_value = extract_number(price_value)
        total_general_data.append({"name": value_str, "price": price_value})
        count += 1
        if value_str == "計":
            json_checksum = price_value

    return total_general_data, json_checksum


def get_general(general: Worksheet, name: str):
    """共通フォーマットのシートからデータを取得し、辞書形式で返す。

    Args:
        general (Worksheet): 共通フォーマットのExcelシート。
        name (str): データの種類を表す名前（例: "personnel", "communication"）。

    Returns:
        dict: 以下のキーを持つ辞書:
            - individual_{name} (list[dict]): 個別データのリスト。
            - total_{name} (list[dict]): 合計データのリスト。
            - json_checksum (int or float): チェックサム（「計」の金額）。
    """
    individual_general = get_individual_general(general, name)

    total_general, json_checksum = get_total_general(general)

    return {
        f"individual_{name}": individual_general,
        f"total_{name}": total_general,
        "json_checksum": json_checksum,
    }

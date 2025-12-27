from openpyxl.worksheet.worksheet import Worksheet

from util import A_COL, B_COL, C_COL, D_COL, H_COL, I_COL, convert_date, extract_number


def get_individual_general(general: Worksheet, name: str):
    """共通フォーマットの個別データを取得する。

    Excelシートの4行目以降から、日付、金額、種別、目的、備考を取得する。
    「小計」行に到達したら処理を終了し、小計の金額をチェックサムとして返す。

    Args:
        general (Worksheet): 共通フォーマットのExcelシート。
        name (str): データの種類を表す名前（例: "printing", "building"）。

    Returns:
        tuple[list[dict], int or float]: 個別データのリストとチェックサム（小計の金額）のタプル。
            個別データの各要素は以下のキーを持つ辞書:
            - category (str): データの種類を表す名前（例: "printing", "building"）。
            - date (str or None): 日付（YYYY-MM-DD形式）。日付がない場合はNone。
            - price (int or float): 金額。
            - type (str or None): 種別。
            - purpose (str or None): 目的。
            - non_monetary_basis (str or None): 金銭以外の見積もりの根拠。
            - note (str or None): 備考。
    """

    general_data = []
    json_checksum = 0  # jsonファイルの検証に使用

    # 4行目以降, AからJの列を取得
    min_row = 4
    for row in general.iter_rows(min_row=min_row, max_col=I_COL + 1):
        date_cell = row[A_COL]  # 日付
        price_cell = row[B_COL]  # 金額
        type_cell = row[C_COL]  # 種別
        purpose_cell = row[D_COL]  # 支出の目的
        non_monetary_basis_cell = row[H_COL]  # 金銭以外の見積もりの根拠
        note_cell = row[I_COL]  # 備考

        # 小計になったら終了
        if date_cell.value == "小計":
            json_checksum = extract_number(price_cell.value)
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

    return general_data, json_checksum


def get_general(general: Worksheet, name: str):
    """共通フォーマットのシートからデータを取得し、辞書形式で返す。

    Args:
        general (Worksheet): 共通フォーマットのExcelシート。
        name (str): データの種類を表す名前（例: "printing", "building"）。

    Returns:
        dict: 以下のキーを持つ辞書:
            - individual_{name} (list[dict]): 個別データのリスト。
            - json_checksum (int or float): チェックサム（小計の金額）。
    """
    individual_general, json_checksum = get_individual_general(general, name)

    return {
        f"individual_{name}": individual_general,
        "json_checksum": json_checksum,
    }

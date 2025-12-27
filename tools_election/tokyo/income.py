from openpyxl.worksheet.worksheet import Worksheet

from util import A_COL, B_COL, C_COL, G_COL, H_COL, convert_date, extract_number


def get_individual_income(income: Worksheet):
    """収入の部の個別データを取得する。

    Excelシートの3行目以降から、日付、金額、種別、備考を取得する。
    空白の場合はスキップし、「小計」行に到達したら処理を終了し、小計の金額をチェックサムとして返す。
    結合されているセルは、左端のセルに情報が入っている。

    Args:
        income (Worksheet): 収入の部のExcelシート。

    Returns:
        tuple[list[dict], int or float]: 個別データのリストとチェックサム（小計の金額）のタプル。
            個別データの各要素は以下のキーを持つ辞書:
            - category (str): データの種類を表す名前（常に"income"）。
            - date (str or None): 日付（YYYY-MM-DD形式）。日付がない場合はNone。
            - price (int or float): 金額。
            - type (str or None): 種別。
            - non_monetary_basis (str or None): 金銭以外の見積もりの根拠。
            - note (str or None): 備考。
    """
    income_data = []
    json_checksum = 0  # jsonファイルの検証に使用

    # 3行目以降, AからJの列を取得
    min_row = 3

    for row in income.iter_rows(min_row=min_row, max_col=H_COL + 1):
        date_cell = row[A_COL]  # 日付
        price_cell = row[B_COL]  # 金額
        type_cell = row[C_COL]  # 種別
        # 金銭以外の寄附及びその他の収入の見積の根拠
        non_monetary_basis_cell = row[G_COL]
        note_cell = row[H_COL]  # 備考

        # 空白の場合は、小計を探すためスキップ
        if date_cell.value is None:
            continue

        # 小計になったら終了
        if date_cell.value == "小計":
            json_checksum = extract_number(price_cell.value)
            break

        income_data.append(
            {
                "category": "income",  # 収入にはカテゴリがない
                "date": convert_date(date_cell.value),
                "price": extract_number(price_cell.value),  # 金額
                "type": type_cell.value,  # 種別
                # 金銭以外の見積もりの根拠
                "non_monetary_basis": non_monetary_basis_cell.value,
                "note": note_cell.value,  # 備考
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

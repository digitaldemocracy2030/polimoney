from openpyxl.worksheet.worksheet import Worksheet

from util import B_COL, C_COL, E_COL, H_COL, I_COL, extract_number


def get_individual_total(total: Worksheet):
    """合計の個別データを取得する。

    Excelシートの2行目から10行目までを読み込み、今回計・前回計・総計の各項目を取得する。
    合計に関しては、データの追加はないため、固定の行範囲を指定するだけで取得できる。

    Args:
        total (Worksheet): 合計のExcelシート。

    Returns:
        list[dict]: 合計のデータリスト。各要素は以下のキーを持つ辞書:
            - name (str): カテゴリ名と項目名を結合した文字列（例: "今回計 印刷費"）。
            - price (int or float): 金額。
    """

    total_data = []

    # 2~10列目を取得
    for i, row in enumerate(total.iter_rows(min_row=2, max_row=10, max_col=C_COL + 1)):
        if 0 <= i <= 2:
            name = "今回計 " + row[B_COL].value
        elif 3 <= i <= 5:
            name = "前回計 " + row[B_COL].value
        elif 6 <= i <= 8:
            name = "総計 " + row[B_COL].value
        price_value = extract_number(row[C_COL].value)
        # extract_number関数内で四捨五入処理済み
        total_data.append({"name": name, "price": price_value})

    return total_data


def get_public_expense_equivalent_total(total: Worksheet):
    """支出のうち公費負担相当額のデータを取得する。

    Excelシートの12行目以降から、公費負担相当額の内訳を取得する。
    「計」行に到達したら処理を終了する。

    Args:
        total (Worksheet): 合計のExcelシート。

    Returns:
        list[dict]: 公費負担相当額のデータリスト。各要素は以下のキーを持つ辞書:
            - item (str): 項目名。「計」の場合は"total"キーを持つ辞書になる。
            - unit_price (int or float): 単価。
            - quantity (int or float): 数量（枚数）。
            - price (int or float): 金額。
            - total (int or float): 「計」行の場合のみ存在する合計金額。
    """

    get_public_expense_equivalent_total_data = []

    for row in total.iter_rows(min_row=12, max_col=I_COL + 1):
        raw = row[B_COL].value
        if not isinstance(raw, str) or raw.strip() == "":
            continue
        item_cell = raw.strip()
        if item_cell == "計":
            get_public_expense_equivalent_total_data.append(
                {"total": extract_number(row[H_COL].value)}
            )
            break
        get_public_expense_equivalent_total_data.append(
            {
                "item": item_cell,  # 項目（C列）
                "unit_price": extract_number(row[C_COL].value),  # 単価（C列）
                "quantity": extract_number(row[E_COL].value),  # 枚数（E列）
                "price": extract_number(row[H_COL].value),  # 金額（H列）
            }
        )

    return get_public_expense_equivalent_total_data


def get_total(total: Worksheet):
    """合計の全データを取得する。

    個別の合計データと公費負担相当額の合計データを取得し、1つの辞書にまとめて返す。

    Args:
        total (Worksheet): 合計のExcelシート。

    Returns:
        dict: 以下のキーを持つ辞書:
            - individual_total (list[dict]): 合計の個別データリスト。
            - public_expense_equivalent_total (list[dict]): 公費負担相当額の合計データリスト。
    """

    individual_total = get_individual_total(total)
    public_expense_equivalent_total = get_public_expense_equivalent_total(total)

    return {
        "individual_total": individual_total,
        "public_expense_equivalent_total": public_expense_equivalent_total,
    }

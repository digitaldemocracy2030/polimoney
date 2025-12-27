from openpyxl.worksheet.worksheet import Worksheet

from util import B_COL, C_COL, E_COL, H_COL, I_COL, extract_number


def get_individual_summary(summary: Worksheet):
    """支出計の個別データを取得する。

    Excelシートの2行目から10行目までを読み込み、今回計・前回計・総計の各項目を取得する。
    支出計に関しては、データの追加はないため、固定の行範囲を指定するだけで取得できる。

    Args:
        summary (Worksheet): 支出計のExcelシート。

    Returns:
        list[dict]: 支出計のデータリスト。各要素は以下のキーを持つ辞書:
            - name (str): 集計ラベルと項目名を結合した文字列（例: "今回計 印刷費"）。
            - price (int or float): 金額。
    """

    summary_data = []

    # 2~10列目を取得
    for i, row in enumerate(
        summary.iter_rows(min_row=2, max_row=10, max_col=C_COL + 1)
    ):
        aggregate_label = ""
        if 0 <= i <= 2:
            aggregate_label = "今回計 " + str(row[B_COL].value)
        elif 3 <= i <= 5:
            aggregate_label = "前回計 " + str(row[B_COL].value)
        elif 6 <= i <= 8:
            aggregate_label = "総計 " + str(row[B_COL].value)
        price_value = extract_number(row[C_COL].value)
        # extract_number関数内で四捨五入処理済み
        summary_data.append({"name": aggregate_label, "price": price_value})

    return summary_data


def get_public_expense_equivalent_summary(summary: Worksheet):
    """支出のうち公費負担相当額のデータを取得する。

    Excelシートの12行目以降から、公費負担相当額の内訳を取得する。
    「計」行に到達したら処理を終了する。

    Args:
        summary (Worksheet): 支出計のExcelシート。

    Returns:
        list[dict]: 公費負担相当額のデータリスト。各要素は以下のキーを持つ辞書:
            - item (str): 項目名。「計」の場合は"計"という文字列が設定される。
            - unit_price (int or float or None): 単価。「計」行の場合はNone。
            - quantity (int or float or None): 数量（枚数）。「計」行の場合はNone。
            - price (int or float): 金額。
    """

    get_public_expense_equivalent_summary_data = []

    for row in summary.iter_rows(min_row=12, max_col=I_COL + 1):
        raw = row[B_COL].value
        if not isinstance(raw, str) or raw.strip() == "":
            continue
        item_cell = raw.strip()
        # うち公費負担 計 の行 (単価(A)と枚数(B)が存在しない)
        if item_cell == "計":
            get_public_expense_equivalent_summary_data.append(
                {
                    "item": "計",
                    "unit_price": None,
                    "quantity": None,
                    "price": extract_number(row[H_COL].value),
                }
            )
            break
        # それ以外の行 (単価と枚数が存在する)
        get_public_expense_equivalent_summary_data.append(
            {
                "item": item_cell,  # 項目（C列）
                "unit_price": extract_number(row[C_COL].value),  # 単価（C列）
                "quantity": extract_number(row[E_COL].value),  # 枚数（E列）
                "price": extract_number(row[H_COL].value),  # 金額（H列）
            }
        )

    return get_public_expense_equivalent_summary_data


def get_summary(summary: Worksheet):
    """支出計の全データを取得する。

    個別の支出計データと公費負担相当額の合計データを取得し、1つの辞書にまとめて返す。

    Args:
        summary (Worksheet): 支出計のExcelシート。

    Returns:
        dict: 以下のキーを持つ辞書:
            - individual_summary (list[dict]): 支出計の個別データリスト。
            - public_expense_equivalent_summary (list[dict]): 公費負担相当額の合計データリスト。
    """

    individual_summary = get_individual_summary(summary)
    public_expense_equivalent_summary = get_public_expense_equivalent_summary(summary)

    return {
        "individual_summary": individual_summary,
        "public_expense_equivalent_summary": public_expense_equivalent_summary,
    }

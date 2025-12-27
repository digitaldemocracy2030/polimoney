from openpyxl.worksheet.worksheet import Worksheet

from util import B_COL, C_COL, G_COL, H_COL, I_COL, extract_number


def get_individual_summary(summary: Worksheet):
    """支出計の個別データを取得する。

    Excelシートの5行目から13行目までを読み込み、計・前回計・総計の各項目を取得する。
    支出計に関しては、データの追加はないため、固定の行範囲を指定するだけで取得できる。

    Args:
        summary (Worksheet): 支出計のExcelシート。

    Returns:
        list[dict]: 支出計のデータリスト。各要素は以下のキーを持つ辞書:
            - name (str): 集計ラベルと項目名を結合した文字列（例: "計 人件費"）。
            - price (int or float): 金額。
    """

    summary_data = []

    # 4~13列目を取得
    for i, row in enumerate(
        summary.iter_rows(min_row=5, max_row=13, max_col=C_COL + 1)
    ):
        aggregate_label = ""
        if 0 <= i <= 2:
            aggregate_label = "計 " + str(row[B_COL].value)
        elif 3 <= i <= 5:
            aggregate_label = "前回計 " + str(row[B_COL].value)
        elif 6 <= i <= 8:
            aggregate_label = "総計 " + str(row[B_COL].value)
        price_value = extract_number(row[C_COL].value)
        summary_data.append({"name": aggregate_label, "price": price_value})

    return summary_data


def get_public_expense_equivalent_summary(summary: Worksheet):
    """支出のうち公費負担相当額のデータを取得する。

    Excelシートの15行目から23行目までを読み込み、公費負担相当額の内訳を取得する。

    Args:
        summary (Worksheet): 支出計のExcelシート。

    Returns:
        list[dict]: 公費負担相当額のデータリスト。各要素は以下のキーを持つ辞書:
            - item (str): 項目名。
            - unit_price (int or float): 単価。
            - quantity (int or float): 数量（枚数）。
            - price (int or float): 金額。
    """

    get_public_expense_equivalent_summary_data = []

    for row in summary.iter_rows(min_row=15, max_row=23, max_col=I_COL + 1):
        get_public_expense_equivalent_summary_data.append(
            {
                "item": row[C_COL].value,  # 項目（C列）
                "unit_price": extract_number(row[G_COL].value),  # 単価（G列）
                "quantity": extract_number(row[H_COL].value),  # 枚数（H列）
                "price": extract_number(row[I_COL].value),  # 金額（I列）
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

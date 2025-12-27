import re

from openpyxl.worksheet.worksheet import Worksheet

from util import B_COL, C_COL


def get_individual_income_summary(income_summary: Worksheet):
    """収入計の個別データを取得する。

    Excelシートの2行目から10行目までを読み込み、今回計・前回計・総計の各項目を取得する。
    各行には集計ラベル（今回計/前回計/総計）と項目名、金額が含まれる。

    Args:
        income_summary (Worksheet): 収入計のExcelシート。

    Returns:
        list[dict]: 収入計のデータリスト。各要素は以下のキーを持つ辞書:
            - name (str): 集計ラベルと項目名を結合した文字列（例: "今回計 寄附"）。
            - price (int or float or None): 金額。セルの値がそのまま返される。
    """
    income_summary_data = []

    for i, row in enumerate(
        income_summary.iter_rows(min_row=2, max_row=10, max_col=C_COL + 1)
    ):
        aggregate_label = ""
        if 0 <= i <= 2:
            aggregate_label = "今回計 "
        elif 3 <= i <= 5:
            aggregate_label = "前回計 "
        elif 6 <= i <= 8:
            aggregate_label = "総計 "

        name_cell = row[B_COL]
        price_cell = row[C_COL]
        income_summary_data.append(
            {"name": aggregate_label + str(name_cell.value), "price": price_cell.value}
        )

    return income_summary_data


def get_public_expense_summary(income_summary: Worksheet):
    """公費負担相当額のサマリーを取得する。

    Excelシートの12行目C列から「公費負担相当額」の文字列を検索し、
    正規表現を使用して金額を抽出する。

    Args:
        income_summary (Worksheet): 収入計のExcelシート。

    Returns:
        dict: 公費負担相当額のデータ。以下のキーを持つ:
            - summary (int): 公費負担相当額の総額。見つからない場合は空の辞書を返す。
    """
    public_expense_summary_data = {}

    public_expense_summary_str = income_summary.cell(row=12, column=C_COL + 1).value

    # 総額を取得する正規表現
    summary_pattern = r"公費負担相当額[：:]\s*(\d+(?:,\d+)*)円"
    summary_match = re.search(summary_pattern, str(public_expense_summary_str))

    public_expense_summary_data: dict[str, int | dict] = {}

    if summary_match:
        public_expense_summary_data["summary"] = int(
            summary_match.group(1).replace(",", "")
        )

    # 公費負担相当額について内訳を書く人がいたら、ここに追加する
    # 中村さんは書いていないので、空の辞書を返す
    public_expense_summary_data["breakdown"] = {}

    return public_expense_summary_data


def get_income_summary(income_summary: Worksheet):
    """収入計の全データを取得する。

    個別の収入計データと公費負担相当額のサマリーを取得し、1つの辞書にまとめて返す。

    Args:
        income_summary (Worksheet): 収入計のExcelシート。

    Returns:
        dict: 以下のキーを持つ辞書:
            - individual_income_summary (list[dict]): 収入計の個別データリスト。
            - public_expense_summary (dict): 公費負担相当額のサマリーデータ。
    """
    individual_income_summary = get_individual_income_summary(income_summary)
    public_expense_summary = get_public_expense_summary(income_summary)
    return {
        "individual_income_summary": individual_income_summary,
        "public_expense_summary": public_expense_summary,
    }

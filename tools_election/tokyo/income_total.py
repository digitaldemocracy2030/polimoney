import re

from openpyxl.worksheet.worksheet import Worksheet

from util import B_COL, C_COL


def get_individual_income_total(income_total: Worksheet):
    """収入計の個別データを取得する。

    Excelシートの2行目から10行目までを読み込み、今回計・前回計・総計の各項目を取得する。
    各行には集計ラベル（今回計/前回計/総計）と項目名、金額が含まれる。

    Args:
        income_total (Worksheet): 収入計のExcelシート。

    Returns:
        list[dict]: 収入計のデータリスト。各要素は以下のキーを持つ辞書:
            - name (str): 集計ラベルと項目名を結合した文字列（例: "今回計 寄附"）。
            - price: 金額。
    """
    income_total_data = []

    for i, row in enumerate(
        income_total.iter_rows(min_row=2, max_row=10, max_col=C_COL + 1)
    ):
        if 0 <= i <= 2:
            aggregate_label = "今回計 "
        elif 3 <= i <= 5:
            aggregate_label = "前回計 "
        elif 6 <= i <= 8:
            aggregate_label = "総計 "

        name_cell = row[B_COL]
        price_cell = row[C_COL]
        income_total_data.append(
            {"name": aggregate_label + name_cell.value, "price": price_cell.value}
        )

    return income_total_data


def get_public_expense_equivalent(income_total: Worksheet):
    """公費負担相当額を取得する。

    Excelシートの12行目C列から「公費負担相当額」の文字列を検索し、
    正規表現を使用して金額を抽出する。

    Args:
        income_total (Worksheet): 収入計のExcelシート。

    Returns:
        dict: 公費負担相当額のデータ。以下のキーを持つ:
            - total (int): 公費負担相当額の総額。見つからない場合は空の辞書を返す。
    """
    public_expense_equivalent_data = {}

    public_expense_equivalent_str = income_total.cell(row=12, column=C_COL + 1).value

    # 総額を取得する正規表現
    total_pattern = r"公費負担相当額[：:]\s*(\d+(?:,\d+)*)円"
    total_match = re.search(total_pattern, str(public_expense_equivalent_str))

    if total_match:
        public_expense_equivalent_data = {
            "total": int(total_match.group(1).replace(",", ""))
        }

    return public_expense_equivalent_data


def get_income_total(income_total: Worksheet):
    """収入計の全データを取得する。

    個別の収入計データと公費負担相当額を取得し、1つの辞書にまとめて返す。

    Args:
        income_total (Worksheet): 収入計のExcelシート。

    Returns:
        dict: 以下のキーを持つ辞書:
            - individual_income_total (list[dict]): 収入計の個別データリスト。
            - public_expense_equivalent (dict): 公費負担相当額のデータ。
    """
    individual_income_total = get_individual_income_total(income_total)
    public_expense_equivalent = get_public_expense_equivalent(income_total)
    return {
        "individual_income_total": individual_income_total,
        "public_expense_equivalent": public_expense_equivalent,
    }

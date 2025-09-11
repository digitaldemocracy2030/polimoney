import re

from openpyxl.worksheet.worksheet import Worksheet

from util import B_COL, C_COL


def get_individual_income_total(income_total: Worksheet):
    """収入計を取得する

    Args:
        income_total (Worksheet): 収入計のシート
    """
    income_total_data = []

    for i, row in enumerate(
        income_total.iter_rows(min_row=2, max_row=10, max_col=C_COL + 1)
    ):
        if 0 <= i <= 2:
            category = "今回計 "
        elif 3 <= i <= 5:
            category = "前回計 "
        elif 6 <= i <= 8:
            category = "総計 "

        name_cell = row[B_COL]
        price_cell = row[C_COL]
        income_total_data.append(
            {"name": category + name_cell.value, "price": price_cell.value}
        )

    return income_total_data


def get_public_expense_equivalent(income_total: Worksheet):
    """公費負担相当額を取得する

    Args:
        income_total (Worksheet): 収入計のシート
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
    """収入計を取得する

    Args:
        income_total (Worksheet): 収入計のシート
    """
    individual_income_total = get_individual_income_total(income_total)
    public_expense_equivalent = get_public_expense_equivalent(income_total)
    return {
        "individual_income_total": individual_income_total,
        "public_expense_equivalent": public_expense_equivalent,
    }

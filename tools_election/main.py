import logging
import sys

import openpyxl

from wakayama.income import get_income
from wakayama.personnel import get_personnel

# ログ設定
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)


def analyze(input_file):
    wb = openpyxl.load_workbook(input_file, data_only=True)

    # 各シートを取得
    income = wb["収入"]
    personnel = wb["人件"]
    # building = wb["家屋"]
    # communication = wb["通信"]
    # transportation = wb["交通"]
    # printing = wb["印刷"]
    # advertising = wb["広告"]
    # stationery = wb["文具"]
    # food = wb["食料"]
    # accommodation = wb["休泊"]
    # miscellaneous = wb["雑費"]
    # total = wb["合計"]

    # 分析
    get_income(income)
    get_personnel(personnel)


def main():
    if len(sys.argv) != 2:
        logging.error("python main.py <input_file> と入力してください")
        sys.exit(1)

    logging.info(f"分析を開始します: {sys.argv[1]}")
    input_file = sys.argv[1]
    analyze(input_file)
    logging.info(f"分析を完了しました: {sys.argv[1]}")

    return 0


if __name__ == "__main__":
    sys.exit(main())

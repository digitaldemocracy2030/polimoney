import json
import logging
import sys

import openpyxl

# from tokyo.general import get_general
from tokyo.general import get_general
from tokyo.income import get_income
from tokyo.income_total import get_income_total

# ログ設定
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)


def analyze(input_file):
    """
    指定されたExcelファイルを解析し、各シートのデータをJSONファイルとして出力する。

    人件・通信・交通・広告・文具・食料・休泊・雑費は同じフォーマットで処理される。

    Args:
        input_file (str): 解析対象のExcelファイルのパス
    """
    wb = openpyxl.load_workbook(input_file, data_only=True)

    # 各シートを取得
    income = wb["【２】収入"]
    income_total = wb["【３】収入計"]
    printing = wb["【４】支出 (印刷費)"]
    building = wb["【４】支出 (家屋費)"]
    advertising = wb["【４】支出 (広告費)"]
    transportation = wb["【４】支出 (交通費)"]
    stationery = wb["【４】支出 (文具費)"]
    food = wb["【４】支出 (食料費)"]
    miscellaneous = wb["【４】支出 (雑費)"]
    # total = wb["支出 (計)"]

    # 分析
    income_data = get_income(income)  # 収入
    income_total_data = get_income_total(income_total)  # 収入計
    printing_data = get_general(printing, "printing")  # 印刷
    building_data = get_general(building, "building")  # 家屋
    advertising_data = get_general(advertising, "advertising")  # 広告
    transportation_data = get_general(transportation, "transportation")  # 交通
    stationery_data = get_general(stationery, "stationery")  # 文具
    food_data = get_general(food, "food")  # 食料
    miscellaneous_data = get_general(miscellaneous, "miscellaneous")  # 雑費
    # total_data = get_total(total)  # 合計

    with open("output_json/income_data.json", "w", encoding="utf-8") as f:
        json.dump(income_data, f, indent=4, ensure_ascii=False)
    with open("output_json/income_total_data.json", "w", encoding="utf-8") as f:
        json.dump(income_total_data, f, indent=4, ensure_ascii=False)
    with open("output_json/printing_data.json", "w", encoding="utf-8") as f:
        json.dump(printing_data, f, indent=4, ensure_ascii=False)
    with open("output_json/building_data.json", "w", encoding="utf-8") as f:
        json.dump(building_data, f, indent=4, ensure_ascii=False)
    with open("output_json/advertising_data.json", "w", encoding="utf-8") as f:
        json.dump(advertising_data, f, indent=4, ensure_ascii=False)
    with open("output_json/transportation_data.json", "w", encoding="utf-8") as f:
        json.dump(transportation_data, f, indent=4, ensure_ascii=False)
    with open("output_json/stationery_data.json", "w", encoding="utf-8") as f:
        json.dump(stationery_data, f, indent=4, ensure_ascii=False)
    with open("output_json/food_data.json", "w", encoding="utf-8") as f:
        json.dump(food_data, f, indent=4, ensure_ascii=False)
    with open("output_json/miscellaneous_data.json", "w", encoding="utf-8") as f:
        json.dump(miscellaneous_data, f, indent=4, ensure_ascii=False)


def main():
    if len(sys.argv) != 2:
        logging.error("python wakayama.py <input_file> と入力してください")
        sys.exit(1)

    logging.info(f"分析を開始します: {sys.argv[1]}")
    input_file = sys.argv[1]
    analyze(input_file)
    logging.info(f"分析を完了しました: {sys.argv[1]}")

    return 0


if __name__ == "__main__":
    sys.exit(main())

import json
import logging
import os
import re
import sys

import openpyxl

# from tokyo.general import get_general
from tokyo.general import get_general
from tokyo.income import get_income
from tokyo.income_total import get_income_total
from tokyo.total import get_total

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
    total = wb["【５】支出計"]

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
    total_data = get_total(total)  # 合計

    # ファイル名に使えない文字を_に変換
    safe_input_file = re.sub(r'[\\/:*?"<>|]', "_", input_file)

    # フォルダを作成
    os.makedirs(f"output_json/{safe_input_file}", exist_ok=True)

    data_list = [
        ("income_data.json", income_data),
        ("income_total_data.json", income_total_data),
        ("printing_data.json", printing_data),
        ("building_data.json", building_data),
        ("advertising_data.json", advertising_data),
        ("transportation_data.json", transportation_data),
        ("stationery_data.json", stationery_data),
        ("food_data.json", food_data),
        ("miscellaneous_data.json", miscellaneous_data),
        ("total_data.json", total_data),
    ]

    for file_name, data in data_list:
        path = f"output_json/{safe_input_file}/{file_name}"
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4, ensure_ascii=False)


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

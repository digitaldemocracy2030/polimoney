import json
import logging
import sys

import openpyxl

import util
from wakayama.building import get_building
from wakayama.general import get_general
from wakayama.income import get_income
from wakayama.total import get_total

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
    income = wb["収入"]
    personnel = wb["人件"]
    building = wb["家屋"]
    communication = wb["通信"]
    transportation = wb["交通"]
    printing = wb["印刷"]
    advertising = wb["広告"]
    stationery = wb["文具"]
    food = wb["食料"]
    accommodation = wb["休泊"]
    miscellaneous = wb["雑費"]
    total = wb["支出 (計)"]

    # 分析
    income_data = get_income(income)  # 収入
    personnel_data = get_general(personnel, "personnel")  # 人件
    building_data = get_building(building)  # 家屋
    communication_data = get_general(communication, "communication")  # 通信
    transportation_data = get_general(transportation, "transportation")  # 交通
    printing_data = get_general(printing, "printing")  # 印刷
    advertising_data = get_general(advertising, "advertising")  # 広告
    stationery_data = get_general(stationery, "stationery")  # 文具
    food_data = get_general(food, "food")  # 食料
    accommodation_data = get_general(accommodation, "accommodation")  # 休泊
    miscellaneous_data = get_general(miscellaneous, "miscellaneous")  # 雑費
    total_data = get_total(total)  # 合計

    # フォルダを作成
    safe_input_file = util.create_output_folder(input_file)

    data_list = [
        ("income_data.json", income_data),
        ("personnel_data.json", personnel_data),
        ("building_data.json", building_data),
        ("communication_data.json", communication_data),
        ("transportation_data.json", transportation_data),
        ("printing_data.json", printing_data),
        ("advertising_data.json", advertising_data),
        ("stationery_data.json", stationery_data),
        ("food_data.json", food_data),
        ("accommodation_data.json", accommodation_data),
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

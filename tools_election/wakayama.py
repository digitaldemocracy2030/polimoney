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


def analyze(income_file_path):
    """
    指定されたExcelファイルを解析し、各シートのデータをJSONファイルとして出力する。

    人件・通信・交通・広告・文具・食料・休泊・雑費は同じフォーマットで処理される。

    Args:
        input_file (str): 解析対象のExcelファイルのパス
    """
    wb = openpyxl.load_workbook(income_file_path, data_only=True)

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
    safe_input_file = util.create_output_folder(income_file_path)

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

    util.create_individual_json(data_list, safe_input_file)

    file_path_list = [
        f"output_json/{safe_input_file}/{file_name}" for file_name, _ in data_list
    ]
    combined_data, combined_file_path = util.create_combined_json(
        file_path_list, safe_input_file
    )
    if not util.has_income_data(combined_data):
        logging.info(
            "入力したExcelファイルに収入データが含まれていないため、収入データを追加します"
        )
        income_file_path = (
            input("収入データが含まれているExcelファイルのパスを入力してください: ")
            .strip()
            .strip('"')
            .strip("'")
        )
        analyze_income(income_file_path, combined_file_path)


def analyze_income(income_file_path: str, combined_file_path: str):
    """
    最初に入力したExcelファイルに収入データが含まれていない場合、収入データを追加して結合データを更新する。

    収支報告書Excelファイルが複数あり、かつ収入と支出のデータが分かれている場合に使用する。

    Args:
        income_file_path (str): 収入データが含まれているExcelファイルのパス
        combined_file_path (str): 結合データのパス
    """
    wb = openpyxl.load_workbook(income_file_path, data_only=True)

    # 各シートを取得
    income = wb["収入"]
    income_data = get_income(income)

    # フォルダを作成
    safe_input_file = util.create_output_folder(income_file_path)

    # 収入データのみを個別データとして出力
    data_list = [
        ("income_data.json", income_data),
    ]
    util.create_individual_json(data_list, safe_input_file)

    # 支出データを取り出す
    with open(combined_file_path, "r", encoding="utf-8") as f:
        combined_data = json.load(f)

    # 収入データを追加
    combined_data.extend(income_data["individual_income"])

    # 上書き保存
    with open(combined_file_path, "w", encoding="utf-8") as f:
        json.dump(combined_data, f, indent=4, ensure_ascii=False)


def main():
    """メイン関数。コマンドライン引数から入力ファイルを取得し、解析処理を実行する。

    Returns:
        int: 正常終了時は0を返す。

    Raises:
        SystemExit: コマンドライン引数が不正な場合、エラーメッセージを表示して終了する。
    """
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

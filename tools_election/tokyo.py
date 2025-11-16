import logging
import sys

import openpyxl

import util
from tokyo.general import get_general
from tokyo.income import get_income
from tokyo.income_summary import get_income_summary
from tokyo.summary import get_summary

# ログ設定
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)


def analyze(input_file):
    """
    指定されたExcelファイルを解析し、各シートのデータをJSONファイルとして出力する。

    収入・収入計・支出計以外は同じフォーマットで処理される。

    Args:
        input_file (str): 解析対象のExcelファイルのパス
    """
    wb = openpyxl.load_workbook(input_file, data_only=True)

    # 各シートを取得
    income = wb["【２】収入"]
    income_summary = wb["【３】収入計"]
    printing = wb["【４】支出 (印刷費)"]
    building = wb["【４】支出 (家屋費)"]
    advertising = wb["【４】支出 (広告費)"]
    transportation = wb["【４】支出 (交通費)"]
    stationery = wb["【４】支出 (文具費)"]
    food = wb["【４】支出 (食料費)"]
    miscellaneous = wb["【４】支出 (雑費)"]
    summary = wb["【５】支出計"]

    # 分析
    income_data = get_income(income)  # 収入
    income_summary_data = get_income_summary(income_summary)  # 収入計
    printing_data = get_general(printing, "printing")  # 印刷
    building_data = get_general(building, "building")  # 家屋
    advertising_data = get_general(advertising, "advertising")  # 広告
    transportation_data = get_general(transportation, "transportation")  # 交通
    stationery_data = get_general(stationery, "stationery")  # 文具
    food_data = get_general(food, "food")  # 食料
    miscellaneous_data = get_general(miscellaneous, "miscellaneous")  # 雑費
    summary_data = get_summary(summary)  # 支出計

    # フォルダを作成
    safe_input_file = util.create_output_folder(input_file)

    # データとファイル名を定義 (utilで必要)
    data_list = [
        ("income_data.json", income_data),
        ("income_summary_data.json", income_summary_data),
        ("printing_data.json", printing_data),
        ("building_data.json", building_data),
        ("advertising_data.json", advertising_data),
        ("transportation_data.json", transportation_data),
        ("stationery_data.json", stationery_data),
        ("food_data.json", food_data),
        ("miscellaneous_data.json", miscellaneous_data),
        ("summary_data.json", summary_data),
    ]

    util.create_individual_json(data_list, safe_input_file)

    util.create_combined_json(data_list, safe_input_file)


def main():
    """メイン関数。コマンドライン引数から入力ファイルを取得し、解析処理を実行する。

    Returns:
        int: 正常終了時は0を返す。

    Raises:
        SystemExit: コマンドライン引数が不正な場合、エラーメッセージを表示して終了する。
    """
    if len(sys.argv) != 2:
        logging.error("python tokyo.py <input_file> と入力してください")
        sys.exit(1)

    logging.info(f"分析を開始します: {sys.argv[1]}")
    input_file = sys.argv[1]
    analyze(input_file)
    logging.info(f"分析を完了しました: {sys.argv[1]}")

    return 0


if __name__ == "__main__":
    sys.exit(main())

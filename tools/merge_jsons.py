import os
import glob
import json
import pandas as pd


def load_all_json(file_paths):
    # まずすべてのjsonファイルを読み込む
    jsons = []
    for file_path in file_paths:
        with open(file_path, "r", encoding="utf-8") as f:
            json_data = json.load(f)
            jsons.append(json_data)

    # 一番最後のjsonファイルから、年度を読み取る(宣誓書の年)
    year = jsons[-1]["year"]

    # 次に、categoriesをマージする
    categories = []
    for file in jsons:
        categories.extend(file["categories"])

    # 次に、transactionsをマージする
    transactions = []
    for file in jsons:
        transactions.extend(file["transactions"])

    # all.jsonを作成する
    all_json = {
        "year": year,
        "categories": categories,
        "transactions": transactions
    }

    return all_json


def main():
    target_dir = os.path.join(os.getcwd(), "output_json")
    file_paths = glob.glob(os.path.join(target_dir, "*.json"))

    all_json = load_all_json(file_paths)

    merged_dir = os.path.join(os.getcwd(), "tools", "merged_files")
    with open(os.path.join(merged_dir, "all.json"), "w", encoding="utf-8") as f:
        json.dump(all_json, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    main()

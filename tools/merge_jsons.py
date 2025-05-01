import os
import glob
import json
import pandas as pd


def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # ルート構造を確認し、各種データを取得

    # list[0] - "items" - list - 内容 の場合
    if isinstance(data, list) and len(data) > 0 and isinstance(data[0], dict) and "items" in data[0]:
        items = data[0]["items"]

    # "items" - list - 内容 の場合
    elif isinstance(data, dict) and "items" in data:
        items = data["items"]

    # list - 内容 の場合
    elif isinstance(data, list):
        items = data

    # その他：error
    else:
        raise ValueError(f"Unexpected JSON structure: {path}")

    # DataFrameに変換
    df = pd.DataFrame(items)
    return df



def main():
    target_dir = os.path.join(os.getcwd(), "output_json")
    file_paths = glob.glob(os.path.join(target_dir, "*.json"))

    df = pd.concat([load_json(f) for f in file_paths])
    df.to_csv("tools/merged_files/all.csv", index=False, encoding='utf-8-sig')

    merged_dir = os.path.join(os.getcwd(), "tools", "merged_files")
    with open(os.path.join(merged_dir, "all.json"), "w", encoding="utf-8") as f:
        json.dump(df.to_dict(orient="records"), f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    main()

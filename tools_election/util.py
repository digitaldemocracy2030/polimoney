import json
import logging
import os
import re
from datetime import datetime

from openpyxl import utils


def extract_number(value):
    """
    値から数字のみを抽出する（小数点対応）

    Args:
        value: 抽出対象の値（数値、文字列など）

    Returns:
        int or float: 抽出された数値（小数点がある場合はfloat、整数の場合はint）、抽出できない場合は0
    """
    if value is None:
        return 0

    # 既に数値の場合はfloatでかつ整数値ならintで返す
    if isinstance(value, int):
        return value
    if isinstance(value, float):
        if value.is_integer():
            return int(value)
        else:
            return value

    # 文字列から数字（小数点含む）を抽出
    if isinstance(value, str):
        # カンマを除去してから数字と小数点のみを抽出するパターン
        clean_value = value.replace(",", "")
        match = re.search(r"(\d+(?:\.\d+)?)", clean_value)
        if match:
            num_str = match.group(1)
            if "." in num_str:
                num = float(num_str)
                if num.is_integer():
                    return int(num)
                else:
                    return num
            else:
                return int(num_str)

    return 0


def create_output_folder(input_file: str):
    """ファイル名に使えない文字をアンダースコアに変換し、出力フォルダを作成する。

    絶対パスではなくファイル名のみを使用して、安全なファイル名を生成する。
    出力フォルダは `output_json/{safe_input_file}` に作成される。

    Args:
        input_file (str): 入力ファイルのパス。

    Returns:
        str: ファイル名に使えない文字をアンダースコアに変換したファイル名。
    """
    base_filename = os.path.basename(input_file)
    safe_input_file = re.sub(r'[\\/:*?"<>|]', "_", base_filename)
    os.makedirs(f"output_json/{safe_input_file}", exist_ok=True)
    return safe_input_file


def create_individual_json(data_list: list[tuple[str, dict]], safe_input_file: str):
    """個別データをJSONファイルとして出力する。

    各データを個別のJSONファイルとして `output_json/{safe_input_file}/` ディレクトリに保存する。
    JSONファイルはUTF-8エンコーディングで、インデント4スペース、非ASCII文字をそのまま出力する形式で保存される。

    Args:
        data_list (list[tuple[str, dict]]): ファイル名とデータの辞書のタプルのリスト。
        safe_input_file (str): ファイル名に使えない文字を変換したファイル名。
    """
    for file_name, data in data_list:
        path = f"output_json/{safe_input_file}/{file_name}"
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4, ensure_ascii=False)


def has_income_data(data: list[dict]):
    """データに収入データが含まれているかを検証する。

    収入データにはpurposeが無いことを利用している

    Args:
        data (list[dict]): 検証対象のデータ。

    Returns:
        bool: 収入データが含まれている場合はTrue、含まれていない場合はFalse。
    """
    return any(item.get("purpose") is None for item in data)


def validate_sum(data: dict, file_path: str):
    """データの合計を検証する。

    個別データの合計（`individual_*`キーに含まれる各アイテムの`price`の合計）と
    `json_checksum`の値が一致しているかを検証する。
    合計が一致しない場合や0の場合は、警告またはエラーログを出力する。

    Args:
        data (dict): 検証対象のデータ。`individual_*`キーと`json_checksum`キーを含む。
        file_path (str): 検証対象のファイルパス。ログ出力時に使用される。

    Returns:
        None: 戻り値は使用されない。検証結果はログに出力される。

    Notes:
        `total`を含むファイルパスの場合は検証をスキップする。
    """
    if "total" in file_path:
        return

    total_price = 0
    for key, value in data.items():
        if key.startswith("individual_"):
            for item in value:
                total_price += item.get("price", 0)

    json_checksum = data.get("json_checksum", 0)

    if json_checksum == 0 or total_price == 0:
        logging.warning(
            f"ファイル: {file_path} 合計値が0です 念のためファイルを確認してください"
        )
        return

    if json_checksum != total_price:
        logging.error(
            f"ファイル: {file_path} 合計値が一致しません json_checksum: {json_checksum} total_price: {total_price}"
        )
        return

    return


def create_combined_json(file_path_list: list[str], safe_input_file: str):
    """複数のJSONファイルを結合して新しいJSONファイルを作成する。

    指定されたJSONファイルリストから、`total`を含まないファイルを読み込み、
    各ファイルの`individual_*`キーに含まれるデータを結合して1つのリストにする。
    結合されたデータは、タイムスタンプ付きのファイル名で保存される。
    各ファイルの合計値は`validate_sum()`関数で検証される。

    Args:
        file_path_list (list[str]): 結合対象のJSONファイルパスのリスト。
        input_file (str): 出力ファイル名に使用する入力ファイル名。

    Returns:
        None: 戻り値は使用されない。結合されたJSONファイルが保存される。
    """
    combined_data = []

    for file_path in file_path_list:
        if "total" in file_path:
            continue

        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        validate_sum(data, file_path)

        for key, value in data.items():
            if "individual_" in key:
                combined_data.extend(value)

    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    combined_file_path = f"output_json/{safe_input_file}/{timestamp}_combined.json"

    with open(combined_file_path, "w", encoding="utf-8") as f:
        json.dump(combined_data, f, indent=4, ensure_ascii=False)

    return combined_data, combined_file_path


# なぜか1つズレているので、-1をしている
A_COL = utils.column_index_from_string("A") - 1
B_COL = utils.column_index_from_string("B") - 1
C_COL = utils.column_index_from_string("C") - 1
D_COL = utils.column_index_from_string("D") - 1
E_COL = utils.column_index_from_string("E") - 1
F_COL = utils.column_index_from_string("F") - 1
G_COL = utils.column_index_from_string("G") - 1
H_COL = utils.column_index_from_string("H") - 1
I_COL = utils.column_index_from_string("I") - 1
J_COL = utils.column_index_from_string("J") - 1
K_COL = utils.column_index_from_string("K") - 1
L_COL = utils.column_index_from_string("L") - 1
M_COL = utils.column_index_from_string("M") - 1
N_COL = utils.column_index_from_string("N") - 1
O_COL = utils.column_index_from_string("O") - 1
P_COL = utils.column_index_from_string("P") - 1
Q_COL = utils.column_index_from_string("Q") - 1
R_COL = utils.column_index_from_string("R") - 1
S_COL = utils.column_index_from_string("S") - 1
T_COL = utils.column_index_from_string("T") - 1
U_COL = utils.column_index_from_string("U") - 1
V_COL = utils.column_index_from_string("V") - 1
W_COL = utils.column_index_from_string("W") - 1
X_COL = utils.column_index_from_string("X") - 1
Y_COL = utils.column_index_from_string("Y") - 1
Z_COL = utils.column_index_from_string("Z") - 1

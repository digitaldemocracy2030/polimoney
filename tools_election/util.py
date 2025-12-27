import datetime
import json
import logging
import os
import re
import uuid
from decimal import ROUND_HALF_UP, Decimal

from openpyxl import utils
from openpyxl.utils.datetime import from_excel


def convert_date(value):
    """Excel日付値をYYYY-MM-DD形式の文字列に変換する。

    Args:
        value: Excelセルの値（datetime、int、float、Noneなど）

    Returns:
        str or None: YYYY-MM-DD形式の日付文字列。変換できない場合はNone。
    """
    if value is None:
        return None

    # 既にdatetimeの場合
    if isinstance(value, (datetime.datetime, datetime.date)):
        return value.strftime("%Y-%m-%d")

    # Excelシリアル値（数値）の場合
    if isinstance(value, (int, float)):
        try:
            dt = from_excel(value)
            return dt.strftime("%Y-%m-%d")
        except Exception:
            return None

    return None


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

    # 既に数値の場合は整数はそのまま
    if isinstance(value, int):
        return value

    # floatは四捨五入してintで返す
    if isinstance(value, float):
        rounded = int(Decimal(str(value)).quantize(0, ROUND_HALF_UP))
        return rounded

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

    収入データにはcategoryがincomeであることを利用している

    Args:
        data (list[dict]): 検証対象のデータ。

    Returns:
        bool: 収入データが含まれている場合はTrue、含まれていない場合はFalse。
    """
    return any(item.get("category") == "income" for item in data)


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
        `summary`を含むファイルパスの場合は検証をスキップする。
    """
    if "summary" in file_path:
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


def add_public_expense_amount_data(data_list: list[dict]):
    """公費負担額がある場合、その情報を追加する。

    Args:
        data_list (list[dict]): 検証対象のデータ。
    """

    # 備考欄に公費と書かれている場合、まず公費100%負担かどうかを確認する
    for data in data_list:
        note = data.get("note", "") or ""
        if "公費" in note:
            # 備考欄にある数字をすべて取得する
            numbers = re.findall(r"[\d,]+", note)
            numbers = [int(number.replace(",", "")) for number in numbers]
            # 数字が無い場合、公費100%負担として扱う
            if len(numbers) == 0:
                data["public_expense_amount"] = data["price"]
                continue
            # 数字がある場合、その中に金額と一致する数字があるかを確認する
            else:
                for number in numbers:
                    if number == data["price"]:
                        data["public_expense_amount"] = data["price"]
                        break
                # 一致する数字が無い場合、公費負担がどれくらいかわからないため、エラーを返す
                else:
                    data["public_expense_amount"] = -1
                    logging.error(
                        f"公費負担額が不明なデータが存在するため、-1を設定します データ: {data}"
                    )

    return data_list


def add_data_id(data_list: list[dict]):
    """データにユニークIDを付与する。
    TODO: 将来的にDBでIDがつき、その後は不要になるので削除

    Args:
        data_list (list[dict]): データのリスト。
    Returns:
        list[dict]: ユニークIDが付与されたデータのリスト。
    """
    for data in data_list:
        data["data_id"] = str(uuid.uuid4())
    return data_list


def create_combined_json(data_list: list[tuple[str, dict]], safe_input_file: str):
    """複数のJSONファイルを結合して新しいJSONファイルを作成する。

    指定されたJSONファイルリストから、`summary`を含まないファイルを読み込み、
    各ファイルの`individual_*`キーに含まれるデータを結合して1つのリストにする。
    結合されたデータは、タイムスタンプ付きのファイル名で保存される。
    各ファイルの合計値は`validate_sum()`関数で検証される。

    Args:
        data_list (list[tuple[str, dict]]): 結合対象のデータのリスト。
        safe_input_file (str): 出力ファイル名に使用する安全なファイル名。

    Returns:
        tuple[list[dict], str]: 結合されたデータのリストと結合ファイルのパスのタプル。
    """
    combined_data = []

    file_path_list = [
        f"output_json/{safe_input_file}/{file_name}" for file_name, _ in data_list
    ]

    for file_path in file_path_list:
        # summaryファイルは結合対象外
        if "summary" in file_path:
            continue

        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        validate_sum(data, file_path)

        for key, value in data.items():
            if "individual_" in key:
                combined_data.extend(value)

    # 公費負担額の情報を追加する
    combined_data = add_public_expense_amount_data(combined_data)

    # データにユニークIDを付与する
    combined_data = add_data_id(combined_data)

    combined_file_path = f"output_json/{safe_input_file}/combined.json"

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

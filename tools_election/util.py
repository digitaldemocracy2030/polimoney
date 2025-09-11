import re

from openpyxl import utils


def extract_number(value):
    """
    値から数字のみを抽出する（小数点対応）

    Args:
        value: 抽出対象の値（数値、文字列など）

    Returns:
        int or float or None: 抽出された数値（小数点がある場合はfloat、整数の場合はint）、抽出できない場合はNone
    """
    if value is None:
        return None

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

    return None


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

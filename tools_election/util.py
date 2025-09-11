import re


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

    # 既に数値の場合はそのまま返す
    if isinstance(value, (int, float)):
        return value

    # 文字列から数字（小数点含む）を抽出
    if isinstance(value, str):
        # カンマを除去してから数字と小数点のみを抽出するパターン
        clean_value = value.replace(",", "")
        match = re.search(r"(\d+(?:\.\d+)?)", clean_value)
        if match:
            num_str = match.group(1)
            if "." in num_str:
                return float(num_str)
            else:
                return int(num_str)

    return None

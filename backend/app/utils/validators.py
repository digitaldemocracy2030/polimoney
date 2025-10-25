import re
from typing import Optional


def validate_email(email: str) -> bool:
    """メールアドレスの形式を検証する

    標準的なメールアドレス形式（username@domain.tld）を
    正規表現で検証する。

    Args:
        email (str): 検証対象のメールアドレス

    Returns:
        bool: メールアドレスが有効な形式であればTrue、そうでなければFalse
    """
    email_regex = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return re.match(email_regex, email) is not None


def validate_username(username: str) -> bool:
    """ユーザー名の形式を検証する

    ユーザー名は英数字、アンダースコア、ハイフンのみ使用可能で、
    3文字以上50文字以下である必要がある。

    Args:
        username (str): 検証対象のユーザー名

    Returns:
        bool: ユーザー名が有効な形式であればTrue、そうでなければFalse
    """
    username_regex = r"^[a-zA-Z0-9_-]{3,50}$"
    return re.match(username_regex, username) is not None


def validate_password(password: str) -> tuple[bool, Optional[str]]:
    """パスワードの強度を検証する

    パスワードは以下の条件を満たす必要がある：
    - 8文字以上
    - 大文字を1文字以上含む
    - 小文字を1文字以上含む
    - 数字を1文字以上含む

    Args:
        password (str): 検証対象のパスワード

    Returns:
        tuple[bool, Optional[str]]: (有効かどうか, エラーメッセージ)
            - bool: パスワードが有効であればTrue、そうでなければFalse
            - Optional[str]: 無効な場合のエラーメッセージ、有効な場合はNone
    """
    if len(password) < 8:
        return False, "パスワードは8文字以上である必要があります"

    if not re.search(r"[A-Z]", password):
        return False, "パスワードには大文字が1文字以上含まれている必要があります"

    if not re.search(r"[a-z]", password):
        return False, "パスワードには小文字が1文字以上含まれている必要があります"

    if not re.search(r"[0-9]", password):
        return False, "パスワードには数字が1文字以上含まれている必要があります"

    return True, None


def validate_organization_name(name: str) -> bool:
    """組織名の形式を検証する

    組織名は1文字以上255文字以下である必要がある。
    前後の空白は除去して検証する。

    Args:
        name (str): 検証対象の組織名

    Returns:
        bool: 組織名が有効であればTrue、そうでなければFalse
    """
    return 1 <= len(name.strip()) <= 255


def validate_candidate_name(name: str) -> bool:
    """候補者名の形式を検証する

    候補者名は1文字以上255文字以下である必要がある。
    前後の空白は除去して検証する。

    Args:
        name (str): 検証対象の候補者名

    Returns:
        bool: 候補者名が有効であればTrue、そうでなければFalse
    """
    return 1 <= len(name.strip()) <= 255


def validate_election_type(election_type: str) -> bool:
    """選挙種別の形式を検証する

    以下の選挙種別が有効：
    - 衆議院議員総選挙
    - 参議院議員通常選挙
    - 地方選挙
    - 首長選挙
    - 都道府県議会議員選挙
    - 市区町村議会議員選挙
    - その他

    Args:
        election_type (str): 検証対象の選挙種別

    Returns:
        bool: 選挙種別が有効であればTrue、そうでなければFalse
    """
    valid_types = [
        "衆議院議員総選挙",
        "参議院議員通常選挙",
        "地方選挙",
        "首長選挙",
        "都道府県議会議員選挙",
        "市区町村議会議員選挙",
        "その他",
    ]
    return election_type in valid_types


def validate_report_year(year: int) -> bool:
    """報告年度の形式を検証する

    報告年度は1900年から2100年までの範囲である必要がある。

    Args:
        year (int): 検証対象の報告年度

    Returns:
        bool: 報告年度が有効な範囲であればTrue、そうでなければFalse
    """
    return 1900 <= year <= 2100

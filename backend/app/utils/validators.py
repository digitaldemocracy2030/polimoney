import re
from typing import Optional


def validate_email(email: str) -> bool:
    """
    Validate email format
    """
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(email_regex, email) is not None


def validate_username(username: str) -> bool:
    """
    Validate username format (alphanumeric, underscore, dash, 3-50 chars)
    """
    username_regex = r'^[a-zA-Z0-9_-]{3,50}$'
    return re.match(username_regex, username) is not None


def validate_password(password: str) -> tuple[bool, Optional[str]]:
    """
    Validate password strength
    Returns (is_valid, error_message)
    """
    if len(password) < 8:
        return False, "パスワードは8文字以上である必要があります"

    if not re.search(r'[A-Z]', password):
        return False, "パスワードには大文字が1文字以上含まれている必要があります"

    if not re.search(r'[a-z]', password):
        return False, "パスワードには小文字が1文字以上含まれている必要があります"

    if not re.search(r'[0-9]', password):
        return False, "パスワードには数字が1文字以上含まれている必要があります"

    return True, None


def validate_organization_name(name: str) -> bool:
    """
    Validate organization name (1-255 characters)
    """
    return 1 <= len(name.strip()) <= 255


def validate_candidate_name(name: str) -> bool:
    """
    Validate candidate name (1-255 characters)
    """
    return 1 <= len(name.strip()) <= 255


def validate_election_type(election_type: str) -> bool:
    """
    Validate election type
    """
    valid_types = [
        "衆議院議員総選挙", "参議院議員通常選挙", "地方選挙", "首長選挙",
        "都道府県議会議員選挙", "市区町村議会議員選挙", "その他"
    ]
    return election_type in valid_types


def validate_report_year(year: int) -> bool:
    """
    Validate report year (1900-2100)
    """
    return 1900 <= year <= 2100

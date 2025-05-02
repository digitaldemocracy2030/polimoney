import json
import argparse
from pathlib import Path
from typing import Dict, Tuple, List, Any

def slug(parent_id: str, i: int) -> str:
    """
    親カテゴリIDの後ろに連番を付与してIDを生成する
    
    Args:
        parent_id: 親カテゴリのID
        i: 連番
        
    Returns:
        生成されたID（例: 親ID "2-1" の場合、"2-1-1", "2-1-2" のような形式）
    """
    return f"{parent_id}-{i}"

def find_sono2_pages(data: List[Dict[str, Any]]) -> List[Any]:
    """
    入力データから「（その２）」のページ番号を特定する
    
    「収入総額」というテキストを含む行を探し、そのページを「（その２）」ページとして識別する
    
    Args:
        data: 解析済みの政治資金収支報告書データ
        
    Returns:
        「（その２）」と判断されたページ番号のリスト
    """
    sono2_pages = []
    for page_data in data:
        page_num = page_data.get("page", "不明")
        for row in page_data.get("extracted_rows", []):
            full_data = row.get("fullData", {})
            # fullDataの各フィールドを調べて「収入総額」が含まれるか確認
            for key, value in full_data.items():
                if isinstance(value, str) and "収入総額" in value:
                    sono2_pages.append(page_num)
                    print(f"（その２）のページを発見: ページ{page_num}")
                    break
            else:
                continue
            break
    return sono2_pages

def make_categories(data: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], Dict[Tuple[str, str], str]]:
    """
    入力データからカテゴリ構造を作成する
    
    「（その２）」ページの情報を基に、収入と支出のカテゴリ階層を構築する
    
    Args:
        data: 解析済みの政治資金収支報告書データ
        
    Returns:
        - カテゴリリスト（各カテゴリはid, name, parent, directionを持つ辞書）
        - (flow_type, category) -> category_id のマッピング辞書
    """
    # 収入と支出のルートカテゴリを作成
    income_root_id = "2-1"
    expense_root_id = "2-2"
    
    categories = [
        {
            "id": income_root_id,
            "name": "総収入",
            "parent": None,
            "direction": "income"
        },
        {
            "id": income_root_id+"-999",
            "name": "no parent(income)",
            "parent": income_root_id,
            "direction": "income"
        },
        {
            "id": expense_root_id,
            "name": "総支出",
            "parent": None,
            "direction": "expense"
        },
        {
            "id": expense_root_id+"-999",
            "name": "no parent(expense)",
            "parent": expense_root_id,
            "direction": "expense"
        }
    ]
    
    # sono2_pagesを見つける
    sono2_pages = find_sono2_pages(data)
    
    # sono2_pagesからカテゴリを作成する
    sono2_categories = {}  # カテゴリ名 -> カテゴリID のマッピング
    
    # まずsono2_pagesに含まれる行からカテゴリを作成
    for page_data in data:
        page_num = page_data.get("page", "不明")
        if page_num in sono2_pages:
            for row in page_data.get("extracted_rows", []):
                flow = row.get("flow_type")
                cat = row.get("category")
                if not flow or not cat:  # skip non-financial rows
                    continue
                if cat not in sono2_categories:
                    sono2_categories[cat] = {
                        "name": cat,
                        "direction": flow
                    }
    
    mapping: Dict[Tuple[str, str], str] = {}
    next_idx = 1
    
    # sono2_pagesに含まれる行のカテゴリを作成
    for page_data in data:
        page_num = page_data.get("page", "不明")
        for row in page_data.get("extracted_rows", []):
            flow = row.get("flow_type")
            cat = row.get("category")
            if not flow or not cat:  # skip non-financial rows
                continue
            
            key = (flow, cat)
            if key in mapping:
                continue
            
            # 親カテゴリを決定
            if page_num in sono2_pages:
                # sono2_pagesに含まれる行は income_root_id または expense_root_id を親とする
                parent_id = income_root_id if flow == "income" else expense_root_id
            else:
                # sono2_pagesに含まれない行は、sono2_pagesから作成したカテゴリを親とする
                found_parent = False
                for sono2_cat, sono2_info in sono2_categories.items():
                    if sono2_info["direction"] == flow and (
                        cat.startswith(sono2_cat) or 
                        sono2_cat.startswith(cat) or 
                        any(common_word in cat for common_word in sono2_cat.split())
                    ):
                        parent_id = mapping.get((flow, sono2_cat))
                        if parent_id:
                            found_parent = True
                            break
                
                if not found_parent:
                    # 適切な親カテゴリが見つからない場合は "no parent(income)" または "no parent(expense)" を親とする
                    if flow == "income":
                        parent_id = income_root_id+"-999"  # no parent(income)
                    else:
                        parent_id = expense_root_id+"-999"  # no parent(expense)
            
            # 親カテゴリのIDを基にして子カテゴリのIDを生成
            cid = slug(parent_id, next_idx)
            next_idx += 1
            
            categories.append({
                "id": cid,
                "name": cat,
                "parent": parent_id,
                "direction": flow
            })
            mapping[key] = cid
    
    return categories, mapping

def make_transactions(source_rows: List[Dict[str, Any]], cat_map: Dict[Tuple[str, str], str], categories: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    入力データからトランザクション（取引）データを作成する
    
    各行データをトランザクションに変換し、適切なカテゴリIDを割り当てる
    
    Args:
        source_rows: 解析済みの行データ
        cat_map: (flow_type, category) -> category_id のマッピング
        categories: カテゴリリスト
        
    Returns:
        トランザクションのリスト（各トランザクションはid, category_id, name, date, valueを持つ辞書）
    """
    txns = []
    # カテゴリ名からIDを取得するための辞書を作成
    name_to_id = {cat["name"]: cat["id"] for cat in categories}
    # no parent カテゴリのIDを取得
    income_no_parent_id = next((cat["id"] for cat in categories if cat["name"] == "no parent(income)"), None)
    expense_no_parent_id = next((cat["id"] for cat in categories if cat["name"] == "no parent(expense)"), None)
    
    for n, row in enumerate(source_rows, 1):
        flow = row.get("flow_type")
        cat = row.get("category")
        if not flow or not cat:
            continue
        
        # まずカテゴリ名が一致するものを探す
        if cat in name_to_id:
            cid = name_to_id[cat]
        else:
            # cat_mapから探す
            key = (flow, cat)
            if key in cat_map:
                cid = cat_map[key]
            else:
                # 見つからない場合はflow_typeに応じて適切なno parentカテゴリを使用
                if flow == "income":
                    cid = income_no_parent_id
                else:
                    cid = expense_no_parent_id
        
        # トランザクションIDは "txn-" + 連番
        txns.append({
            "id": f"txn-{n}",
            "category_id": cid,
            "name": row.get("name"),
            "date": row.get("date"),
            "value": row.get("value")
        })
    return txns

def convert(source_path: str, year: int = 2025, out_path: str = "output.json"):
    """
    政治資金収支報告書のJSONデータを変換する
    
    入力JSONファイルを読み込み、カテゴリとトランザクションを抽出して
    指定された形式のJSONファイルに出力する
    
    Args:
        source_path: 入力JSONファイルのパス
        year: 対象年度. デフォルトは2025
        out_path: 出力JSONファイルのパス. デフォルトは"output.json"
        
    Returns:
        結果は指定されたファイルに書き込まれる
        
    Raises:
        FileNotFoundError: 入力ファイルが見つからない場合
        json.JSONDecodeError: 入力ファイルが有効なJSONでない場合
    """
    data = json.loads(Path(source_path).read_text(encoding="utf-8"))
    
    # 全てのデータを処理
    all_rows = []
    for page in data:
        all_rows.extend(page["extracted_rows"])

    cats, cmap = make_categories(data)
    txns = make_transactions(all_rows, cmap, cats)

    result = {
        "year": year,
        "categories": cats,
        "transactions": txns
    }
    Path(out_path).write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"変換完了 → {out_path}\nカテゴリ {len(cats)} 件 / 取引 {len(txns)} 件")

def main():
    """
    コマンドライン引数を処理し、変換処理を実行する
    
    コマンドライン引数:
        input_file: 入力JSONファイルのパス
        -o/--output: 出力JSONファイルのパス
        -y/--year: 対象年度（デフォルト: 2025）
    """
    parser = argparse.ArgumentParser(description='政治資金収支報告書のJSONデータを変換します')
    parser.add_argument('input_file', help='入力JSONファイルのパス')
    parser.add_argument('-o', '--output', dest='output_file', required=True, help='出力JSONファイルのパス')
    parser.add_argument('-y', '--year', type=int, default=2025, help='対象年度 (デフォルト: 2025)')
    
    args = parser.parse_args()
    
    # 変換処理を実行
    convert(args.input_file, year=args.year, out_path=args.output_file)

if __name__ == "__main__":
    main()

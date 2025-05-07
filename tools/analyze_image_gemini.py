import google.generativeai as genai
import PIL.Image
import os
import argparse
import sys
import json # JSONの検証や整形のためにインポート
import glob # ディレクトリ内のファイル検索のため
import concurrent.futures # 並列処理のため

# 出力ディレクトリ名を定数化
OUTPUT_JSON_DIR = "output_json"
class GeminiClient:
    def __init__(self, key):
        self.key = key
        self.model_name = 'gemini-2.5-pro-preview-05-06'
        self.model = genai.GenerativeModel(self.model_name)


    def clean_response(self, text):
        """Gemini応答からマークダウンコードブロック指示子を削除する"""
        text = text.strip()
        if text.startswith("```json"):
            text = text[len("```json"):].strip()
        elif text.startswith("```"):
            text = text[len("```"):].strip()

        if text.endswith("```"):
            text = text[:-len("```")].strip()

        return text

    def analyze_image_with_gemini(self, image_path):
        """
        指定した画像ファイルをGemini APIで解析し、Google推奨のJSON形式でテキスト情報を返します。

        Args:
            image_path (str): 解析対象の画像ファイルのパス。

        Returns:
            str: Geminiからの解析結果（JSON文字列を想定）。エラーの場合は "エラー:" で始まるメッセージを返します。
        """
        # genai.configure(api_key=api_key)
        # モデルはgemini-2.5-pro-preview-05-06です。これが現在の最新なのでいじらないでください。

        prompt = """
# 依頼内容

これは日本の政治資金収支報告書の一部です。
この画像から読み取れる全てのテキスト情報を抽出し、正確に構造化されたJSON形式で出力してください。
不明瞭な箇所や読み取れない箇所は無理に推測せず、その旨を示すか省略してください。

# 期待するデータ形式

{
    "items": [
        {
            "flow_type": "",
            "category": "",
            "name": "",
            "date": "",
            "value": 0,
            "handwritten": bool,
            "fullData": {
                # その項目から読み取れる全データを任意のkey-valueで構造化したもの
                # keyは記載の通りの漢字でも問題なし。（例: "寄附者の氏名": "田中太郎"）
            }
        },
        ...
    ]
}

# 抽出時の注意事項

## flow_typeについて

flow_typeは "income", "expense" のどちらかを指定してください。

## handwrittenについて

手書き文字だと思われる場合、または手書き文字や印鑑が邪魔で読み取りにくい場合はTrueを選択してください。
そうでない場合はFalseを選択してください。

## categoryについて

categoryは以下の中から選んでください。
ただし、当てはまるものがなく、明らかにカテゴリとして適切な物があった場合は、その他（{{読み取れたカテゴリ}}）として立項して構いません。

categoryの候補
- 個人からの寄附
- 政治団体からの寄附
- 法人その他の団体からの寄附
- 組織活動費
- 選挙関係費
- 機関紙誌の発行事業費
- 宣伝事業費
- 政治資金パーティ開催事業費
- その他の事業費
- 調査研究費
- 寄附・交付金
- 光熱水費
- 事務所費
- 借入金
- 人件費
- 前年からの繰越額
- 党費・会費
- 備品・消耗品費
- 翌年への繰越額
- その他の経費
- その他（{{読み取れたカテゴリ}}）

## dateについて

年月日という項目に 6 9 30 などの区分で入っています。
これは令和6年9月30日を示すので、 R6.9.30 という文字列に変換してください。

### その他の項目について
"name", "value" はより具体的な項目を、画像に記載の通り入力してください。


# 具体例

{
    "items": [
        {
            "flow_type": "income",
            "category": "個人からの寄附",
            "name": "田中太郎",
            "date": "R6.6.29",
            "value": 10000,
            "handwritten": False,
            "fullData": {
                "住所": "東京都港区赤坂1-1-1",
                "職業（又は代表者の氏名）": "会社役員",
                "寄附者の氏名": "田中太郎"
            }
        },
        {
            "flow_type": "expense",
            "category": "宣伝事業費",
            "name": "発送費",
            "date": "R6.9.30",
            "value": 1300000,
            "handwritten": True,
            "fullData": {
                "支出を受けたものの氏名（又は名称）": "株式会社エックス",
                "支出を受けたものの住所（又は所在地）": "東京都港区赤坂1-1-1"
            }

        }
        ...
    ]
}
        """


        try:
            # print(f"画像を読み込み中: {image_path}", file=sys.stderr) # ループ内で冗長なのでコメントアウト
            img = PIL.Image.open(image_path)
            # print("Gemini APIにリクエストを送信中...", file=sys.stderr) # ループ内で冗長なのでコメントアウト

            response = self.model.generate_content(
                contents=[prompt, img],
                generation_config={
                    "response_mime_type": "application/json",
                }
            )

            raw_result = None
            if hasattr(response, 'text') and response.text:
                raw_result = response.text
            elif hasattr(response, 'parts') and response.parts:
                raw_result = "".join(part.text for part in response.parts if hasattr(part, 'text'))

            if raw_result:
                cleaned_result = self.clean_response(raw_result)
                return cleaned_result
            else:
                # エラー詳細表示
                error_message = f"エラー ({os.path.basename(image_path)}): Gemini APIから有効なテキスト応答を取得できませんでした。" # ファイル名を追加
                if hasattr(response, 'prompt_feedback') and response.prompt_feedback.block_reason:
                    error_message += f" ブロック理由: {response.prompt_feedback.block_reason}"
                # candidates が存在しない場合や finish_reason が RECITATION や SAFETY の場合も考慮
                elif hasattr(response, 'candidates') and response.candidates:
                    finish_reason = response.candidates[0].finish_reason.name if hasattr(response.candidates[0], 'finish_reason') else '不明'
                    if finish_reason != 'STOP':
                        error_message += f" 応答終了理由: {finish_reason}"
                    else:
                        error_message += f" 不明な応答形式: {response}" # STOPなのにテキストがない場合
                elif hasattr(response, 'candidates') and not response.candidates:
                    error_message += " 候補応答なし。"
                else:
                    error_message += f" Response: {response}" # 詳細不明な場合、レスポンス全体を一部表示
                # print(f"デバッグ情報: {error_message}", file=sys.stderr) # process_single_image で表示するので不要
                return error_message # エラーメッセージを返す

        except FileNotFoundError:
            return f"エラー: 画像ファイルが見つかりません: {image_path}"
        except Exception as e:
            # print(f"予期せぬエラー発生 ({image_path}): {type(e).__name__} - {e}", file=sys.stderr) # process_single_image で表示
            # response 変数が定義されているか確認してからアクセス
            # if 'response' in locals() and response:
            #     print(f"デバッグ情報 (エラー発生時のresponse): {response}", file=sys.stderr)
            return f"エラーが発生しました ({os.path.basename(image_path)}): {e}" # ファイル名を追加


def process_single_image(image_path, gemini_client, output_dir):
    """単一の画像ファイルを処理し、結果をJSONファイルに保存する"""
    print(f"画像を解析中: {os.path.basename(image_path)}", file=sys.stderr) # フルパスでなくファイル名表示に
    result = gemini_client.analyze_image_with_gemini(image_path)

    if result.startswith("エラー:"):
        print(result, file=sys.stderr) # エラーはコンソールに表示
        return

    base_name = os.path.splitext(os.path.basename(image_path))[0]
    output_filename = os.path.join(output_dir, f"{base_name}.json")

    try:
        json.loads(result)
    except json.JSONDecodeError as json_err:
        print(f"警告 ({os.path.basename(image_path)}): Geminiからの応答は有効なJSONではありません。エラー: {json_err}", file=sys.stderr)
        print(f"応答内容(最初の200文字): {result[:200]}...", file=sys.stderr)

    try:
        with open(output_filename, "w", encoding="utf-8") as f:
            f.write(result)
        print(f"解析結果を保存しました: {output_filename}", file=sys.stderr)
    except IOError as e:
        print(f"エラー ({os.path.basename(image_path)}): 解析結果のファイル書き込みに失敗しました: {output_filename} - {e}", file=sys.stderr)


def get_png_files_to_process(args):
    """
    ディレクトリまたは単一ファイルから処理対象のPNGファイルリストを取得する

    Args:
        args: コマンドライン引数オブジェクト

    Returns:
        list: 処理対象のPNGファイルパスのリスト

    Raises:
        SystemExit: ディレクトリやファイルが存在しない場合
    """
    png_files = []

    if args.directory:
        # ディレクトリ内のPNGファイルを処理
        target_dir = args.directory
        if not os.path.isdir(target_dir):
            print(f"エラー: 指定されたディレクトリが見つかりません: {target_dir}", file=sys.stderr)
            sys.exit(1)

        print(f"ディレクトリ '{target_dir}' 内のPNGファイルを処理します...", file=sys.stderr)
        # glob を使って PNG ファイルを検索
        png_files = glob.glob(os.path.join(target_dir, '*.png'))
        png_files.sort()  # ファイル順を安定させる

        if not png_files:
            print(f"警告: ディレクトリ '{target_dir}' 内にPNGファイルが見つかりませんでした。", file=sys.stderr)
        return png_files

    elif args.image_file:
        # 単一ファイルを処理
        if not os.path.isfile(args.image_file):
            print(f"エラー: 指定されたファイルが見つかりません: {args.image_file}", file=sys.stderr)
            sys.exit(1)
        png_files = [args.image_file]

        return png_files
    else:
        # このケースは mutually_exclusive_group(required=True) により発生しないはず
        print("エラー: 解析対象のファイルまたはディレクトリを指定してください。", file=sys.stderr)
        sys.exit(1)


def main():
    """スクリプトのエントリーポイント。

    コマンドライン引数をパースし、指定されたPNG画像ファイルまたはディレクトリ内の全PNGファイルをGemini APIで解析し、
    その結果をJSONファイルとして保存します。

    Args:
        なし（コマンドライン引数で指定）

    Returns:
        なし（標準出力・標準エラー出力、およびファイル出力）

    Raises:
        SystemExit: 必要な環境変数が未設定、またはファイル/ディレクトリが存在しない場合。

    注意:
        - GOOGLE_API_KEY環境変数が必要です。
        - 画像ファイルはPNG形式のみ対応しています。
        - 解析結果は指定した出力ディレクトリにJSONファイルとして保存されます。
    """
    parser = argparse.ArgumentParser(description="Gemini APIを使用して画像の内容を解析し、結果をJSONファイルとして保存します。単一ファイルまたはディレクトリ内の全PNGファイルを処理できます。")

    # 入力ソースの排他グループ
    input_group = parser.add_mutually_exclusive_group(required=True)
    input_group.add_argument("image_file", nargs='?', default=None, help="解析する単一の画像ファイルのパス。") # nargs='?' と default=None でオプション扱いに
    input_group.add_argument("-d", "--directory", help="解析するPNG画像が含まれるディレクトリのパス。")

    parser.add_argument(
        "-o",
        "--output-dir",
        default=OUTPUT_JSON_DIR,
        help=f"解析結果のJSONファイルを保存するディレクトリ。デフォルト: '{OUTPUT_JSON_DIR}'"
    )

    args = parser.parse_args()
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
         print("エラー: 環境変数 GOOGLE_API_KEY が設定されていません。", file=sys.stderr)
         sys.exit(1)

    gemini_client = GeminiClient(api_key)

    # 出力ディレクトリを作成 (存在しない場合)
    try:
        os.makedirs(args.output_dir, exist_ok=True)
        print(f"出力ディレクトリ: {args.output_dir}", file=sys.stderr)
    except OSError as e:
        print(f"エラー: 出力ディレクトリ '{args.output_dir}' の作成に失敗しました: {e}", file=sys.stderr)
        sys.exit(1)

    # --- 処理の実行 ---
    png_files = get_png_files_to_process(args)
    total_files = len(png_files)

    if total_files == 0:
        print("エラー: 処理対象のPNGファイルが見つかりませんでした。", file=sys.stderr)
        sys.exit(1)


    print(f"{total_files} 個のPNGファイルを処理します。", file=sys.stderr)

    # 並列処理の実装
    def process_with_index(args_tuple):
        i, png_file_path = args_tuple
        print(f"--- Processing file {i+1}/{total_files} ---", file=sys.stderr)
        process_single_image(png_file_path, gemini_client, args.output_dir)

    # ThreadPoolExecutorを使用して並列処理
    # max_workersはCPUコア数の2倍程度が一般的な目安（I/O待ちが多いため）
    cpu_count = os.cpu_count() or 1
    max_workers = min(32, cpu_count * 2)  # CPUコア数の2倍、最大32
    print(f"並列処理を開始します（最大 {max_workers} スレッド）", file=sys.stderr)

    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        # ファイルとインデックスのタプルのリストを作成
        indexed_files = list(enumerate(png_files))
        # 並列実行
        list(executor.map(process_with_index, indexed_files))

    print(f"--- 全 {total_files} ファイルの処理が完了しました ---", file=sys.stderr)


if __name__ == "__main__":
    main()

import google.generativeai as genai
import PIL.Image
import os
import argparse
import sys
import json # JSONの検証や整形のためにインポート
import glob # ディレクトリ内のファイル検索のため

# 出力ディレクトリ名を定数化
OUTPUT_JSON_DIR = "output_json"

def clean_gemini_response(text):
    """Gemini応答からマークダウンコードブロック指示子を削除する"""
    text = text.strip()
    if text.startswith("```json"):
        text = text[len("```json"):].strip()
    elif text.startswith("```"): # ``` だけの場合も考慮
        text = text[len("```"):].strip()

    if text.endswith("```"):
        text = text[:-len("```")].strip()
    return text

def analyze_image_with_gemini(image_path, prompt, api_key):
    """
    Uses the Gemini API to analyze an image based on a prompt.

    Args:
        image_path (str): Path to the image file.
        prompt (str): The prompt to guide the analysis.
        api_key (str): Your Google API Key.

    Returns:
        str: The cleaned analysis result from Gemini (expected JSON string), or an error message starting with "エラー:".
    """
    # APIキーが設定されていても configure は呼び出しごとに必要かもしれない
    # -> configure は一度だけで良いはず。メイン処理の開始時に移動。
    # genai.configure(api_key=api_key)

    model_name = 'gemini-1.5-pro-latest'
    try:
        # configureを毎回呼ばないので、modelオブジェクトも毎回生成する
        model = genai.GenerativeModel(model_name)
        # print(f"使用モデル: {model_name}", file=sys.stderr) # 毎回表示すると冗長なのでコメントアウト
    except Exception as e:
        return f"エラー: モデル '{model_name}' の初期化に失敗しました。利用可能なモデル名を確認してください。詳細: {e}"

    try:
        # print(f"画像を読み込み中: {image_path}", file=sys.stderr) # ループ内で冗長なのでコメントアウト
        img = PIL.Image.open(image_path)
        # print("Gemini APIにリクエストを送信中...", file=sys.stderr) # ループ内で冗長なのでコメントアウト

        response = model.generate_content([prompt, img])

        raw_result = None
        if hasattr(response, 'text') and response.text:
             raw_result = response.text
        elif hasattr(response, 'parts') and response.parts:
             raw_result = "".join(part.text for part in response.parts if hasattr(part, 'text'))

        if raw_result:
            cleaned_result = clean_gemini_response(raw_result)
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

def process_single_image(image_path, prompt, api_key, output_dir):
    """単一の画像ファイルを処理し、結果をJSONファイルに保存する"""
    print(f"画像を解析中: {os.path.basename(image_path)}", file=sys.stderr) # フルパスでなくファイル名表示に
    result = analyze_image_with_gemini(image_path, prompt, api_key)

    if result.startswith("エラー:"):
        print(result, file=sys.stderr) # エラーはコンソールに表示
    else:
        base_name = os.path.splitext(os.path.basename(image_path))[0]
        output_filename = os.path.join(output_dir, f"{base_name}.json")
        try:
            # JSON検証
            try:
                json.loads(result)
            except json.JSONDecodeError as json_err:
                print(f"警告 ({os.path.basename(image_path)}): Geminiからの応答は有効なJSONではありません。エラー: {json_err}", file=sys.stderr)
                print(f"応答内容(最初の200文字): {result[:200]}...", file=sys.stderr)

            with open(output_filename, "w", encoding="utf-8") as f:
                f.write(result)
            print(f"解析結果を保存しました: {output_filename}", file=sys.stderr)
        except IOError as e:
            print(f"エラー ({os.path.basename(image_path)}): 解析結果のファイル書き込みに失敗しました: {output_filename} - {e}", file=sys.stderr)
        except Exception as e:
             print(f"エラー ({os.path.basename(image_path)}): 不明なエラーが発生しました（ファイル書き込み時）: {e}", file=sys.stderr)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Gemini APIを使用して画像の内容を解析し、結果をJSONファイルとして保存します。単一ファイルまたはディレクトリ内の全PNGファイルを処理できます。")

    # 入力ソースの排他グループ
    input_group = parser.add_mutually_exclusive_group(required=True)
    input_group.add_argument("image_file", nargs='?', default=None, help="解析する単一の画像ファイルのパス。") # nargs='?' と default=None でオプション扱いに
    input_group.add_argument("-d", "--directory", help="解析するPNG画像が含まれるディレクトリのパス。")

    parser.add_argument(
        "-p",
        "--prompt",
        default=(
            "これは日本の政治資金収支報告書の一部です。"
            "この画像から読み取れる全てのテキスト情報を抽出し、"
            "収入、支出、寄付、日付、氏名、住所、職業、金額などの項目を"
            "可能な限り正確に構造化されたJSON形式で出力してください。"
            "不明瞭な箇所や読み取れない箇所は無理に推測せず、その旨を示すか省略してください。"
            "{\n  \"収入\": [],\n  \"支出\": [],\n  \"寄付\": []\n}"
            "上記のようなJSONオブジェクトのみを出力し、前後の説明文やマークダウンの```json ```や```は絶対に含めないでください。"
            "例: {\"収入\": {\"寄付\": [{\"日付\": \"R4.5.1\", \"氏名\": \"山田太郎\", \"金額\": 10000, \"住所\": \"東京都千代田区\", \"職業\": \"会社員\"}]}}"
        ),
        help="Geminiに与えるプロンプト。"
    )
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

    # APIキーの設定は一度だけ行う
    try:
        genai.configure(api_key=api_key)
        print("Google API Key configured.", file=sys.stderr)
    except Exception as e:
        print(f"エラー: Google API Key の設定に失敗しました: {e}", file=sys.stderr)
        sys.exit(1)


    # 出力ディレクトリを作成 (存在しない場合)
    try:
        os.makedirs(args.output_dir, exist_ok=True)
        print(f"出力ディレクトリ: {args.output_dir}", file=sys.stderr)
    except OSError as e:
        print(f"エラー: 出力ディレクトリ '{args.output_dir}' の作成に失敗しました: {e}", file=sys.stderr)
        sys.exit(1)

    # --- 処理の分岐 ---
    if args.directory:
        # ディレクトリ内のPNGファイルを処理
        target_dir = args.directory
        if not os.path.isdir(target_dir):
            print(f"エラー: 指定されたディレクトリが見つかりません: {target_dir}", file=sys.stderr)
            sys.exit(1)

        print(f"ディレクトリ '{target_dir}' 内のPNGファイルを処理します...", file=sys.stderr)
        # glob を使って PNG ファイルを検索
        png_files = glob.glob(os.path.join(target_dir, '*.png'))
        png_files.sort() # ファイル順を安定させる

        if not png_files:
            print(f"警告: ディレクトリ '{target_dir}' 内にPNGファイルが見つかりませんでした。", file=sys.stderr)
        else:
            total_files = len(png_files)
            print(f"{total_files} 個のPNGファイルを処理します。", file=sys.stderr)
            for i, png_file_path in enumerate(png_files):
                print(f"--- Processing file {i+1}/{total_files} ---", file=sys.stderr)
                process_single_image(png_file_path, args.prompt, api_key, args.output_dir)
            print(f"--- 全 {total_files} ファイルの処理が完了しました ---", file=sys.stderr)

    elif args.image_file:
        # 単一ファイルを処理 (既存の動作)
        if not os.path.isfile(args.image_file):
             print(f"エラー: 指定されたファイルが見つかりません: {args.image_file}", file=sys.stderr)
             sys.exit(1)
        process_single_image(args.image_file, args.prompt, api_key, args.output_dir)

    else:
        # このケースは mutually_exclusive_group(required=True) により発生しないはず
        print("エラー: 解析対象のファイルまたはディレクトリを指定してください。", file=sys.stderr)
        parser.print_help()
        sys.exit(1)
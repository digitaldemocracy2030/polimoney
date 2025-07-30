# 最重要

すべての基本指針については[../CLAUDE.md](../CLAUDE.md)を参照してください。

## Tools 固有の開発コマンド

### セットアップ
```bash
# Poetryでの依存関係インストール
poetry install

# 環境変数設定（必須）
export GOOGLE_API_KEY='YOUR_API_KEY'
```

### 開発ワークフロー
```bash
# Lint実行
poetry run ruff check .

# Lint自動修正
poetry run ruff check --fix .

# フォーマット
poetry run ruff format .

# 型チェック
poetry run pyright .

# テスト実行
poetry run pytest
```

### PDF処理パイプライン

詳細は[README.md](README.md)を参照。

```bash
# 1. 政治資金報告書ダウンロード
python -m downloader.main -y R5

# 2. PDF → 画像変換
python pdf_to_images.py document.pdf -o output_images --preprocess grayscale binarize

# 3. AI解析（画像 → JSON）
python analyze_image.py -i output_images -o output_json

# 4. JSON統合
python merge_jsons.py -i output_json -o merged.json
```

## Architecture

### 技術スタック
- **Python**: 3.10+
- **依存管理**: Poetry
- **AI解析**: LangChain + Google Gemini API
- **PDF処理**: pdf2image + Poppler
- **データ処理**: pandas

### 主要モジュール
- **downloader/**: 政治資金報告書の自動ダウンロード機能
- **analyzer/**: 画像解析とLLM統合機能

## 重要な注意事項

1. **環境変数**: GOOGLE_API_KEY必須
2. **外部依存**: Popplerが必要（`brew install poppler`）
3. **API制限**: Gemini APIのレート制限に注意
4. **データ精度**: OCR結果の精度は画像品質に依存

## テスト

```bash
# 全テスト実行
poetry run pytest

# 特定のテストモジュール
poetry run pytest tests/test_merge_jsons.py

# カバレッジ付き実行
poetry run pytest --cov=.
```
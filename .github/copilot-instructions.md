# Polimoney AI Coding Instructions

政治資金透明化プラットフォームのためのオープンソースプロジェクト。政治資金収支報告書のPDF処理・AI解析・Web可視化を行う。


## Project Architecture

### Core Data Flow

収支報告書 → 画像変換 → AI解析(Gemini) → JSON統合 → フロントエンド表示

実行例：
```bash
./scripts/create-json-for-web.sh hoge.pdf ./public/reports/hoge.json
```

### Key Components

- **Frontend**: Next.js 15 + React 19 + Chakra UI v3 + Nivo charts
- **PDF Processing**: Python tools (pdf2image + LangChain + Gemini API)
- **Data Models**: 厳密なTypeScript型定義 (`models/type.d.ts`)
- **Build Tools**: Biome (JS/TS)、Ruff+Pyright (Python)


## Development Guidelines

### 言語・スタイル

- 日本語でのコミュニケーション
- 作業説明的なコメントを避ける（`// この行を追加` など）
- シンプルな関数型プログラミング


## Critical Patterns

### TypeScript Model System

厳密型定義: `Profile`、`Report`、`Flow`、`Transaction`、`AccountingReports`

- 政治資金の複式簿記的データ構造
- direction: 'income' | 'expense'による収支分類
- 階層的フロー構造（parent-child関係）

### Data Conversion Pipeline

1. `tools/pdf_to_images.py` - PDF→画像変換
2. `tools/analyze_image.py` - AI解析（Gemini API）
3. `tools/merge_jsons.py` - JSON統合
4. `data/converter.ts` - フロントエンド用変換

### Error Handling Pattern

エラー発生時は根本原因特定をし即時解決する


## Integration Points

### External APIs

- **Gemini API**: 資料解析
- **Auth0**: 認証

### Chart Visualization

- `@nivo/pie` - 円グラフ
- `@nivo/sankey` - サンキー図（資金フロー可視化）


## Testing & Quality

### Type Safety

- 厳密TypeScript設定
- Biome suspicious rules enabled
- Python Pyright type checking


## File Patterns

### Critical Files

- `models/type.d.ts` - 型定義（最重要）
- `data/converter.ts` - データ変換ロジック
- `scripts/create-json-for-web.sh` - 全体パイプライン
- `tools/README.md` - Python環境セットアップ

### Configuration

- `biome.json` - JS/TS linting (tools除外)
- `lefthook.yml` - Git hooks
- `tools/pyproject.toml` - Python dependencies

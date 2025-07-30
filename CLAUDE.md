# 最重要
  - 日本語で話す
  - 実装するときはシンプルな関数型プログラミングをする
  - 仕様に基づくテストファーストでプログラミングする
  - 命名的変数名を使用する。
  - 変数のハードコーディングをしない。
  - エラーが発生したら直ちにエラーの内容を確認し、根本原因を特定してエラーを解決する。
  - 複雑なエラーの場合はo3に相談。
  - ルールやガイドラインに従う
  - 自分でできることは自分でやること。どうしてもユーザーにやってもらわないといけない作業は@@@@@@@@で前後に配置しはっきりわかるようにしろ
  - gitにaddするときは git add . 
  - 一時ファイルは.gitignoreに指定してaddされないように制御する
  - テストに失敗したときは仕様変更によってテストを変更するべきかコードが間違っているのか。慎重に判断して対応する
  - テスト結果を報告する時は成功数だけでなく失敗数もかならず報告すること

## Common Development Commands

### Frontend Development
```bash
# Install dependencies (use legacy peer deps due to React 19)
npm install --legacy-peer-deps

# Run development server (port 3000)
npm run dev

# Lint code
npm run lint

# Auto-fix linting issues
npm run check

# Build production version
npm run build
```


## Architecture Overview

### Frontend (Next.js + TypeScript)
- **Framework**: Next.js 15 with React 19
- **UI Library**: Chakra UI v3 with emotion
- **Data Visualization**: Nivo charts (pie, sankey)
- **Styling**: Global CSS with CSS-in-JS
- **Type System**: Strict TypeScript with defined models in `models/type.d.ts`

### Python Tools
- **PDF Processing**: pdf2image for converting political fund reports  
- **AI Analysis**: LangChain with Google Gemini API for extracting structured data from images
- **Data Pipeline**: Download → PDF to Images → AI Analysis → JSON merge → Frontend conversion
- **Dependency Management**: Poetry for Python package management

### Development Workflow
- **Git Hooks**: Pre-commit hooks via lefthook for both JS/TS (biome) and Python (ruff, pyright)
- **Code Style**: Biome for JS/TS, Ruff for Python
- **Issue Management**: GitHub Projects with specific workflow (see PROJECTS.md)
- **Contribution Process**: Requires CLA agreement, issue discussion before implementation


## Important Considerations

1. **Port Configuration**: Frontend runs on port 3000 (npm run dev)
2. **Branch Strategy**: Never commit directly to main branch
3. **Testing**: Run tests before committing, ensure all checks pass
4. **Pre-commit Hooks**: Automatically run linting and formatting via lefthook
5. **API Keys**: Set GOOGLE_API_KEY environment variable for Gemini API usage
6. **Legacy Dependencies**: Use `--legacy-peer-deps` due to React 19 compatibility
7. **Python Environment**: Use Poetry for Python dependency management in tools/
8. **Data Processing**: Use the automated script `./scripts/create-json-for-web.sh` for PDF processing

## サブプロジェクト固有のドキュメント

各サブプロジェクトには専用のCLAUDE.mdファイルがあります：

- **[tools/CLAUDE.md](tools/CLAUDE.md)**: Python PDF処理・AI解析ツール
- **[backend/CLAUDE.md](backend/CLAUDE.md)**: Go APIサーバー・データベース
- **[data/CLAUDE.md](data/CLAUDE.md)**: データ変換・デモページ作成
- **[docs/CLAUDE.md](docs/CLAUDE.md)**: ドキュメント管理・ADR

各サブプロジェクトで作業する際は、対応するCLAUDE.mdを必ず参照してください。

## Architecture Decision Process
Major architectural decisions follow ADR process documented in `docs/adr/ADR.md`. New decisions are proposed via GitHub Discussions, reviewed by maintainers, and documented when accepted.
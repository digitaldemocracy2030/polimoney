# 最重要

すべての基本指針については[../CLAUDE.md](../CLAUDE.md)を参照してください。

## Docs 固有の情報

### ドキュメント構造
```
docs/
├── adr/                    # Architecture Decision Records
├── wiki_ja/               # 日本語Wiki
├── DEVIN_COLLABORATION.md # Devin連携ガイド
└── Home.md               # プロジェクト概要
```

### 重要なドキュメント

#### Architecture Decision Records (ADR)
- **場所**: `adr/ADR.md`
- **用途**: 重要なアーキテクチャ決定の記録
- **プロセス**: GitHub Discussions → レビュー → 承認 → ADR化

#### 日本語Wiki
- **概要**: `wiki_ja/overview.md`
- **データモデル**: `wiki_ja/data_model.md`
- **プロジェクト構造**: `wiki_ja/project_structure.md`
- **デプロイメント**: `wiki_ja/deployment.md`

#### 開発関連ドキュメント
プロジェクトルートの重要ドキュメント:
- **[CONTRIBUTING.md](../CONTRIBUTING.md)**: 貢献ガイドライン
- **[PROJECTS.md](../PROJECTS.md)**: プロジェクト管理ワークフロー
- **[CODE_REVIEW_GUIDELINES.md](../CODE_REVIEW_GUIDELINES.md)**: コードレビュー基準
- **[CLA.md](../CLA.md)**: Contributor License Agreement

### ドキュメント作成・更新ガイドライン

1. **ADR作成時**:
   - GitHub Discussionsで提案
   - メンテナーレビューを経て承認
   - 決定後にADRファイル作成

2. **Wiki更新時**:
   - 技術的変更に応じて関連ドキュメント更新
   - 実装と整合性を保つ

3. **マークダウン記法**:
   - GitHub Flavored Markdown使用
   - 相対リンクでファイル間参照
   - コードブロックは言語指定

## 参照方法

### ドキュメント間リンク
```markdown
# 相対パスでの参照例
[ADR](adr/ADR.md)
[データモデル](wiki_ja/data_model.md)
[メインCLAUDE](../CLAUDE.md)
```

### 既存ドキュメントの活用
新しいドキュメント作成時は既存の内容を重複させず、適切にリンク参照する。
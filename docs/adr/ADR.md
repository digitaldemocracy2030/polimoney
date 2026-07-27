# Architecture Decision Records (ADRs)

## はじめに

このドキュメントはアーキテクチャ上の重要な決定を記録し、その背景と理由および結果を明確にするためのArchitecture Decision Record（ADR）の書き方と進行フローに関する取り決めを記述します。

## ADRとは

ADRはソフトウェアプロジェクトにおけるアーキテクチャ上の決定を文書化するための標準化された方法です。各ADRはアーキテクチャに関する意思決定とそのコンテキスト、およびその決定の結果を記述します。

## ADRの目的

- アーキテクチャ上の決定の透明性を高める
- 決定の背景と理由を将来の参照のために記録する
- チームメンバー間の知識の共有を促進する
- アーキテクチャの進化を追跡する

---

## ADRの書き方

ADRは、以下のセクションを含むMarkdownファイルとして記述します。

1.  **タイトル (Title)**: 決定を簡潔に説明するタイトル。例： "API Gatewayの導入"
2.  **ステータス (Status)**: ADRの現在のステータス。例： "Proposed", "Accepted", "Rejected", "Deprecated", "Superseded"
3.  **コンテキスト (Context)**: 決定が必要な背景と状況。解決しようとしている問題や達成しようとしている目標を記述します。
4.  **決定 (Decision)**: 実際に行った決定。具体的な技術的選択、アプローチ、または解決策を記述します。
5.  **結果 (Consequences)**: 決定により予見される結果を記載します。肯定的な結果、否定的な結果、およびトレードオフを記述します。
6.  **代替案 (Considered Options)**: 検討した代替案。なぜそれらの案が採用されなかったのかを記述します。
7.  **参考文献 (References)**: 関連するドキュメント、議論、または決定へのリンク。

### テンプレート

```markdown
# [タイトル]

- ステータス: [ステータス]
- 日付: [YYYY-MM-DD]

## コンテキスト

[決定が必要な背景と状況を記述します。]

## 決定

[実際に行った決定を記述します。]

## 結果

[決定の結果を記述します。]

## 代替案

[検討した代替案を記述します。]

## 参考文献

[関連するドキュメント、議論、または決定へのリンクを記述します。]
```

## ADRの進行フロー

1.  **提案 (Proposal)**:
    - 提案者はアーキテクチャ上の決定が必要な場合にADRをGithub Discussionにて提案します。
    - ADRのタイトル、コンテキスト、および提案される決定を記述します。
    - 提案者はADRのステータスを "Proposed" に設定します。
2.  **レビュー (Review)**:
    - メンテナーを中心に提案されたADRをレビュー、議論します。
    - レビューはGithub Discussionにて行われます。
    - レビューの結果、ADRが承認・却下、または修正される場合があります。
3.  **決定 (Decision)**:
    - レビューの結果に基づいて、メンテナーがADRを承認または却下します。
    - メンテナーはアーキテクチャに関する専門知識を持ち、プロジェクト全体の整合性を保つ責任があります。
    - 承認された場合はステータスを "Accepted" に変更し、所定のADRファイルに記載します。
    - 却下された場合は、ステータスを "Rejected" に変更し、理由を記載します。
4.  **実装 (Implementation)**:
    - 承認されたADRに基づいて、アーキテクチャを実装します。
5.  **追跡 (Tracking)**:
    - 実装後もADRの結果を追跡し、必要に応じてADRを修正または廃止します。
    - ADRが修正された場合、新しいADRを作成し、古いADRを "Superseded" に設定します。
    - ADRが廃止された場合、ステータスを "Deprecated" に設定します。

## ADRの管理

- ADRファイルは、プロジェクトのリポジトリで管理します。
- ADRファイルには、一意のIDを付与します（例：`0001-api-gateway.md`）。
- ADRファイルは、`docs/adr/`に保存します。

## 参考文献

- [Michael Nygard, "Documenting Architecture Decisions"](http://thinkrelevance.com/blog/2011/11/15/documenting-architecture-decisions)
- [ADR GitHub organization](https://adr.github.io/)
- [architecture-decision-record](https://github.com/joelparkerhenderson/architecture-decision-record)

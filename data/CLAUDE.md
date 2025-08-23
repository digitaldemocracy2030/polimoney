# 最重要

すべての基本指針については[../CLAUDE.md](../CLAUDE.md)を参照してください。

## Data 固有の開発コマンド

### コンバーター使用
```bash
# 基本的な変換
npx tsx converter.ts -i input.json -o output.json

# エラー無視モード（推奨）
npx tsx converter.ts --ignore-errors -i input.json -o output.json
```

## Architecture

### データ変換パイプライン
1. **Input**: Tools（Python）で生成されたOCR解析JSON
2. **Process**: TypeScriptコンバーターで構造化
3. **Output**: フロントエンド用のJSON形式

### 型定義
重要な型定義は[../models/type.d.ts](../models/type.d.ts)を参照：
- **Profile**: 政治家基本情報
- **Report**: 報告書メタデータ
- **Flow**: 資金フロー表示用
- **Transaction**: 個別取引記録

## デモページ作成

詳細は[README_DEMO_PAGE.md](README_DEMO_PAGE.md)を参照。

### 重要な注意事項
**⚠️ データ公開制限**
- 収支データの無許可GitHub公開は禁止
- すべてローカル作業にとどめる
- フォークリポジトリへのコミットも禁止

### 作成手順概要
1. **基本情報整理**: 政治家情報・組織情報・収支データ
2. **データファイル作成**: `demo-{政治家名}.ts`
3. **ページファイル作成**: `app/demo-{政治家名}-{年度}/page.tsx`
4. **画像配置**: `public/demo-{政治家名}.jpg`

### データ入力規則
- **金額**: 円単位（カンマなし）例：`1000000`
- **日付**: `'2024/3/31'`形式
- **ID命名**: 収入`i1,i2...` 支出`e1,e2...`
- **パーセンテージ**: `(項目金額 ÷ 総額) × 100`

### 型安全性
TypeScript使用のため型定義に厳密に従う：
- 数値は`number`型
- 文字列は`string`型  
- 配列は適切な型の配列

### チェックリスト
- [ ] 各年度の金額合計が総収入・総支出と一致
- [ ] パーセンテージ計算が正確
- [ ] 前年繰越と翌年繰越の整合性
- [ ] 画像ファイルパスの一致
- [ ] 開発サーバーでの表示確認

## サンプルファイル
- **データ構造参考**: `demo-kokifujisaki.ts`
- **ページ実装参考**: `../app/demo-koki-fujisaki-2024/page.tsx`
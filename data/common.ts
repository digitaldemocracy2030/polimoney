/**
 * デモデータファイル用共通型定義
 *
 * 全てのdemo-*.tsファイルで共通で使用される型定義のみを定義します。
 */

import type { Flow, Report, Transaction } from '@/models/type';

// =============================================================================
// 型定義
// =============================================================================

/**
 * 年度別データの型定義
 */
export interface YearlyData {
  flows: Flow[];
  transactions: Transaction[];
}

/**
 * 全年度データの型定義
 */
export type DataByYear = Record<number, YearlyData>;

/**
 * 年度別レポートの型定義
 */
export type ReportsByYear = Record<number, Report>;

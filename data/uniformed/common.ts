/**
 * デモデータファイル用共通型定義
 *
 * 全てのdemo-*.tsファイルで共通で使用される型定義のみを定義します。
 */

import type { Report, Transaction } from '@/models/type';

// =============================================================================
// 型定義
// =============================================================================

/**
 * カテゴリ定義の型
 */
export interface Category {
  id: string;
  name: string;
  parent?: string;
}

/**
 * 年度別データの型定義
 */
export interface YearlyData {
  categories?: {
    income: Category[];
    expense: Category[];
  };
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

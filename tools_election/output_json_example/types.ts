/**
 * Polimoney API JSON 型定義
 *
 * 使用方法:
 * import type { PolimoneyResponse, Journal, Election } from './types';
 */

// ============================================
// カテゴリコード
// ============================================

/** 支出カテゴリコード */
export type ExpenseCategoryCode =
  | "personnel"      // 人件費
  | "building"       // 家屋費
  | "communication"  // 通信費
  | "transportation" // 交通費
  | "printing"       // 印刷費
  | "advertising"    // 広告費
  | "stationery"     // 文具費
  | "food"           // 食糧費
  | "lodging"        // 休泊費
  | "miscellaneous"; // 雑費

/** 収入カテゴリコード */
export type IncomeCategoryCode =
  | "income"       // 収入
  | "donation"     // 寄附
  | "other_income"; // その他の収入

/** すべてのカテゴリコード */
export type CategoryCode = ExpenseCategoryCode | IncomeCategoryCode;

// ============================================
// 選挙タイプ
// ============================================

/**
 * 選挙タイプコード
 * - HR: 衆議院議員選挙
 * - HC: 参議院議員選挙
 * - PG: 都道府県知事選挙
 * - PA: 都道府県議会議員選挙
 * - GM: 市区町村長選挙
 * - CM: 市区町村議会議員選挙
 */
export type ElectionTypeCode = "HR" | "HC" | "PG" | "PA" | "GM" | "CM";

// ============================================
// 収支タイプ
// ============================================

/** 収支タイプ（日本語） */
export type ExpenditureType =
  | "選挙運動"
  | "立候補準備のための支出"
  | "寄附"
  | "その他の収入";

// ============================================
// データ型定義
// ============================================

/** 政治家情報 */
export interface Politician {
  /** 政治家の一意識別子 (UUID) */
  id: string;
  /** 政治家名（漢字） */
  name: string;
  /** 政治家名（カタカナ） */
  name_kana: string;
}

/** 選挙情報 */
export interface Election {
  /** 選挙の一意識別子 (UUID) */
  id: string;
  /** 選挙の正式名称 */
  name: string;
  /** 選挙タイプコード */
  type: ElectionTypeCode;
  /** 選挙タイプ日本語名 */
  type_name: string;
  /** 選挙区の一意識別子 (UUID) */
  district_id: string;
  /** 選挙区名 */
  district_name: string;
  /** 投票日 (YYYY-MM-DD) */
  election_date: string;
}

/** 集計サマリー */
export interface Summary {
  /** 収入合計（円） */
  total_income: number;
  /** 支出合計（円） */
  total_expense: number;
  /** 収支差額（収入 - 支出） */
  balance: number;
  /** 公費負担合計（円） */
  public_expense_total: number;
  /** 仕訳件数 */
  journal_count: number;
}

/** メタ情報 */
export interface Meta {
  /** API バージョン */
  api_version: string;
  /** 政治家情報 */
  politician: Politician;
  /** 選挙情報 */
  election: Election;
  /** 集計サマリー */
  summary: Summary;
  /** JSON 生成日時 (ISO 8601) */
  generated_at: string;
}

/** 仕訳データ */
export interface Journal {
  /** 仕訳の一意識別子 (UUID) */
  data_id: string;
  /** 取引日 (YYYY-MM-DD)、公費負担の場合 null */
  date: string | null;
  /** 金額（円） */
  amount: number;
  /** カテゴリコード */
  category: CategoryCode;
  /** カテゴリ日本語名 */
  category_name: string;
  /** 収支タイプ */
  type: ExpenditureType;
  /** 使途（支出の場合） */
  purpose: string | null;
  /** 金銭以外の寄附の内容 */
  non_monetary_basis: string | null;
  /** 備考・摘要 */
  note: string | null;
  /** 公費負担額（該当する場合） */
  public_expense_amount: number | null;
}

/** API レスポンス全体 */
export interface PolimoneyResponse {
  /** メタ情報 */
  meta: Meta;
  /** 仕訳データの配列 */
  data: Journal[];
}

// ============================================
// ユーティリティ型
// ============================================

/** 収入仕訳のみ */
export type IncomeJournal = Journal & { category: IncomeCategoryCode };

/** 支出仕訳のみ */
export type ExpenseJournal = Journal & { category: ExpenseCategoryCode };

// ============================================
// ヘルパー関数の型
// ============================================

/** 仕訳が収入かどうかを判定 */
export function isIncomeJournal(journal: Journal): journal is IncomeJournal {
  return ["income", "donation", "other_income"].includes(journal.category);
}

/** 仕訳が支出かどうかを判定 */
export function isExpenseJournal(journal: Journal): journal is ExpenseJournal {
  return !isIncomeJournal(journal);
}

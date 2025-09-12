// プロファイル（メタデータ）
export type Profile = {
  name: string; // 政治家名
  title: string; // 肩書
  party: string; // 政党
  district?: string; // 選挙区
  image: string; // 画像URL
  birth_year?: number; // 生年
  birth_place?: string; // 出身地
  description?: string; // 説明
};

// 政治家一覧
export type ProfileList = Pick<Profile, 'name' | 'image'> &
  Partial<Omit<Profile, 'name' | 'image'>>;

// 収支レポート
export type Report = {
  id: string; // ID
  totalIncome: number; // 収入合計
  totalExpense: number; // 支出合計
  totalBalance: number; // 年間収支
  year: number; // 対象年
  orgType: string; // 政治団体の区分
  orgName: string; // 政治団体の名称
  activityArea: string; // 活動区域の区分
  representative: string; // 代表者
  fundManagementOrg: string; // 資金管理団体の指定
  accountingManager: string; // 会計責任者
  administrativeManager: string; // 事務担当者
  lastUpdate: string; // 最終更新日
};

/**
 * 資金項目 ID命名規則担保
 */

// 資金項目ID 接頭辞
type GeneralIncomePrefix = 'ig'; // 汎用項目（収入）
type GeneralExpensePrefix = 'eg'; // 汎用項目（支出）
type SpecificIncomePrefix = 'is'; // 個別項目（収入）
type SpecificExpensePrefix = 'es'; // 個別項目（支出）

// 資金項目ID 連番部
type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
type SerialNumber = `${Digit}${Digit}${Digit}`;

// 資金項目ID 全体（接頭辞 + 連番）
type GeneralIncomeId = `${GeneralIncomePrefix}${SerialNumber}`;
type GeneralExpenseId = `${GeneralExpensePrefix}${SerialNumber}`;
type SpecificIncomeId = `${SpecificIncomePrefix}${SerialNumber}`;
type SpecificExpenseId = `${SpecificExpensePrefix}${SerialNumber}`;

// 資金項目IDと方向の整合性を担保
type GeneralItemKeys =
  | { id: GeneralIncomeId; direction?: 'income' }
  | { id: GeneralExpenseId; direction?: 'expense' };
type SpecificItemKeys =
  | { id: SpecificIncomeId; direction: 'income' }
  | { id: SpecificExpenseId; direction: 'expense' };

/**
 * 収支フロー図項目 全体定義
 */

// 収支フロー図項目 ベースデータ
export type FlowBase = GeneralItemKeys & {
  name: string; // 項目名
  parent: string | null; // 分類
  tooltip?: string; // 説明文
};

// 収支フロー図項目 実データ
export type Flow =
  // 実データなので金額必須
  { value: number } & (
    | (GeneralItemKeys & {
        // 汎用項目の場合はIDと方向のみ必須、それ以外はオーバーライド用
        name?: string;
        parent?: string | null;
        tooltip?: string;
      })
    | (SpecificItemKeys & {
        // 個別項目の場合は説明文以外必須
        name: string;
        parent: string | null;
        tooltip?: string;
      })
  );

/**
 * 収支フロー図項目 全体定義
 */

// 収支フロー図項目 ベースデータ
export type TransactionBase = GeneralItemKeys & {
  name: string; // 項目名
  category: string; // カテゴリ
  subCategory: string; // サブカテゴリ
  purpose: string; // 目的
  tooltip?: string; // 説明文
};

// 収支一覧項目
export type Transaction =
  // 実データなので金額必須、日付設定可能
  { amount: number; date: string } & (
    | (GeneralItemKeys & {
        // 汎用項目の場合はIDと方向のみ必須、それ以外はオーバーライド用
        name?: string;
        category?: string;
        subCategory?: string;
        purpose?: string;
        tooltip?: string;
      })
    | (SpecificItemKeys & {
        // 個別項目の場合は日付と説明文以外必須
        name: string;
        category: string;
        subCategory: string;
        purpose: string;
        tooltip?: string;
      })
  );

// 政治家データ全体
export type AccountingReports = {
  id: string;
  latestReportId: string;
  profile: Profile;
  datas: {
    report: Report;
    flows: Flow[];
    transactions: Transaction[];
  }[];
};

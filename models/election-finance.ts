export const efCategories = [
  { key: 'income', label: '収入' },
  { key: 'personnel', label: '人件' },
  { key: 'building', label: '家屋' },
  { key: 'communication', label: '通信' },
  { key: 'transportation', label: '交通' },
  { key: 'printing', label: '印刷' },
  { key: 'advertising', label: '広告' },
  { key: 'stationery', label: '文具' },
  { key: 'food', label: '食料' },
  { key: 'accommodation', label: '休泊' },
  { key: 'miscellaneous', label: '雑費' },
] as const;

/**
 * 選挙収支データのカテゴリ定義
 */
export type EfCategory = (typeof efCategories)[number]['key'];

/**
 * 選挙収支データ - メタデータ
 */
export type EfMetadata = {
  date: string;
  title: string;
  name: string;
};

/**
 * 選挙収支データ - 収支情報（単一）
 */
export type EfTransaction = {
  data_id: string;
  category: EfCategory;
  date: string | null;
  price: number;
  public_expense_amount?: number;
  type: string;
  purpose?: string;
  non_monetary_basis?: string;
  note?: string;
};
/**
 * 選挙収支データ - 収支情報（集合）
 */
export type EfTransactions = EfTransaction[];

/**
 * 選挙収支データ
 */
export type EfData = {
  metadata: EfMetadata;
  transactions: EfTransactions;
};

/**
 * 選挙収支データ - カテゴリごとの収支情報サマリ
 */
export type EfSummary = {
  category: string;
  total: number;
  count: number;
  type: 'income' | 'expense';
};

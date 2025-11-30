import { type EfCategory, efCategories } from '@/models/election-finance';

/**
 * 選挙収支報告のカテゴリの和名を取得する。
 *
 * @param category カテゴリ英名
 * @returns カテゴリ和名
 */
export function getCategoryJpName(category: EfCategory): string {
  const item = efCategories.find((c) => c.key === category);
  return item ? item.label : category;
}

export function categorizeTransactionType(type: string): 'income' | 'expense' {
  const incomeTypes = ['その他の収入', '寄附'];
  return incomeTypes.includes(type) ? 'income' : 'expense';
}

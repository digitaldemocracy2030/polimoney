/**
 * カテゴリ定義ベースのTransactionからFlowを生成するユーティリティ（V2）
 */

import type { Category } from '@/data/uniformed/common';
import type { Flow, Transaction } from '@/models/type';

/**
 * カテゴリ定義とTransactionからFlowを生成する
 * @param transactions Transaction配列
 * @param categories カテゴリ定義
 * @returns Flow配列
 */
export function generateFlowsFromTransactions(
  transactions: Transaction[],
  categories: { income: Category[]; expense: Category[] },
): Flow[] {
  // 1. カテゴリごとにTransactionを集計
  const incomeAggregates = aggregateTransactionsByCategory(
    transactions.filter((t) => t.direction === 'income'),
    categories.income,
  );

  const expenseAggregates = aggregateTransactionsByCategory(
    transactions.filter((t) => t.direction === 'expense'),
    categories.expense,
  );

  // 2. 階層構造を構築
  const incomeFlows = buildFlowHierarchy(
    incomeAggregates,
    categories.income,
    'income',
  );
  const expenseFlows = buildFlowHierarchy(
    expenseAggregates,
    categories.expense,
    'expense',
  );

  // 3. 総収入ルートノードを追加
  const totalIncome = incomeFlows.reduce(
    (sum, flow) => (flow.parent === null ? sum + flow.value : sum),
    0,
  );
  const totalExpense = expenseFlows.reduce(
    (sum, flow) => (flow.parent === null ? sum + flow.value : sum),
    0,
  );

  const rootFlow: Flow = {
    id: 'total',
    name: '総収入',
    direction: 'expense',
    value: totalIncome,
    parent: null,
  };

  // 4. 収入フローの親を総収入に設定
  const adjustedIncomeFlows = incomeFlows.map((flow) => ({
    ...flow,
    parent: flow.parent === null ? '総収入' : flow.parent,
  }));

  // 5. 支出フローの親を総収入に設定
  const adjustedExpenseFlows = expenseFlows.map((flow) => ({
    ...flow,
    parent: flow.parent === null ? '総収入' : flow.parent,
  }));

  // 6. 繰越処理
  const carryoverFlow = createCarryoverFlow(totalIncome, totalExpense);

  const allFlows = [rootFlow, ...adjustedIncomeFlows, ...adjustedExpenseFlows];
  if (carryoverFlow) {
    allFlows.push(carryoverFlow);
  }

  return allFlows;
}

/**
 * Transactionをカテゴリ別に集計
 */
function aggregateTransactionsByCategory(
  transactions: Transaction[],
  categories: Category[],
): Map<string, number> {
  const aggregates = new Map<string, number>();

  // カテゴリIDマッピングを作成
  const categoryMap = new Map<string, string>();
  categories.forEach((cat) => {
    categoryMap.set(cat.name, cat.id);
  });

  // transactionをカテゴリで集計
  for (const transaction of transactions) {
    if (transaction.amount === 0) continue;

    // transaction.purposeを優先してマッピング（より詳細なカテゴリ）
    let categoryId = categoryMap.get(transaction.purpose);
    if (!categoryId) {
      categoryId = categoryMap.get(transaction.category);
    }

    if (categoryId) {
      const currentTotal = aggregates.get(categoryId) || 0;
      aggregates.set(categoryId, currentTotal + transaction.amount);
    }
  }

  return aggregates;
}

/**
 * 階層構造を構築してFlowを生成
 */
function buildFlowHierarchy(
  aggregates: Map<string, number>,
  categories: Category[],
  direction: 'income' | 'expense',
): Flow[] {
  const flows: Flow[] = [];
  const categoryMap = new Map<string, Category>();

  // カテゴリマップを作成
  categories.forEach((cat) => {
    categoryMap.set(cat.id, cat);
  });

  // 階層の深さ順で処理（深い方から浅い方へ - 子から親へ）
  const sortedCategories = [...categories].sort((a, b) => {
    const depthA = getDepth(a, categoryMap);
    const depthB = getDepth(b, categoryMap);
    return depthB - depthA; // 深い方が先（子から親へ）
  });

  for (const category of sortedCategories) {
    const flow = createFlowForCategory(
      category,
      aggregates,
      categoryMap,
      flows,
      direction,
    );
    if (flow) {
      flows.push(flow);
    }
  }

  return flows;
}

/**
 * カテゴリの階層の深さを取得
 */
function getDepth(
  category: Category,
  categoryMap: Map<string, Category>,
): number {
  let depth = 0;
  let current = category;

  while (current.parent) {
    depth++;
    const parent = categoryMap.get(current.parent);
    if (!parent) break;
    current = parent;
  }

  return depth;
}

/**
 * カテゴリからFlowを作成
 */
function createFlowForCategory(
  category: Category,
  aggregates: Map<string, number>,
  categoryMap: Map<string, Category>,
  existingFlows: Flow[],
  direction: 'income' | 'expense',
): Flow | null {
  // 直接的な合計（そのカテゴリに属するTransaction）
  const directTotal = aggregates.get(category.id) || 0;

  // 子カテゴリの合計
  const childrenTotal = existingFlows
    .filter((flow) => flow.parent === category.name)
    .reduce((sum, flow) => sum + flow.value, 0);

  const totalValue = directTotal + childrenTotal;

  // 値が0の場合はFlowを作成しない
  if (totalValue === 0) return null;

  return {
    id: generateFlowId(category.name, direction),
    name: category.name,
    direction,
    value: totalValue,
    parent: category.parent
      ? categoryMap.get(category.parent)?.name || null
      : null,
  };
}

/**
 * 繰越フローを作成
 */
function createCarryoverFlow(
  totalIncome: number,
  totalExpense: number,
): Flow | null {
  const carryover = totalIncome - totalExpense;

  if (carryover === 0) return null;

  return {
    id: 'carryover',
    name: carryover > 0 ? '翌年への繰越' : '不足額',
    direction: 'expense',
    value: Math.abs(carryover),
    parent: '総収入',
  };
}

/**
 * Flow IDを生成
 */
function generateFlowId(name: string, direction: 'income' | 'expense'): string {
  const prefix = direction === 'income' ? 'i' : 'e';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash = hash & hash; // 32bit整数に変換
  }
  return `${prefix}${Math.abs(hash)}`;
}

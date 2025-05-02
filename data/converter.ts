import * as fs from 'fs';
import * as path from 'path';

// import { Summary, Flow, Transaction } from '../type';
type Summary = {
  income: number;
  expense: number;
  balance: number;
  year: number;
};
type Flow = {
  id: string;
  name: string;
  direction: 'income' | 'expense';
  value: number;
  parent: string | null;
};
type Transaction = {
  id: string;
  name: string;
  date: string;
  value: number;
  category: string;
  percentage: number;
};

type InputCategory = {
  id: string;
  name: string;
  parent: string | null;
  direction: 'income' | 'expense';
};
type InputTransaction = {
  id: string;
  category_id: string;
  name: string;
  date: string;
  value: number;
};
type InputData = {
  year: number;
  categories: InputCategory[];
  transactions: InputTransaction[];
};

type OutputData = {
  summary: Summary;
  flows: Flow[];
  incomeTransactions: Transaction[];
  expenseTransactions: Transaction[];
};

function convert(data: InputData): OutputData {
  const incomeCategoryIds = data.categories
    .filter((c: InputCategory) => c.direction === 'income')
    .map((c: InputCategory) => c.id)
  const expenseCategoryIds = data.categories
    .filter((c: InputCategory) => c.direction === 'expense')
    .map((c: InputCategory) => c.id)

  const incomeInputTransactions = data.transactions.filter(
    (t: InputTransaction) => incomeCategoryIds.includes(t.category_id),
  )
  const expenseInputTransactions = data.transactions.filter(
    (t: InputTransaction) => expenseCategoryIds.includes(t.category_id),
  )

  const totalIncome = incomeInputTransactions.reduce(
    (sum: number, t: InputTransaction) => sum + t.value,
    0,
  )
  const totalExpense = expenseInputTransactions.reduce(
    (sum: number, t: InputTransaction) => sum + t.value,
    0,
  )
  const nextYearCategory = data.categories.find(
    (c: InputCategory) => c.name === '翌年への繰越額',
  )
  const balanceTransaction = data.transactions.find(
    (t: InputTransaction) => t.category_id === nextYearCategory?.id,
  )
  const summary = {
    income: totalIncome,
    expense: totalExpense - (balanceTransaction ? balanceTransaction.value : 0),
    balance: balanceTransaction ? balanceTransaction.value : 0,
    year: data.year,
  }

  const categoryIdToName = data.categories.reduce(
    (acc: Record<string, string>, c: InputCategory) => {
      acc[c.id] = c.name
      return acc
    },
    {},
  )

  const incomeTransactions = incomeInputTransactions.map(
    (t: InputTransaction) => ({
      id: t.id,
      name: t.name,
      date: t.date,
      value: t.value,
      category: categoryIdToName[t.category_id],
      percentage: (t.value * 100.0) / totalIncome,
    }),
  )

  const expenseTransactions = expenseInputTransactions.map(
    (t: InputTransaction) => ({
      id: t.id,
      name: t.name,
      date: t.date,
      value: t.value,
      category: categoryIdToName[t.category_id],
      percentage: (t.value * 100.0) / totalExpense,
    }),
  )

  const flows = data.categories.map((c: InputCategory) => ({
    id: c.id,
    name: c.name,
    direction: c.direction,
    value: 0,
    parent: c.parent,
  }))
  const flowsByCategoryIdMap = flows.reduce(
    (acc: Record<string, Flow>, f: Flow) => {
      acc[f.id] = f
      return acc
    },
    {},
  )
  for (const t of [...incomeInputTransactions, ...expenseInputTransactions]) {
    let flow = flowsByCategoryIdMap[t.category_id]
    flow.value += t.value
    // 親カテゴリの value は子カテゴリの value の合計なので、子カテゴリの value を親カテゴリに加算していく
    while (flow.parent) {
      flow = flowsByCategoryIdMap[flow.parent]
      flow.value += t.value
    }
  }
  // root category は income と expense 両方の合計になるので、半分にする
  const rootFlow = flows.find((f: Flow) => !f.parent)
  if (rootFlow) {
    rootFlow.value /= 2
  }

  return {
    summary,
    flows,
    incomeTransactions,
    expenseTransactions,
  }
}

function validateInput(data: any): void {
  if (typeof data.year !== 'number') {
    throw new Error('year は数値である必要があります')
  }
  if (!data.categories || !data.transactions) {
    throw new Error('categories と transactions が必要です')
  }
  if (!Array.isArray(data.categories)) {
    throw new Error('categories は配列である必要があります')
  }
  if (!Array.isArray(data.transactions)) {
    throw new Error('transactions は配列である必要があります')
  }

  for (const category of data.categories) {
    if (!category.name || !category.direction) {
      throw new Error(
        `category は name, direction を持つ必要があります: ${JSON.stringify(category)}`,
      )
    }
    if (category.direction !== 'income' && category.direction !== 'expense') {
      throw new Error(
        'category の direction は income か expense である必要があります',
      )
    }
  }

  if (!data.categories.find((c: any) => c.name === '前年からの繰越額')) {
    throw new Error('カテゴリ「前年からの繰越額」が存在する必要があります')
  }
  if (!data.categories.find((c: any) => c.name === '翌年への繰越額')) {
    throw new Error('カテゴリ「翌年への繰越額」が存在する必要があります')
  }

  const previousYearCategory = data.categories.find(
    (c: any) => c.name === '前年からの繰越額',
  )
  const nextYearCategory = data.categories.find(
    (c: any) => c.name === '翌年への繰越額',
  )
  const previousYearTransactions = data.transactions.filter(
    (t: any) => t.category_id === previousYearCategory.id,
  )
  if (previousYearTransactions.length !== 1) {
    throw new Error(
      '前年からの繰越額の transaction はちょうど1つである必要があります',
    )
  }
  const nextYearTransactions = data.transactions.filter(
    (t: any) => t.category_id === nextYearCategory.id,
  )
  if (nextYearTransactions.length !== 1) {
    throw new Error(
      '翌年への繰越額の transaction はちょうど1つである必要があります',
    )
  }

  const incomeCategoryIds = data.categories
    .filter((c: any) => c.direction === 'income')
    .map((c: any) => c.id)
  const expenseCategoryIds = data.categories
    .filter((c: any) => c.direction === 'expense')
    .map((c: any) => c.id)
  const totalIncome = data.transactions
    .filter((t: any) => incomeCategoryIds.includes(t.category_id))
    .reduce((sum: number, t: any) => sum + t.value, 0)
  const totalExpense = data.transactions
    .filter((t: any) => expenseCategoryIds.includes(t.category_id))
    .reduce((sum: number, t: any) => sum + t.value, 0)
  if (totalIncome !== totalExpense) {
    throw new Error(
      `income と expense の合計が一致しません: ${totalIncome} !== ${totalExpense}`,
    )
  }

  const rootCategoryCount = data.categories.filter(
    (c: any) => !c.parent,
  ).length
  if (rootCategoryCount !== 1) {
    throw new Error('root category はちょうど1つである必要があります')
  }

  const categoryIds = data.categories.map((c: any) => c.id)
  const parentCategoryIds = data.categories
    .map((c: any) => c.parent)
    .filter((p: any) => p !== null)
  const leafCategoryIds = data.categories
    .filter((c: any) => !parentCategoryIds.includes(c.id))
    .map((c: any) => c.id)
  for (const transaction of data.transactions) {
    if (
      !transaction.id ||
      !transaction.category_id ||
      !transaction.name ||
      !transaction.date ||
      !transaction.value
    ) {
      throw new Error(
        'transaction は id, category_id, name, date, value を持つ必要があります',
      )
    }
    if (!categoryIds.includes(transaction.category_id)) {
      throw new Error(
        'transaction の category_id は categories に存在する必要があります',
      )
    }
    if (!leafCategoryIds.includes(transaction.category_id)) {
      throw new Error(
        `transaction の category_id は葉カテゴリである必要があります: ${transaction.category_id}`,
      )
    }
    if (typeof transaction.date !== 'string') {
      throw new Error('transaction の date は文字列である必要があります')
    }
    if (typeof transaction.value !== 'number' || transaction.value <= 0) {
      throw new Error('transaction の value は正数である必要があります')
    }
  }
}

function parseArguments(): { inputFile: string; outputFile: string } {
  const args = process.argv.slice(2)
  let inputFile = ''
  let outputFile = ''

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-i' && i + 1 < args.length) {
      inputFile = args[i + 1]
      i++
    } else if (args[i] === '-o' && i + 1 < args.length) {
      outputFile = args[i + 1]
      i++
    }
  }

  if (!inputFile || !outputFile) {
    console.error(
      '使用方法: node generator.js -i <入力JSONファイル> -o <出力JSONファイル>',
    )
    process.exit(1)
  }

  return {inputFile, outputFile}
}

function main(): void {
  try {
    const {inputFile, outputFile} = parseArguments()

    const inputPath = path.resolve(inputFile)
    const rawData = fs.readFileSync(inputPath, 'utf8')
    const data = JSON.parse(rawData)

    validateInput(data)

    const convertedData = convert(data)

    const outputPath = path.resolve(outputFile)
    fs.writeFileSync(outputPath, JSON.stringify(convertedData, null, 2))

    console.log(`処理が完了しました。出力ファイル: ${outputPath}`)
  } catch (error) {
    console.error('エラーが発生しました:', error)
    process.exit(1)
  }
}

main()

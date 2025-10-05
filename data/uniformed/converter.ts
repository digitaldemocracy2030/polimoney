import * as fs from 'node:fs';
import * as path from 'node:path';
import type {
  AccountingReports,
  Profile,
  Report,
  Transaction,
  TransactionDirection,
} from '@/models/type';

type Flow = {
  id: string;
  name: string;
  direction: 'income' | 'expense';
  value: number;
  parent: string | null;
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
  basic_info: BasicInfo;
  categories: InputCategory[];
  transactions: InputTransaction[];
};

type BasicInfo = {
  orgName: string;
  orgType: string;
  activityArea: string;
  representative: string;
  fundManagementOrg: string;
  accountingManager: string;
  administrativeManager: string;
  lastUpdate: string;
};

type OutputData = AccountingReports;

function convert(data: InputData, outputId = 'converted-data'): OutputData {
  const incomeCategoryIds = data.categories
    .filter((c: InputCategory) => c.direction === 'income')
    .map((c: InputCategory) => c.id);
  const expenseCategoryIds = data.categories
    .filter((c: InputCategory) => c.direction === 'expense')
    .map((c: InputCategory) => c.id);

  const incomeInputTransactions = data.transactions.filter(
    (t: InputTransaction) => incomeCategoryIds.includes(t.category_id),
  );
  const expenseInputTransactions = data.transactions.filter(
    (t: InputTransaction) => expenseCategoryIds.includes(t.category_id),
  );

  const totalIncome = incomeInputTransactions.reduce(
    (sum: number, t: InputTransaction) => sum + t.value,
    0,
  );
  const totalExpense = expenseInputTransactions.reduce(
    (sum: number, t: InputTransaction) => sum + t.value,
    0,
  );
  const nextYearCategory = data.categories.find(
    (c: InputCategory) => c.name === '翌年への繰越額',
  );
  const balanceTransaction = data.transactions.find(
    (t: InputTransaction) => t.category_id === nextYearCategory?.id,
  );

  const categoryIdToName = data.categories.reduce(
    (acc: Record<string, string>, c: InputCategory) => {
      acc[c.id] = c.name;
      return acc;
    },
    {},
  );
  const categoryIdToParentId = data.categories.reduce(
    (acc: Record<string, string>, c: InputCategory) => {
      acc[c.id] = c.parent || '';
      return acc;
    },
    {},
  );

  const incomeTransactions: Transaction[] = incomeInputTransactions.map(
    (t: InputTransaction) => ({
      id: t.id,
      name: t.name,
      date: t.date,
      direction: 'income' as TransactionDirection,
      amount: t.value || 0,
      category: categoryIdToName[categoryIdToParentId[t.category_id]] || '',
      subCategory: categoryIdToName[t.category_id] || '',
      purpose: t.name,
    }),
  );

  const expenseTransactions: Transaction[] = expenseInputTransactions.map(
    (t: InputTransaction) => ({
      id: t.id,
      name: t.name,
      direction: 'expense' as TransactionDirection,
      date: t.date,
      amount: t.value || 0,
      category: categoryIdToName[categoryIdToParentId[t.category_id]] || '',
      subCategory: categoryIdToName[t.category_id],
      purpose: t.name,
    }),
  );

  const flows = data.categories.map((c: InputCategory) => ({
    id: c.id,
    name: c.name,
    direction: c.direction,
    value: 0,
    parent: c.parent,
  }));
  const flowsByCategoryIdMap = flows.reduce(
    (acc: Record<string, Flow>, f: Flow) => {
      acc[f.id] = f;
      return acc;
    },
    {},
  );
  for (const t of [...incomeInputTransactions, ...expenseInputTransactions]) {
    let flow = flowsByCategoryIdMap[t.category_id];
    flow.value += t.value;
    // 親カテゴリの value は子カテゴリの value の合計なので、子カテゴリの value を親カテゴリに加算していく
    while (flow.parent) {
      flow = flowsByCategoryIdMap[flow.parent];
      flow.value += t.value;
    }
  }
  // root category は income と expense 両方の合計になるので、半分にする
  const rootFlow = flows.find((f: Flow) => !f.parent);
  if (rootFlow) {
    rootFlow.value /= 2;
  }
  const reportId = `${outputId}-${data.year}`;
  const report: Report = {
    id: reportId,
    totalIncome: totalIncome,
    totalExpense: totalExpense,
    totalBalance: balanceTransaction ? balanceTransaction.value : 0,
    year: data.year,
    orgType: data.basic_info.orgType,
    orgName: data.basic_info.orgName,
    activityArea: data.basic_info.activityArea,
    representative: data.basic_info.representative,
    fundManagementOrg: data.basic_info.fundManagementOrg,
    accountingManager: data.basic_info.accountingManager,
    administrativeManager: data.basic_info.administrativeManager,
    lastUpdate: data.basic_info.lastUpdate,
  };

  const profile: Profile = {
    name: data.basic_info.representative,
    title: data.basic_info.representative,
    party: data.basic_info.orgName,
    image: '/demo-example.png',
  };

  const allTransactions = [...incomeTransactions, ...expenseTransactions];

  return {
    id: outputId,
    latestReportId: reportId,
    profile,
    data: [
      {
        report,
        transactions: allTransactions,
      },
    ],
  };
}

function validateInput(data: InputData): string[] {
  const errors: string[] = [];
  if (typeof data.year !== 'number') {
    throw new Error('year は数値である必要があります');
  }
  if (!data.categories || !data.transactions) {
    throw new Error('categories と transactions が必要です');
  }
  if (!Array.isArray(data.categories)) {
    throw new Error('categories は配列である必要があります');
  }
  if (!Array.isArray(data.transactions)) {
    throw new Error('transactions は配列である必要があります');
  }

  for (const category of data.categories) {
    if (!category.name || !category.direction) {
      throw new Error(
        `category は name, direction を持つ必要があります: ${JSON.stringify(
          category,
        )}`,
      );
    }
    if (category.direction !== 'income' && category.direction !== 'expense') {
      throw new Error(
        'category の direction は income か expense である必要があります',
      );
    }
  }

  if (
    !data.categories.find((c: InputCategory) => c.name === '前年からの繰越額')
  ) {
    throw new Error('カテゴリ「前年からの繰越額」が存在する必要があります');
  }
  if (
    !data.categories.find((c: InputCategory) => c.name === '翌年への繰越額')
  ) {
    throw new Error('カテゴリ「翌年への繰越額」が存在する必要があります');
  }

  const previousYearCategory = data.categories.find(
    (c: InputCategory) => c.name === '前年からの繰越額',
  );
  const nextYearCategory = data.categories.find(
    (c: InputCategory) => c.name === '翌年への繰越額',
  );
  const previousYearTransactions = data.transactions.filter(
    (t: InputTransaction) => t.category_id === previousYearCategory?.id,
  );
  if (previousYearTransactions.length !== 1) {
    throw new Error(
      '前年からの繰越額の transaction はちょうど1つである必要があります',
    );
  }
  const nextYearTransactions = data.transactions.filter(
    (t: InputTransaction) => t.category_id === nextYearCategory?.id,
  );
  if (nextYearTransactions.length !== 1) {
    throw new Error(
      '翌年への繰越額の transaction はちょうど1つである必要があります',
    );
  }

  const incomeCategoryIds = data.categories
    .filter((c: InputCategory) => c.direction === 'income')
    .map((c: InputCategory) => c.id);
  const expenseCategoryIds = data.categories
    .filter((c: InputCategory) => c.direction === 'expense')
    .map((c: InputCategory) => c.id);
  const totalIncome = data.transactions
    .filter((t: InputTransaction) => incomeCategoryIds.includes(t.category_id))
    .reduce((sum: number, t: InputTransaction) => sum + t.value, 0);
  const totalExpense = data.transactions
    .filter((t: InputTransaction) => expenseCategoryIds.includes(t.category_id))
    .reduce((sum: number, t: InputTransaction) => sum + t.value, 0);
  if (totalIncome !== totalExpense) {
    errors.push(
      `income と expense の合計が一致しません: ${totalIncome} !== ${totalExpense}`,
    );
  }

  const rootCategoryCount = data.categories.filter(
    (c: InputCategory) => !c.parent,
  ).length;
  if (rootCategoryCount !== 1) {
    errors.push('root category はちょうど1つである必要があります');
  }
  for (const category of data.categories) {
    if (category.id === category.parent) {
      throw new Error(
        `category の id と parent が同じです。 category.id: ${category.id}`,
      );
    }
  }

  const categoryIds = data.categories.map((c: InputCategory) => c.id);
  const parentCategoryIds = data.categories
    .map((c: InputCategory) => c.parent)
    .filter((p: string | null) => p !== null);
  const leafCategoryIds = data.categories
    .filter((c: InputCategory) => !parentCategoryIds.includes(c.id))
    .map((c: InputCategory) => c.id);
  for (const transaction of data.transactions) {
    if (
      !transaction.id ||
      !transaction.category_id ||
      !transaction.name ||
      !transaction.date ||
      !transaction.value
    ) {
      errors.push(
        `transaction は id, category_id, name, date, value を持つ必要があります。 transaction.id: ${transaction.id}, transaction.category_id: ${transaction.category_id}, transaction.name: ${transaction.name}, transaction.date: ${transaction.date}, transaction.value: ${transaction.value}`,
      );
    }
    if (!categoryIds.includes(transaction.category_id)) {
      errors.push(
        `transaction の category_id は categories に存在する必要があります。 transaction.id: ${transaction.id}, transaction.category_id: ${transaction.category_id}`,
      );
    }
    if (!leafCategoryIds.includes(transaction.category_id)) {
      errors.push(
        `transaction の category_id は葉カテゴリである必要があります。 transaction.id: ${transaction.id}, transaction.category_id: ${transaction.category_id}`,
      );
    }
    if (typeof transaction.date !== 'string') {
      errors.push(
        `transaction の date は文字列である必要があります。 transaction.id: ${transaction.id}, transaction.date: ${transaction.date}`,
      );
    }
    if (typeof transaction.value !== 'number' || transaction.value <= 0) {
      errors.push(
        `transaction の value は正数である必要があります。 transaction.id: ${transaction.id}, transaction.value: ${transaction.value}`,
      );
    }
  }
  return errors;
}

function parseArguments(): {
  inputFile: string;
  outputFile: string;
  outputId: string;
  ignoreErrors: boolean;
} {
  const args = process.argv.slice(2);
  let inputFile = '';
  let outputFile = '';
  let outputId = 'converted-data';
  let ignoreErrors = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-i' && i + 1 < args.length) {
      inputFile = args[i + 1];
      i++;
    } else if (args[i] === '-o' && i + 1 < args.length) {
      outputFile = args[i + 1];
      i++;
    } else if (args[i] === '--id' && i + 1 < args.length) {
      outputId = args[i + 1];
      i++;
    } else if (args[i] === '--ignore-errors') {
      ignoreErrors = true;
    }
  }

  if (!inputFile || !outputFile) {
    console.error(
      '使用方法: node generator.js -i <入力JSONファイル> -o <出力JSONファイル> [--id <データID>] [--ignore-errors]',
    );
    process.exit(1);
  }

  return { inputFile, outputFile, outputId, ignoreErrors };
}

function main(): void {
  try {
    const { inputFile, outputFile, outputId, ignoreErrors } = parseArguments();

    const inputPath = path.resolve(inputFile);
    const rawData = fs.readFileSync(inputPath, 'utf8');
    const data = JSON.parse(rawData);

    const errors = validateInput(data);
    if (errors.length > 0) {
      for (const error of errors) {
        console.error(`Error: ${error}`);
      }
      if (!ignoreErrors) {
        process.exit(1);
      }
    }

    const convertedData = convert(data, outputId);

    const outputPath = path.resolve(outputFile);
    fs.writeFileSync(outputPath, JSON.stringify(convertedData, null, 2));

    console.log(`処理が完了しました。出力ファイル: ${outputPath}`);
  } catch (error) {
    console.error('エラーが発生しました:', error);
    process.exit(1);
  }
}

main();

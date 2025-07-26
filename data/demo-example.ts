import type {
  AccountingReports,
  Flow,
  Profile,
  Report,
  Transaction,
} from '@/models/type';

const profile: Profile = {
  name: 'テスト太郎',
  title: '（デモ用）',
  party: 'ポリマネー党',
  birth_year: 1980,
  birth_place: '東京都',
  image: '/demo-example.png',
  description:
    'ポリマネー党の代表。架空の人物です。ポリマネー党の代表。架空の人物です。ポリマネー党の代表。架空の人物です。',
};

const reports: Report[] = [
  {
    id: 'demo-example-2023',
    year: 2023,
    totalIncome: 111111,
    totalExpense: 100000,
    totalBalance: 11111,
    orgType: 'その他の政治団体',
    orgName: 'テストの会',
    activityArea: '2以上の都道府県の区域等',
    representative: 'テスト花子',
    fundManagementOrg: '有/参議院議員(現職)テスト花子',
    accountingManager: 'テスト花子',
    administrativeManager: 'テスト花子',
    lastUpdate: '2024年1月1日',
  },
  {
    id: 'demo-example-2024',
    year: 2024,
    totalIncome: 111111,
    totalExpense: 100000,
    totalBalance: 11111,
    orgType: 'その他の政治団体',
    orgName: 'テストの会',
    activityArea: '2以上の都道府県の区域等',
    representative: 'テスト花子',
    fundManagementOrg: '有/参議院議員(現職)テスト花子',
    accountingManager: 'テスト花子',
    administrativeManager: 'テスト花子',
    lastUpdate: '2024年1月1日',
  },
];

const flows: Flow[] = [
  {
    id: 'i11',
    name: '個人からの寄附',
    direction: 'income',
    value: 111111,
    parent: '総収入',
  },
  {
    id: 'i99',
    name: '総収入',
    direction: 'expense',
    value: 111111,
    parent: null,
  },
  {
    id: 'e11',
    name: '経常経費',
    direction: 'expense',
    value: 100000,
    parent: '総収入',
  },
  {
    id: 'e13',
    name: '翌年への繰越額',
    direction: 'expense',
    value: 11111,
    parent: '総収入',
  },
  {
    id: 'e21',
    name: '人件費',
    direction: 'expense',
    value: 100000,
    parent: '経常経費',
  },
];

const transactions: Transaction[] = [
  {
    id: '7-1-1',
    direction: 'income',
    category: '寄附',
    subCategory: '個人',
    purpose: '',
    name: '個人からの寄附(111名)',
    amount: 111111,
    date: '',
  },
  {
    id: '14-3-13',
    direction: 'expense',
    category: '経常経費',
    subCategory: '人件費',
    purpose: '人件費',
    name: '人件費',
    amount: 100000,
    date: '2024/1/1',
  },
];

const data2023 = {
  report: reports[0],
  flows,
  transactions,
};

const data2024 = {
  report: reports[1],
  flows,
  transactions,
};

const accountingReports: AccountingReports = {
  id: 'demo-example',
  latestReportId: 'demo-example-2024',
  profile,
  datas: [data2023, data2024],
};

const dataByYear: Record<number, any> = {
  2023: data2023,
  2024: data2024,
};

export const getDataByYear = (year: number) => {
  const dataForYear = dataByYear[year];
  if (!dataForYear) {
    return null;
  }
  return {
    profile,
    datas: [dataForYear],
  };
};

export default accountingReports;

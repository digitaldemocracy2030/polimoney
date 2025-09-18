import type { AccountingReports, Profile } from '@/models/type';
import type { DataByYear, ReportsByYear } from './common';

/**
 * デモ用政治家データファイル（テンプレート）
 *
 * このファイルは他のdemo-*.tsファイルの標準フォーマットとして使用されます。
 * 新しい政治家データを追加する際は、この構造に従ってください。
 */

// =============================================================================
// 政治家プロフィール
// =============================================================================
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

// =============================================================================
// 年次レポート
// =============================================================================
const reports: ReportsByYear = {
  2023: {
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
  2024: {
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
};

// =============================================================================
// 年度別データ（flows と transactions）
// =============================================================================

const data: DataByYear = {
  2023: {
    flows: [
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
    ],
    transactions: [
      {
        id: '7-1-1',
        direction: 'income',
        category: '寄附',
        subCategory: '個人',
        purpose: '',
        name: '個人からの寄附(111名)',
        amount: 111111,
        date: '2023/1/1',
      },
      {
        id: '14-3-13',
        direction: 'expense',
        category: '経常経費',
        subCategory: '人件費',
        purpose: '人件費',
        name: '人件費',
        amount: 100000,
        date: '2023/12/31',
      },
    ],
  },
  2024: {
    flows: [
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
    ],
    transactions: [
      {
        id: '7-1-1',
        direction: 'income',
        category: '寄附',
        subCategory: '個人',
        purpose: '',
        name: '個人からの寄附(111名)',
        amount: 111111,
        date: '2024/1/1',
      },
      {
        id: '14-3-13',
        direction: 'expense',
        category: '経常経費',
        subCategory: '人件費',
        purpose: '人件費',
        name: '人件費',
        amount: 100000,
        date: '2024/12/31',
      },
    ],
  },
};

// =============================================================================
// メインデータ構造（AccountingReports型）
// =============================================================================
const accountingReports: AccountingReports = {
  id: 'demo-example',
  latestReportId: 'demo-example-2024',
  profile,
  data: Object.keys(reports)
    .map(Number)
    .sort((a, b) => a - b) // 昇順
    .map((year) => ({
      report: reports[year],
      flows: data[year].flows,
      transactions: data[year].transactions,
    })),
};
export default accountingReports;

// =============================================================================
// エクスポート関数
// =============================================================================

/**
 * 指定された年度のデータを取得します
 * @param year - 取得したい年度
 * @returns 指定年度のデータ、存在しない場合はnull
 */
export const getDataByYear = (year: number) => {
  const report = reports[year];
  const yearData = data[year];

  if (!report || !yearData) {
    return null;
  }

  return {
    profile,
    data: [
      {
        report: report,
        flows: yearData.flows,
        transactions: yearData.transactions,
      },
    ],
  };
};

import type { DataByYear, ReportsByYear } from '@/data/uniformed/common';
import type { AccountingReports, Profile } from '@/models/uniformed/type';

// =============================================================================
// 政治家プロフィール
// =============================================================================
const profile: Profile = {
  name: '藤崎 剛暉',
  title: '自由民主党',
  party: '自由民主党',
  district: '東京都墨田区',
  image: '/demo-kokifujisaki.jpg',
};

// =============================================================================
// 年次レポート
// =============================================================================
const reports: ReportsByYear = {
  2022: {
    id: 'demo-koki-fujisaki-2022',
    totalIncome: 494300,
    totalExpense: 120000,
    totalBalance: 374300,
    year: 2022,
    orgType: '政党の支部',
    orgName: '自由民主党東京都墨田区第十六支部',
    activityArea: '東京都内',
    representative: '藤崎 剛暉',
    fundManagementOrg: '無し',
    accountingManager: '前田 隆',
    administrativeManager: '藤崎 剛暉',
    lastUpdate: '2022年3月27日',
  },
  2023: {
    id: 'demo-koki-fujisaki-2023',
    totalIncome: 607500,
    totalExpense: 250000,
    totalBalance: 357500,
    year: 2023,
    orgType: '政党の支部',
    orgName: '自由民主党東京都墨田区第十六支部',
    activityArea: '東京都内',
    representative: '藤崎 剛暉',
    fundManagementOrg: '無し',
    accountingManager: '前田 隆',
    administrativeManager: '藤崎 剛暉',
    lastUpdate: '2023年3月30日',
  },
  2024: {
    id: 'demo-koki-fujisaki-2024',
    totalIncome: 2154820,
    totalExpense: 1143920,
    totalBalance: 1010900,
    year: 2024,
    orgType: '政党の支部',
    orgName: '自由民主党東京都墨田区第十六支部',
    activityArea: '東京都内',
    representative: '藤崎 剛暉',
    fundManagementOrg: '無し',
    accountingManager: '前田 隆',
    administrativeManager: '藤崎 剛暉',
    lastUpdate: '2024年3月30日',
  },
};

// =============================================================================
// 年次財務フローデータ
// =============================================================================
const data: DataByYear = {
  2022: {
    categories: {
      income: [
        { id: 'i01', name: '前年繰越' },
        { id: 'i02', name: '本年の収入額' },
        { id: 'i03', name: '党費・会費', parent: 'i02' },
        { id: 'i04', name: '交付金', parent: 'i02' },
      ],
      expense: [
        { id: 'e01', name: '政治活動費' },
        { id: 'e02', name: '翌年繰越' },
        { id: 'e03', name: '組織活動費', parent: 'e01' },
      ],
    },
    transactions: [
      // 収入
      {
        id: 'i1',
        direction: 'income',
        category: '前年繰越',
        purpose: '前年からの繰越額',
        name: '前年からの繰越額',
        amount: 272300,
        date: '2022/1/1',
      },
      {
        id: 'i2',
        direction: 'income',
        category: '党費・会費',
        purpose: '個人の負担する党費又は会費',
        name: '個人の負担する党費又は会費',
        amount: 22000,
        date: '2022/12/31',
      },
      {
        id: 'i3',
        direction: 'income',
        category: '交付金',
        purpose: '本部又は支部から供与された交付金',
        name: '本部又は支部から供与された交付金',
        amount: 200000,
        date: '2022/12/31',
      },
      // 支出
      {
        id: 'e5',
        direction: 'expense',
        category: '政治活動費',
        purpose: '組織活動費',
        name: '組織活動費',
        amount: 120000,
        date: '2022/12/31',
      },
    ],
  },
  2023: {
    categories: {
      income: [
        { id: 'i01', name: '前年繰越' },
        { id: 'i02', name: '本年の収入額' },
        { id: 'i03', name: '党費・会費', parent: 'i02' },
        { id: 'i04', name: '交付金', parent: 'i02' },
      ],
      expense: [
        { id: 'e01', name: '政治活動費' },
        { id: 'e03', name: '組織活動費', parent: 'e01' },
      ],
    },
    transactions: [
      // 収入
      {
        id: 'i1',
        direction: 'income',
        category: '前年繰越',
        purpose: '前年からの繰越額',
        name: '前年からの繰越額',
        amount: 374300,
        date: '2023/1/1',
      },
      {
        id: 'i2',
        direction: 'income',
        category: '党費・会費',
        purpose: '個人の負担する党費又は会費',
        name: '個人の負担する党費又は会費',
        amount: 33200,
        date: '2023/12/31',
      },
      {
        id: 'i3',
        direction: 'income',
        category: '交付金',
        purpose: '本部又は支部から供与された交付金',
        name: '本部又は支部から供与された交付金',
        amount: 200000,
        date: '2023/12/31',
      },
      // 支出
      {
        id: 'e5',
        direction: 'expense',
        category: '政治活動費',
        purpose: '組織活動費',
        name: '組織活動費',
        amount: 250000,
        date: '2023/12/31',
      },
    ],
  },
  2024: {
    categories: {
      income: [
        { id: 'i01', name: '前年繰越' },
        { id: 'i02', name: '本年の収入額' },
        { id: 'i03', name: '党費・会費', parent: 'i02' },
        { id: 'i04', name: '交付金', parent: 'i02' },
        { id: 'i05', name: '事業収入', parent: 'i02' },
        { id: 'i06', name: '寄附', parent: 'i02' },
      ],
      expense: [
        { id: 'e01', name: '政治活動費' },
        { id: 'e02', name: '翌年繰越' },
        { id: 'e03', name: '組織活動費', parent: 'e01' },
        { id: 'e04', name: '宣伝事業費', parent: 'e01' },
        { id: 'e05', name: '選挙関係費', parent: 'e01' },
        { id: 'e06', name: 'その他の経費', parent: 'e01' },
      ],
    },
    transactions: [
      // 収入
      {
        id: 'i1',
        direction: 'income',
        category: '前年繰越',
        purpose: '前年からの繰越額',
        name: '前年からの繰越額',
        amount: 357500,
        date: '2024/1/1',
      },
      {
        id: 'i2',
        direction: 'income',
        category: '党費・会費',
        purpose: '個人の負担する党費又は会費',
        name: '個人の負担する党費又は会費',
        amount: 28400,
        date: '2024/12/31',
      },
      {
        id: 'i3',
        direction: 'income',
        category: '寄附',
        purpose: '寄附',
        name: '寄附',
        amount: 1468920,
        date: '2024/12/31',
      },
      {
        id: 'i4',
        direction: 'income',
        category: '交付金',
        purpose: '本部又は支部から供与された交付金',
        name: '本部又は支部から供与された交付金',
        amount: 300000,
        date: '2024/12/31',
      },
      // 支出
      {
        id: 'e6',
        direction: 'expense',
        category: '政治活動費',
        purpose: '選挙関係費',
        name: '選挙関係費',
        amount: 1100000,
        date: '2024/12/31',
      },
      {
        id: 'e10',
        direction: 'expense',
        category: '政治活動費',
        purpose: 'その他の経費',
        name: 'その他の経費',
        amount: 43920,
        date: '2024/12/31',
      },
    ],
  },
};

// =============================================================================
// メインデータ構造（AccountingReports型）
// =============================================================================
const accountingReports: AccountingReports = {
  id: 'demo-koki-fujisaki',
  latestReportId: 'demo-koki-fujisaki-2024',
  profile,
  data: Object.keys(reports)
    .map(Number)
    .sort((a, b) => a - b) // 昇順
    .map((year) => ({
      report: reports[year],
      transactions: data[year].transactions,
      categories: data[year].categories,
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
        transactions: yearData.transactions,
        categories: yearData.categories,
      },
    ],
  };
};

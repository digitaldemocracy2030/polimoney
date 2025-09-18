import type { AccountingReports, Profile } from '@/models/type';
import type { DataByYear, ReportsByYear } from './common';

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
    flows: [
      // 収入
      {
        id: 'i1',
        name: '前年からの繰越額',
        direction: 'income',
        value: 272300,
        parent: '総収入',
      },
      {
        id: 'i2',
        name: '本年の収入額',
        direction: 'income',
        value: 222000,
        parent: '総収入',
      },
      {
        id: 'i3',
        name: '個人の負担する党費又は会費',
        direction: 'income',
        value: 22000,
        parent: '本年の収入額',
      },
      {
        id: 'i4',
        name: '本部又は支部から供与された交付金',
        direction: 'income',
        value: 200000,
        parent: '本年の収入額',
      },
      // 総収入
      {
        id: 'i_total',
        name: '総収入',
        direction: 'expense',
        value: 494300,
        parent: null,
      },
      // 支出
      {
        id: 'e2',
        name: '政治活動費',
        direction: 'expense',
        value: 120000,
        parent: '総収入',
      },
      {
        id: 'e3',
        name: '組織活動費',
        direction: 'expense',
        value: 120000,
        parent: '政治活動費',
      },
      // 翌年への繰越
      {
        id: 'e_next',
        name: '翌年への繰越',
        direction: 'expense',
        value: 374300,
        parent: '総収入',
      },
    ],
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
    flows: [
      // 収入
      {
        id: 'i1',
        name: '前年からの繰越額',
        direction: 'income',
        value: 374300,
        parent: '総収入',
      },
      {
        id: 'i2',
        name: '本年の収入額',
        direction: 'income',
        value: 233200,
        parent: '総収入',
      },
      {
        id: 'i3',
        name: '個人の負担する党費又は会費',
        direction: 'income',
        value: 33200,
        parent: '本年の収入額',
      },
      {
        id: 'i4',
        name: '本部又は支部から供与された交付金',
        direction: 'income',
        value: 200000,
        parent: '本年の収入額',
      },
      // 総収入
      {
        id: 'i_total',
        name: '総収入',
        direction: 'expense',
        value: 607500,
        parent: null,
      },
      // 支出
      {
        id: 'e2',
        name: '政治活動費',
        direction: 'expense',
        value: 250000,
        parent: '総収入',
      },
      {
        id: 'e3',
        name: '組織活動費',
        direction: 'expense',
        value: 250000,
        parent: '政治活動費',
      },
      // 翌年への繰越
      {
        id: 'e_next',
        name: '翌年への繰越',
        direction: 'expense',
        value: 357500,
        parent: '総収入',
      },
    ],
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
    flows: [
      // 収入
      {
        id: 'i1',
        name: '前年からの繰越額',
        direction: 'income',
        value: 357500,
        parent: '総収入',
      },
      {
        id: 'i2',
        name: '本年の収入額',
        direction: 'income',
        value: 1797320,
        parent: '総収入',
      },
      {
        id: 'i3',
        name: '個人の負担する党費又は会費',
        direction: 'income',
        value: 28400,
        parent: '本年の収入額',
      },
      {
        id: 'i4',
        name: '寄附',
        direction: 'income',
        value: 1468920,
        parent: '本年の収入額',
      },
      {
        id: 'i5',
        name: '本部又は支部から供与された交付金',
        direction: 'income',
        value: 300000,
        parent: '本年の収入額',
      },
      {
        id: 'i_total',
        name: '総収入',
        direction: 'expense',
        value: 2154820,
        parent: null,
      },
      // 支出
      {
        id: 'e2',
        name: '政治活動費',
        direction: 'expense',
        value: 1143920,
        parent: '総収入',
      },
      {
        id: 'e3',
        name: '選挙関係費',
        direction: 'expense',
        value: 1100000,
        parent: '政治活動費',
      },
      {
        id: 'e4',
        name: 'その他の経費',
        direction: 'expense',
        value: 43920,
        parent: '政治活動費',
      },
      // 翌年への繰越
      {
        id: 'e_next',
        name: '翌年への繰越',
        direction: 'expense',
        value: 1010900,
        parent: '総収入',
      },
    ],
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

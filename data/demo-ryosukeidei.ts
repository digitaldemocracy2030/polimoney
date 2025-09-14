import type { AccountingReports, Profile } from '@/models/type';
import type { DataByYear, ReportsByYear } from './common';

// =============================================================================
// 政治家プロフィール
// =============================================================================
const profile: Profile = {
  name: '出井 良輔',
  title: '自由民主党',
  party: '自由民主党',
  district: '東京都中野区',
  image: '/demo-ryosukeidei.jpg',
};

// =============================================================================
// 年次レポート
// =============================================================================
const reports: ReportsByYear = {
  2024: {
    id: 'demo-ryosuke-idei-2024',
    year: 2024,
    totalIncome: 30874279,
    totalExpense: 29974871,
    totalBalance: 899408,
    orgType: '政党の支部',
    orgName: '自由民主党東京都中野区第二十支部',
    activityArea: '東京都内',
    representative: '出井 良輔',
    fundManagementOrg: '無し',
    accountingManager: '栢森 高志',
    administrativeManager: '出井 良輔',
    lastUpdate: '令和7年2月13日',
  },
};

// =============================================================================
// 年度別データ（flows と transactions）
// =============================================================================
const data: DataByYear = {
  2024: {
    flows: [
      {
        id: 'i1',
        name: '前年からの繰越額',
        direction: 'income',
        value: 3406179,
        parent: '総収入',
      },
      {
        id: 'i2',
        name: '個人の負担する党費又は会費',
        direction: 'income',
        value: 251100,
        parent: '本年の収入額',
      },
      {
        id: 'i3',
        name: '個人からの寄附',
        direction: 'income',
        value: 14627000,
        parent: '寄附',
      },
      {
        id: 'i4',
        name: '法人その他の団体からの寄附',
        direction: 'income',
        value: 6530000,
        parent: '寄附',
      },
      {
        id: 'i5',
        name: '政治団体からの寄附',
        direction: 'income',
        value: 1810000,
        parent: '寄附',
      },
      {
        id: 'i6',
        name: '寄附',
        direction: 'income',
        value: 22967000,
        parent: '本年の収入額',
      },
      {
        id: 'i7',
        name: '本部又は支部から供与された交付金',
        direction: 'income',
        value: 1250000,
        parent: '本年の収入額',
      },
      {
        id: 'i8',
        name: 'その他の収入',
        direction: 'income',
        value: 3000000,
        parent: '本年の収入額',
      },
      {
        id: 'i9',
        name: '本年の収入額',
        direction: 'income',
        value: 27468100,
        parent: '総収入',
      },
      // 総収入
      {
        id: 'i_total',
        name: '総収入',
        direction: 'expense',
        value: 30874279,
        parent: null,
      },
      // 支出
      {
        id: 'e1',
        name: '人件費',
        direction: 'expense',
        value: 3600000,
        parent: '経常経費',
      },
      {
        id: 'e2',
        name: '光熱水費',
        direction: 'expense',
        value: 240000,
        parent: '経常経費',
      },
      {
        id: 'e3',
        name: '備品・消耗品費',
        direction: 'expense',
        value: 1858006,
        parent: '経常経費',
      },
      {
        id: 'e4',
        name: '事務所費',
        direction: 'expense',
        value: 9701324,
        parent: '経常経費',
      },
      {
        id: 'e5',
        name: '経常経費',
        direction: 'expense',
        value: 15399330,
        parent: '総収入',
      },
      {
        id: 'e6',
        name: '組織活動費',
        direction: 'expense',
        value: 3623335,
        parent: '政治活動費',
      },
      {
        id: 'e7',
        name: '選挙関係費',
        direction: 'expense',
        value: 4000000,
        parent: '政治活動費',
      },
      {
        id: 'e8',
        name: '宣伝事業費',
        direction: 'expense',
        value: 6852206,
        parent: '機関紙誌の発行その他の事業費',
      },
      {
        id: 'e9',
        name: '機関紙誌の発行その他の事業費',
        direction: 'expense',
        value: 6852206,
        parent: '政治活動費',
      },
      // { id: 'e10', name: '調査研究費', direction: 'expense', value: 0, parent: '政治活動費' },
      {
        id: 'e11',
        name: '寄附・交付金',
        direction: 'expense',
        value: 100000,
        parent: '政治活動費',
      },
      // { id: 'e12', name: 'その他の経費', direction: 'expense', value: 0, parent: '政治活動費' },
      {
        id: 'e13',
        name: '政治活動費',
        direction: 'expense',
        value: 14575541,
        parent: '総収入',
      },
      // 翌年への繰越
      {
        id: 'e_next',
        name: '翌年への繰越',
        direction: 'expense',
        value: 899408,
        parent: '総収入',
      },
    ],
    transactions: [
      {
        id: 'i1',
        direction: 'income',
        category: '前年繰越',
        purpose: '前年からの繰越額',
        name: '前年からの繰越額',
        amount: 3406179,
        date: '2024/12/31',
      },
      {
        id: 'i2',
        direction: 'income',
        category: '党費・会費',
        purpose: '個人の負担する党費又は会費',
        name: '個人の負担する党費又は会費',
        amount: 251100,
        date: '2024/12/31',
      },
      {
        id: 'i3',
        direction: 'income',
        category: '寄附',
        purpose: '個人からの寄附',
        name: '個人からの寄附',
        amount: 14627000,
        date: '2024/12/31',
      },
      {
        id: 'i4',
        direction: 'income',
        category: '寄附',
        purpose: '法人その他の団体からの寄附',
        name: '法人その他の団体からの寄附',
        amount: 6530000,
        date: '2024/12/31',
      },
      {
        id: 'i5',
        direction: 'income',
        category: '寄附',
        purpose: '政治団体からの寄附',
        name: '政治団体からの寄附',
        amount: 1810000,
        date: '2024/12/31',
      },
      {
        id: 'i6',
        direction: 'income',
        category: '交付金',
        purpose: '本部又は支部から供与された交付金',
        name: '本部又は支部から供与された交付金',
        amount: 1250000,
        date: '2024/12/31',
      },
      {
        id: 'i7',
        direction: 'income',
        category: 'その他収入',
        purpose: 'その他の収入',
        name: 'その他の収入',
        amount: 3000000,
        date: '2024/12/31',
      },
      {
        id: 'e1',
        direction: 'expense',
        category: '経常経費',
        purpose: '人件費',
        name: '人件費',
        amount: 3600000,
        date: '2024/12/31',
      },
      {
        id: 'e2',
        direction: 'expense',
        category: '経常経費',
        purpose: '光熱水費',
        name: '光熱水費',
        amount: 240000,
        date: '2024/12/31',
      },
      {
        id: 'e3',
        direction: 'expense',
        category: '経常経費',
        purpose: '備品・消耗品費',
        name: '備品・消耗品費',
        amount: 1858006,
        date: '2024/12/31',
      },
      {
        id: 'e4',
        direction: 'expense',
        category: '経常経費',
        purpose: '事務所費',
        name: '事務所費',
        amount: 9701324,
        date: '2024/12/31',
      },
      {
        id: 'e5',
        direction: 'expense',
        category: '政治活動費',
        purpose: '組織活動費',
        name: '組織活動費',
        amount: 3623335,
        date: '2024/12/31',
      },
      {
        id: 'e6',
        direction: 'expense',
        category: '政治活動費',
        purpose: '選挙関係費',
        name: '選挙関係費',
        amount: 4000000,
        date: '2024/12/31',
      },
      {
        id: 'e7',
        direction: 'expense',
        category: '機関紙誌の発行その他の事業費',
        purpose: '宣伝事業費',
        name: '宣伝事業費',
        amount: 6852206,
        date: '2024/12/31',
      },
      {
        id: 'e8',
        direction: 'expense',
        category: '政治活動費',
        purpose: '調査研究費',
        name: '調査研究費',
        amount: 0,
        date: '2024/12/31',
      },
      {
        id: 'e9',
        direction: 'expense',
        category: '政治活動費',
        purpose: '寄附・交付金',
        name: '寄附・交付金',
        amount: 100000,
        date: '2024/12/31',
      },
      {
        id: 'e10',
        direction: 'expense',
        category: '政治活動費',
        purpose: 'その他の経費',
        name: 'その他の経費',
        amount: 0,
        date: '2024/12/31',
      },
    ],
  },
};

// =============================================================================
// メインデータ構造（AccountingReports型）
// =============================================================================
const accountingReports: AccountingReports = {
  id: 'demo-ryosuke-idei',
  latestReportId: 'demo-ryosuke-idei-2024',
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

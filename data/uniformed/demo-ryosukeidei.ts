import type { DataByYear, ReportsByYear } from '@/data/uniformed/common';
import type { AccountingReports, Profile } from '@/models/uniformed/type';

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
    categories: {
      income: [
        { id: 'i01', name: '前年からの繰越額' },
        { id: 'i02', name: '本年の収入額' },
        { id: 'i03', name: '個人の負担する党費又は会費', parent: 'i02' },
        { id: 'i04', name: '寄附', parent: 'i02' },
        { id: 'i05', name: '本部又は支部から供与された交付金', parent: 'i02' },
        { id: 'i06', name: 'その他の収入', parent: 'i02' },
        { id: 'i07', name: '個人からの寄附', parent: 'i04' },
        { id: 'i08', name: '法人その他の団体からの寄附', parent: 'i04' },
        { id: 'i09', name: '政治団体からの寄附', parent: 'i04' },
      ],
      expense: [
        { id: 'e01', name: '経常経費' },
        { id: 'e02', name: '政治活動費' },
        { id: 'e03', name: '人件費', parent: 'e01' },
        { id: 'e04', name: '光熱水費', parent: 'e01' },
        { id: 'e05', name: '備品・消耗品費', parent: 'e01' },
        { id: 'e06', name: '事務所費', parent: 'e01' },
        { id: 'e07', name: '組織活動費', parent: 'e02' },
        { id: 'e08', name: '選挙関係費', parent: 'e02' },
        { id: 'e09', name: '機関紙誌の発行その他の事業費', parent: 'e02' },
        { id: 'e10', name: '寄附・交付金', parent: 'e02' },
        { id: 'e11', name: '宣伝事業費', parent: 'e09' },
      ],
    },
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

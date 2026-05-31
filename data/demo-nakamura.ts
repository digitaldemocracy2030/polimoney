import type { AccountingReports, Profile } from '@/models/type';
import type { DataByYear, ReportsByYear } from './common';

// =============================================================================
// 政治家プロフィール
// =============================================================================
const profile: Profile = {
  name: '中村幸信',
  title: '公認会計士',
  party: '再生の道',
  district: '東京都豊島区',
  image: '/demo-nakamura.jpg',
};

// =============================================================================
// 年次レポート
// =============================================================================
const reports: ReportsByYear = {
  2025: {
    id: 'yukinobu-nakamura-2025',
    year: 2025,
    totalIncome: 2240000,
    totalExpense: 1223928,
    totalBalance: 1016072,
    orgType: 'その他の政治団体',
    orgName: '中村幸信後援会',
    activityArea: '東京都内',
    representative: '中村 幸信',
    fundManagementOrg: '無',
    accountingManager: '中村 幸信',
    administrativeManager: '',
    lastUpdate: '令和8年3月2日',
  },
};

// =============================================================================
// 年度別データ（categories と transactions）
// =============================================================================
const data: DataByYear = {
  2025: {
    categories: {
      income: [
        { id: 'i01', name: '前年からの繰越額' },
        { id: 'i02', name: '本年の収入額' },
        { id: 'i03', name: '寄附', parent: 'i02' },
        { id: 'i04', name: '個人からの寄附', parent: 'i03' },
      ],
      expense: [
        { id: 'e01', name: '経常経費' },
        { id: 'e02', name: '政治活動費' },
        { id: 'e03', name: '備品・消耗品費', parent: 'e01' },
        { id: 'e04', name: '事務所費', parent: 'e01' },
        { id: 'e05', name: '機関紙誌の発行その他の事業費', parent: 'e02' },
        { id: 'e06', name: '調査研究費', parent: 'e02' },
        { id: 'e07', name: '機関紙誌の発行事業費', parent: 'e05' },
        { id: 'e08', name: '宣伝事業費', parent: 'e05' },
      ],
    },
    transactions: [
      {
        id: 'i3_1',
        direction: 'income',
        category: '寄附',
        purpose: '個人からの寄附',
        name: '個人からの寄附',
        amount: 100000,
        date: '2025/05/21',
      },
      {
        id: 'i3_2',
        direction: 'income',
        category: '寄附',
        purpose: '個人からの寄附',
        name: '個人からの寄附',
        amount: 140000,
        date: '2025/05/23',
      },
      {
        id: 'i3_3',
        direction: 'income',
        category: '寄附',
        purpose: '個人からの寄附',
        name: '個人からの寄附',
        amount: 50000,
        date: '2025/05/26',
      },
      {
        id: 'i3_4',
        direction: 'income',
        category: '寄附',
        purpose: '個人からの寄附',
        name: '個人からの寄附',
        amount: 10000,
        date: '2025/06/07',
      },
      {
        id: 'i3_5',
        direction: 'income',
        category: '寄附',
        purpose: '個人からの寄附',
        name: '個人からの寄附',
        amount: 100000,
        date: '2025/06/08',
      },
      {
        id: 'i3_6',
        direction: 'income',
        category: '寄附',
        purpose: '個人からの寄附',
        name: '個人からの寄附',
        amount: 50000,
        date: '2025/06/09',
      },
      {
        id: 'i3_7',
        direction: 'income',
        category: '寄附',
        purpose: '個人からの寄附',
        name: '個人からの寄附',
        amount: 10000,
        date: '2025/06/10',
      },
      {
        id: 'i3_8',
        direction: 'income',
        category: '寄附',
        purpose: '個人からの寄附',
        name: '個人からの寄附',
        amount: 1000000,
        date: '2025/06/11',
      },
      {
        id: 'i3_9',
        direction: 'income',
        category: '寄附',
        purpose: '個人からの寄附',
        name: '個人からの寄附',
        amount: 100000,
        date: '2025/06/16',
      },
      {
        id: 'i3_10',
        direction: 'income',
        category: '寄附',
        purpose: '個人からの寄附',
        name: '個人からの寄附',
        amount: 10000,
        date: '2025/06/22',
      },
      {
        id: 'i3_11',
        direction: 'income',
        category: '寄附',
        purpose: '個人からの寄附',
        name: '個人からの寄附（その他の寄附）',
        amount: 670000,
        date: '2025/12/31',
      },
      {
        id: 'e_备1',
        direction: 'expense',
        category: '経常経費',
        purpose: '備品・消耗品費',
        name: 'ワイヤレスメガホン',
        amount: 63855,
        date: '2025/05/01',
      },
      {
        id: 'e_备2',
        direction: 'expense',
        category: '経常経費',
        purpose: '備品・消耗品費',
        name: '什器一式',
        amount: 86900,
        date: '2025/05/28',
      },
      {
        id: 'e_备3',
        direction: 'expense',
        category: '経常経費',
        purpose: '備品・消耗品費',
        name: 'その他の支出',
        amount: 100218,
        date: '2025/12/31',
      },
      {
        id: 'e_事1',
        direction: 'expense',
        category: '経常経費',
        purpose: '事務所費',
        name: 'その他の支出',
        amount: 6364,
        date: '2025/12/31',
      },
      {
        id: 'e_機1',
        direction: 'expense',
        category: '政治活動費',
        purpose: '機関紙誌の発行事業費',
        name: '写真撮影代',
        amount: 67100,
        date: '2025/04/25',
      },
      {
        id: 'e_機2',
        direction: 'expense',
        category: '政治活動費',
        purpose: '機関紙誌の発行事業費',
        name: 'ビラポスティング代',
        amount: 104692,
        date: '2025/06/05',
      },
      {
        id: 'e_機3',
        direction: 'expense',
        category: '政治活動費',
        purpose: '機関紙誌の発行事業費',
        name: 'ビラ印刷代',
        amount: 154000,
        date: '2025/06/10',
      },
      {
        id: 'e_宣1',
        direction: 'expense',
        category: '政治活動費',
        purpose: '宣伝事業費',
        name: 'ボネクタ登録費',
        amount: 162360,
        date: '2025/04/21',
      },
      {
        id: 'e_宣2',
        direction: 'expense',
        category: '政治活動費',
        purpose: '宣伝事業費',
        name: 'ホームページ作成管理費',
        amount: 407000,
        date: '2025/05/16',
      },
      {
        id: 'e_宣3',
        direction: 'expense',
        category: '政治活動費',
        purpose: '宣伝事業費',
        name: 'その他の支出',
        amount: 45155,
        date: '2025/12/31',
      },
      {
        id: 'e_調1',
        direction: 'expense',
        category: '政治活動費',
        purpose: '調査研究費',
        name: 'その他の支出',
        amount: 26284,
        date: '2025/12/31',
      },
    ],
  },
};

// =============================================================================
// メインデータ構造（AccountingReports型）
// =============================================================================
const accountingReports: AccountingReports = {
  id: 'yukinobu-nakamura',
  latestReportId: 'yukinobu-nakamura-2025',
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

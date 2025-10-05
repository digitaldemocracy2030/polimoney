import type { DataByYear, ReportsByYear } from '@/data/uniformed/common';
import type { AccountingReports, Profile } from '@/models/uniformed/type';

// =============================================================================
// 政治家プロフィール
// =============================================================================
const profile: Profile = {
  name: '安野貴博',
  title: 'AIエンジニア',
  party: 'チームみらい',
  image: '/demo-takahiroanno.jpg',
};

// =============================================================================
// 年次レポート
// =============================================================================
const reports: ReportsByYear = {
  2024: {
    id: 'demo-takahiro-anno-2024',
    year: 2024,
    totalIncome: 18416736,
    totalExpense: 7580065,
    totalBalance: 10836671,
    orgType:
      '政治資金規正法第18条の２第１項の規定による政治団体\nその他の政治団体',
    orgName: 'デジタル民主主義を考える会',
    activityArea: '東京都内',
    representative: '安野 貴博',
    fundManagementOrg: '有り/東京都知事候補 安野貴博',
    accountingManager: '安野 貴博',
    administrativeManager: '高山 聡史',
    lastUpdate: '2024年3月31日',
  },
};

// =============================================================================
// 年度別データ（flows と transactions）
// =============================================================================
const data: DataByYear = {
  2024: {
    categories: {
      income: [
        { id: 'i01', name: '個人からの寄附' },
        { id: 'i02', name: '借入金' },
      ],
      expense: [
        { id: 'e01', name: '経常経費' },
        { id: 'e02', name: '政治活動費' },
        { id: 'e03', name: '事務所費', parent: 'e01' },
        { id: 'e04', name: '選挙関係費', parent: 'e02' },
        { id: 'e05', name: '組織活動費', parent: 'e02' },
        { id: 'e06', name: '宣伝事業費', parent: 'e02' },
        { id: 'e07', name: 'その他の経費', parent: 'e02' },
      ],
    },
    transactions: [
      {
        id: '4-1',
        direction: 'income',
        category: '借入金',
        purpose: '安野貴博',
        name: '安野貴博',
        amount: 2000000,
        date: '-',
      },
      {
        id: '7-1',
        direction: 'income',
        category: '個人からの寄附',
        purpose: '個人からの寄附',
        name: '個人からの寄附',
        amount: 16416736,
        date: '-',
      },
      {
        id: '14-1',
        direction: 'expense',
        category: '経常経費',
        purpose: 'コミュニケーションツール費用(slack)',
        name: 'コミュニケーションツール費用(slack)',
        amount: 107265 + 152845 + 80552 + 63525 + 62818 + 66105,
        date: '-',
      },
      {
        id: '14-2',
        direction: 'expense',
        category: '経常経費',
        purpose: '献金システム手数料(ボネクタ)',
        name: '献金システム手数料(ボネクタ)',
        amount: 300575 + 130680,
        date: '-',
      },
      {
        id: '14-3',
        direction: 'expense',
        category: '経常経費',
        purpose: 'その他の経常経費',
        name: 'その他の経常経費',
        amount: 209372,
        date: '-',
      },
      {
        id: '15-1',
        direction: 'expense',
        category: '選挙関係費',
        purpose: '寄付',
        name: '寄付',
        amount: 2500000,
        date: '-',
        tooltip:
          'この250万円は、安野たかひろの政治団体（デジタル民主主義を考える会）から、昨年の都知事選候補者としての「安野たかひろ」への寄付となっています。\n\n選挙費用は政治団体ではなく、候補者「安野たかひろ」個人の収支報告を選挙管理委員会に提出する仕組みになっており、この250万円のうち選挙ポスターやビラの印刷費、選挙カー関連の費用など、合計約215万円を選挙費用として計上・報告しており、残額の約35万円は、「安野たかひろ」個人から政治団体（デジタル民主主義を考える会）に再度寄付しています。',
      },
      {
        id: '15-2',
        direction: 'expense',
        category: '組織活動費',
        purpose: 'ブロードリスニングAPI利用料(X)',
        name: 'ブロードリスニングAPI利用料(X)',
        amount: 801378,
        date: '-',
      },
      {
        id: '15-3',
        direction: 'expense',
        category: '組織活動費',
        purpose: 'ブロードリスニングAPI利用料(OpenAI)',
        name: 'ブロードリスニングAPI利用料(OpenAI)',
        amount: 163808 + 166257 + 166257,
        date: '-',
      },
      {
        id: '15-4',
        direction: 'expense',
        category: '組織活動費',
        purpose: '政策広報用音声コンテンツ作成API利用料(ElevenLabs)',
        name: '政策広報用音声コンテンツ作成API利用料(ElevenLabs)',
        amount: 53832 + 112135 + 110797 + 110267 + 110389 + 67069,
        date: '-',
      },
      {
        id: '15-5',
        direction: 'expense',
        category: '組織活動費',
        purpose: 'その他の組織活動費',
        name: 'その他の組織活動費',
        amount: 44139,
        date: '-',
      },
      {
        id: '15-6',
        direction: 'expense',
        category: 'その他の経費',
        purpose: '借入金の返済',
        name: '借入金の返済',
        amount: 2000000,
        date: '-',
      },
    ],
  },
};

// =============================================================================
// メインデータ構造（AccountingReports型）
// =============================================================================
const accountingReports: AccountingReports = {
  id: 'demo-takahiro-anno',
  latestReportId: 'demo-takahiro-anno-2024',
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

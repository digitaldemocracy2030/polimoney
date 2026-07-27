import type {
  AccountingReports,
  Profile,
  Report,
  Transaction,
} from '@/models/type';
export const comingSoonNum = 1;
export const comingSoonId = 'demo-comingsoon';

const profile: Profile = {
  name: 'Coming Soon...',
  title: '',
  party: '',
  image: '/demo-example.png',
};

const emptyReport: Report = {
  id: 'coming-soon',
  totalIncome: 0,
  totalExpense: 0,
  totalBalance: 0,
  year: new Date().getFullYear(),
  orgType: '',
  orgName: '',
  activityArea: '',
  representative: '',
  fundManagementOrg: '',
  accountingManager: '',
  administrativeManager: '',
  lastUpdate: '',
};

const emptyTransactions: Transaction[] = [];

const data = {
  id: comingSoonId,
  latestReportId: comingSoonId,
  profile,
  data: [
    {
      report: emptyReport,
      transactions: emptyTransactions,
    },
  ],
};

const _dataByYear: Record<number, AccountingReports> = {
  [new Date().getFullYear()]: {
    id: comingSoonId,
    latestReportId: 'coming-soon',
    profile,
    data: [
      {
        report: emptyReport,
        transactions: emptyTransactions,
      },
    ],
  },
};

export default data;

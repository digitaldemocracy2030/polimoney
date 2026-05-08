export type ElectionFinanceEntry = {
  id: string;
  latestReportId: string;
  href: string;
  profile: {
    name: string;
    title: string;
    image: string;
    party: string;
    district: string;
  };
};

export const electionFinanceEntries: ElectionFinanceEntry[] = [
  {
    id: 'election-finance-iwanaga',
    latestReportId: 'election-finance-iwanaga',
    href: '/election-finance/iwanaga',
    profile: {
      name: '岩永淳志',
      title: '和歌山県議会議員日高郡選挙区補欠選挙',
      image: '/demo-atsushiiwanaga.png',
      party: '無所属',
      district: '和歌山県日高郡',
    },
  },
];

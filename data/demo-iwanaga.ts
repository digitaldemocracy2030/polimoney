import type { AccountingReports, Profile } from '@/models/type';

const profile: Profile = {
  name: '岩永淳志',
  title: '',
  party: '',
  image: '/demo-example.png',
};

const demoIwanaga: AccountingReports = {
  id: 'iwanaga',
  latestReportId: '',
  profile,
  data: [],
};

export default demoIwanaga;

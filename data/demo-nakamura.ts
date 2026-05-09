import type { AccountingReports, Profile } from '@/models/type';

const profile: Profile = {
  name: '中村幸信',
  title: '',
  party: '',
  image: '/demo-example.png',
};

const demoNakamura: AccountingReports = {
  id: 'nakamura',
  latestReportId: '',
  profile,
  data: [],
};

export default demoNakamura;

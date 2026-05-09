import type { AccountingReports, Profile } from '@/models/type';

const profile: Profile = {
  name: '岩永淳志',
  title: '',
  party: '無所属',
  district: '和歌山県日高郡',
  image: '/demo-atsushiiwanaga.png',
};

const demoIwanaga: AccountingReports = {
  id: 'iwanaga',
  latestReportId: '',
  profile,
  data: [],
};

export default demoIwanaga;

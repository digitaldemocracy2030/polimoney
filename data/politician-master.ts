import type { ProfileList } from '@/models/type';
import demoExample from './demo-example';
import demoIwanaga from './demo-iwanaga';
import demoKokiFujisaki from './demo-kokifujisaki';
// import demoNakamura from './demo-nakamura'; // TODO: 中村幸信の再公開時に復帰
import demoRyosukeIdei from './demo-ryosukeidei';
import demoTakahiroAnno from './demo-takahiroanno';

export type PoliticianMasterEntry = {
  id: string;
  profile: ProfileList;
  /** 政治資金収支報告データの最新 report.id（data/politician-data のキーと対応） */
  politicalDataId?: string;
  /** 選挙運動収支報告データの ef-*.json name 部分 (例: 'iwanaga') */
  electionDataIds?: string[];
};

export const comingSoonId = 'demo-comingsoon';
export const comingSoonNum = 1;

const politicianEntries: PoliticianMasterEntry[] = [
  // TODO: 中村幸信のページを再度公開する際に以下を復帰する
  // {
  //   id: 'nakamura',
  //   profile: demoNakamura.profile,
  //   electionDataIds: ['nakamura'],
  // },
  {
    id: 'iwanaga',
    profile: demoIwanaga.profile,
    electionDataIds: ['iwanaga'],
  },
  {
    id: 'takahiro-anno',
    profile: demoTakahiroAnno.profile,
    politicalDataId: 'takahiro-anno',
  },
  {
    id: 'ryosuke-idei',
    profile: demoRyosukeIdei.profile,
    politicalDataId: 'ryosuke-idei',
  },
  {
    id: 'koki-fujisaki',
    profile: demoKokiFujisaki.profile,
    politicalDataId: 'koki-fujisaki',
  },
  {
    id: 'example',
    profile: demoExample.profile,
    politicalDataId: 'example',
  },
];

const comingSoonEntries: PoliticianMasterEntry[] = Array.from(
  { length: comingSoonNum },
  (_, i) => ({
    id: `${comingSoonId}-${i}`,
    profile: {
      name: 'Coming Soon...',
      title: '',
      party: '',
      image: '/demo-example.png',
    },
  }),
);

export const politicianMaster: PoliticianMasterEntry[] = [
  ...politicianEntries,
  ...comingSoonEntries,
];

export function findPolitician(id: string): PoliticianMasterEntry | undefined {
  return politicianMaster.find((e) => e.id === id);
}

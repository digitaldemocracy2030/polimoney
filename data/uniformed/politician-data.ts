/**
 * TODO: 廃止予定
 * Transaction / Flow 別データ版
 */
import exampleDefault, {
  getDataByYear as exampleGetDataByYear,
} from '@/data/uniformed/demo-example';
import kokifujisakiDefault, {
  getDataByYear as kokifujisakiGetDataByYear,
} from '@/data/uniformed/demo-kokifujisaki';
import ryosukeideiDefault, {
  getDataByYear as ryosukeideiGetDataByYear,
} from '@/data/uniformed/demo-ryosukeidei';
import takahiroannoDefault, {
  getDataByYear as takahiroannoGetDataByYear,
} from '@/data/uniformed/demo-takahiroanno';

export const politicianDataMap = {
  'takahiro-anno': {
    default: takahiroannoDefault,
    getDataByYear: takahiroannoGetDataByYear,
  },
  'ryosuke-idei': {
    default: ryosukeideiDefault,
    getDataByYear: ryosukeideiGetDataByYear,
  },
  'koki-fujisaki': {
    default: kokifujisakiDefault,
    getDataByYear: kokifujisakiGetDataByYear,
  },
  example: {
    default: exampleDefault,
    getDataByYear: exampleGetDataByYear,
  },
};

/**
 * Transaction / Flow 統一版
 */
import exampleDefaultUniformed, {
  getDataByYear as exampleGetDataByYearUniformed,
} from './demo-example';
import kokifujisakiDefaultUniformed, {
  getDataByYear as kokifujisakiGetDataByYearUniformed,
} from './demo-kokifujisaki';
import ryosukeideiDefaultUniformed, {
  getDataByYear as ryosukeideiGetDataByYearUniformed,
} from './demo-ryosukeidei';
import takahiroannoDefaultUniformed, {
  getDataByYear as takahiroannoGetDataByYearUniformed,
} from './demo-takahiroanno';

export const politicianDataMapUniformed = {
  'takahiro-anno': {
    default: takahiroannoDefaultUniformed,
    getDataByYear: takahiroannoGetDataByYearUniformed,
  },
  'ryosuke-idei': {
    default: ryosukeideiDefaultUniformed,
    getDataByYear: ryosukeideiGetDataByYearUniformed,
  },
  'koki-fujisaki': {
    default: kokifujisakiDefaultUniformed,
    getDataByYear: kokifujisakiGetDataByYearUniformed,
  },
  example: {
    default: exampleDefaultUniformed,
    getDataByYear: exampleGetDataByYearUniformed,
  },
};

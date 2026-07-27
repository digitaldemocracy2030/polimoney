import exampleDefault, {
  getDataByYear as exampleGetDataByYear,
} from './demo-example';
import kokifujisakiDefault, {
  getDataByYear as kokifujisakiGetDataByYear,
} from './demo-kokifujisaki';
import nakamuraDefault, {
  getDataByYear as nakamuraGetDataByYear,
} from './demo-nakamura';
import ryosukeideiDefault, {
  getDataByYear as ryosukeideiGetDataByYear,
} from './demo-ryosukeidei';
import takahiroannoDefault, {
  getDataByYear as takahiroannoGetDataByYear,
} from './demo-takahiroanno';

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
  nakamura: {
    default: nakamuraDefault,
    getDataByYear: nakamuraGetDataByYear,
  },
  example: {
    default: exampleDefault,
    getDataByYear: exampleGetDataByYear,
  },
};

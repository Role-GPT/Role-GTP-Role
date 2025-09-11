/**
 * 한국어 언어팩 통합
 */

import { common } from './common';
import { roles } from './roles';
import { categories } from './categories';
import { welcome } from './welcome';
import { projects } from './projects';
import { languages } from './languages';

export const ko = {
  ...common,
  ...roles,
  ...categories,
  ...welcome,
  ...projects,
  ...languages,
};

export type TranslationKeys = keyof typeof ko;

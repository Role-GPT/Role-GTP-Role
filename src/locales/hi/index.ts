/**
 * हिंदी भाषा पैकेज
 */

import { common } from './common';
import { languages } from './languages';
import { categories } from './categories';
import { roles } from './roles';
import { projects } from './projects';
import { welcome } from './welcome';

export const hi = {
  ...common,
  languages,
  categories,
  roles,
  projects,
  welcome,
} as const;

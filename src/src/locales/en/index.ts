/**
 * English Language Pack Integration
 */

import { common } from './common';
import { roles } from './roles';
import { categories } from './categories';
import { welcome } from './welcome';
import { projects } from './projects';
import { languages } from './languages';

export const en = {
  ...common,
  ...roles,
  ...categories,
  ...welcome,
  ...projects,
  ...languages,
};
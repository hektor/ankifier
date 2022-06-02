import { INLINE_DOLLAR_MATH_REGEXP, DISPLAY_DOLLAR_MATH_REGEXP } from '../constants'

/*
 * Math delimiters
 */

/*
 * Convert dollar math to latex math in a given string.
 * I.e. replace `$, $` and `$$, $$` delimiters by `\(, \)` and `\[, \]`
 */
export const dollarToLatexMath = (s: string): string =>
  s.replace(DISPLAY_DOLLAR_MATH_REGEXP, '\\[$1\\]').replace(INLINE_DOLLAR_MATH_REGEXP, '\\($1\\)')

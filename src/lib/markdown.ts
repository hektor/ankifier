import { INLINE_DOLLAR_MATH_REGEXP, DISPLAY_DOLLAR_MATH_REGEXP } from '../constants'

/*
 * Math delimiters
 */

export const dollarToLatexMath = (s: string): string =>
  s.replace(DISPLAY_DOLLAR_MATH_REGEXP, '\\[$1\\]').replace(INLINE_DOLLAR_MATH_REGEXP, '\\($1\\)')

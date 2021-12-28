/*
 * Obsidian regular expressions
 */

export const OBS_INLINE_MATH_REGEXP = /(?<!\$)\$((?=[\S])(?=[^$])[\s\S]*?\S)\$/g
export const OBS_DISPLAY_MATH_REGEXP = /\$\$([\s\S]*?)\$\$/g
export const OBS_CODE_REGEXP = /(?<!`)`(?=[^`])[\s\S]*?`/g
export const OBS_DISPLAY_CODE_REGEXP = /```[\s\S]*?```/g
export const OBS_TAG_REGEXP = /#(\w+)/g

/*
 * URLs
 */

export const CODE_CSS_URL = `https://cdn.jsdelivr.net/npm/highlightjs-themes@1.0.0/arta.css`

// https://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
// eslint-disable-next-line no-useless-escape
export const escapeRegex = (s: string): string => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')

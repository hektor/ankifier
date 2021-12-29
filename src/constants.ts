/*
 * Obsidian regular expressions
 */

export const INLINE_DOLLAR_MATH_REGEXP = /(?<!\$)\$((?=[\S])(?=[^$])[\s\S]*?\S)\$/g
export const DISPLAY_DOLLAR_MATH_REGEXP = /\$\$([\s\S]*?)\$\$/g
export const OBS_CODE_REGEXP = /(?<!`)`(?=[^`])[\s\S]*?`/g
export const OBS_DISPLAY_CODE_REGEXP = /```[\s\S]*?```/g
export const OBS_TAG_REGEXP = /#(\w+)/g

/*
 * Anki regular expressions
 */

export const ANKI_CLOZE_REGEXP = /{{c\d+::[\s\S]+?}}/

/*
 * URLs
 */

export const CODE_CSS_URL = `https://cdn.jsdelivr.net/npm/highlightjs-themes@1.0.0/arta.css`

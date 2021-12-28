export const OBS_INLINE_MATH_REGEXP: RegExp = /(?<!\$)\$((?=[\S])(?=[^$])[\s\S]*?\S)\$/g
export const OBS_DISPLAY_MATH_REGEXP: RegExp = /\$\$([\s\S]*?)\$\$/g
export const OBS_CODE_REGEXP:RegExp = /(?<!`)`(?=[^`])[\s\S]*?`/g
export const OBS_DISPLAY_CODE_REGEXP:RegExp = /```[\s\S]*?```/g

export const CODE_CSS_URL = `https://cdn.jsdelivr.net/npm/highlightjs-themes@1.0.0/arta.css`

export function escapeRegex(str: string): string {
    // Got from stackoverflow - https://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
    return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

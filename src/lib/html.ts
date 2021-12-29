/*
 * Constants
 */

export const PARA_OPEN = '<p>'
export const PARA_CLOSE = '</p>'

/*
 * Escape HTML special characters
 */

export const escapeHtml = (unsafe: string): string =>
  unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

/*
 * Wrap a given string in an inline HTML comment
 */

export const toInlineHTMLComment = (s: string): string => `<!--${s}-->`

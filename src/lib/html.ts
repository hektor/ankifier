/*
 * Wrap a given string in an inline HTML comment
 */

export const toInlineHTMLComment = (s: string): string => `<!--${s}-->`

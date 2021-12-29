// https://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
// eslint-disable-next-line no-useless-escape
export const escapeRegex = (s: string): string => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')

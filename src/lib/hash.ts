import { Md5 } from 'ts-md5/dist/md5'

// Generate hash from file contents, return hash string
// FIXME: extract `getHash`
export const getHash = (contents: string): string => Md5.hashStr(contents) as string

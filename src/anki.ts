import { AnkiConnectNote } from './interfaces/note-interface'

export interface Request {
  action: string
  version: 6
  params: object
}

export function invoke(action: string, params = {}) {
  const PORT = 8765
  const HOST = 'http://127.0.0.1'
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.addEventListener('error', () => reject('Failed to issue request'))
    xhr.addEventListener('load', () => {
      try {
        const response = JSON.parse(xhr.responseText)
        if (Object.getOwnPropertyNames(response).length != 2)
          throw 'Response has an unexpected number of fields'
        if (!response.hasOwnProperty('error')) throw 'Response is missing required error field'
        if (!response.hasOwnProperty('result')) throw 'Response is missing required result field'
        if (response.error) throw response.error
        resolve(response.result)
      } catch (e) {
        reject(e)
      }
    })

    xhr.open('POST', `${HOST}:${PORT}`)
    xhr.send(JSON.stringify({ action, version: 6, params }))
  })
}

/*
/* Helper function for parsing the result of a multi
 */

export function parse<T>(response: { error: string; result: T }): T {
  if (Object.getOwnPropertyNames(response).length != 2)
    throw 'response has an unexpected number of fields'
  if (!response.hasOwnProperty('error')) throw 'response is missing required error field'
  if (!response.hasOwnProperty('result')) throw 'response is missing required result field'
  if (response.error) throw response.error
  return response.result
}

/*
 * Request wrapper
 *
 * Versions the request
 * Set default for params
 *
 * Returns a request object
 */

const request = (action: string, params = {}): Request => ({
  action,
  version: 6,
  params,
})

/*
 * Request functions returning various request objects
 */

type Multi = (actions: Request[]) => Request
type Note = (note: AnkiConnectNote) => Request
type NoteFields = (note: { id: number; fields: Record<string, string> }) => Request
type Notes = (notes: number[]) => Request
type ChangeDeck = (cards: number[], deck: string) => Request
type Tags = (notes: number[], tags: string) => Request
type File = (filename: string, data: string) => Request
type FilePath = (filename: string, path: string) => Request

export const multi: Multi = (actions) => request('multi', { actions })
export const addNote: Note = (note) => request('addNote', { note })
export const deleteNotes: Notes = (notes) => request('deleteNotes', { notes })
export const updateNoteFields: NoteFields = (note) => request('updateNoteFields', { note })
export const notesInfo: Notes = (notes) => request('notesInfo', { notes })
export const changeDeck: ChangeDeck = (cards, deck) => request('changeDeck', { cards, deck })
export const removeTags: Tags = (notes, tags) => request('removeTags', { notes, tags })
export const addTags: Tags = (notes, tags) => request('addTags', { notes, tags })
export const getTags = (): Request => request('getTags')
export const storeMediaFile: File = (fn, data) => request('storeMediaFile', { fn, data })
export const storeMediaFileByPath: FilePath = (fn, path) => request('storeMediaFile', { fn, path })

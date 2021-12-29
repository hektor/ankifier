import { AnkiConnectNote } from './interfaces/note-interface'

export interface AnkiConnectRequest {
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

const request = (action: string, params = {}): AnkiConnectRequest => ({
  action,
  version: 6,
  params,
})

/*
 * Request functions returning various request objects
 */

export const multi = (actions: AnkiConnectRequest[]): AnkiConnectRequest =>
  request('multi', { actions })

export const addNote = (note: AnkiConnectNote): AnkiConnectRequest => request('addNote', { note })

export const deleteNotes = (notes: number[]): AnkiConnectRequest =>
  request('deleteNotes', { notes })

export const updateNoteFields = (id: number, fields: Record<string, string>): AnkiConnectRequest =>
  request('updateNoteFields', { note: { id, fields } })

export const notesInfo = (notes: number[]): AnkiConnectRequest => request('notesInfo', { notes })

export const changeDeck = (cards: number[], deck: string): AnkiConnectRequest =>
  request('changeDeck', { cards, deck })

export const removeTags = (notes: number[], tags: string): AnkiConnectRequest =>
  request('removeTags', { notes, tags })

export const addTags = (notes: number[], tags: string): AnkiConnectRequest =>
  request('addTags', { notes, tags })

export const getTags = (): AnkiConnectRequest => request('getTags')

export const storeMediaFile = (filename: string, data: string): AnkiConnectRequest =>
  request('storeMediaFile', { filename, data })

export const storeMediaFileByPath = (filename: string, path: string): AnkiConnectRequest =>
  request('storeMediaFile', { filename, path })

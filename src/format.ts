import { AnkiConnectNote } from './interfaces/note-interface'
import { basename, extname } from 'path'
import { Converter } from 'showdown'
import { CachedMetadata } from 'obsidian'
import { OBS_DISPLAY_CODE_REGEXP, OBS_CODE_REGEXP, CODE_CSS_URL } from './constants'
import { dollarToLatexMath } from './lib/markdown'
import { escapeRegex } from './lib/regex'
import { escapeHtml, PARA_OPEN, PARA_CLOSE } from './lib/html'

import showdownHighlight from 'showdown-highlight'

const ANKI_MATH_REGEXP = /(\\\[[\s\S]*?\\\])|(\\\([\s\S]*?\\\))/g
const HIGHLIGHT_REGEXP = /==(.*?)==/g

const MATH_REPLACE = 'OBSTOANKIMATH'
const INLINE_CODE_REPLACE = 'OBSTOANKICODEINLINE'
const DISPLAY_CODE_REPLACE = 'OBSTOANKICODEDISPLAY'

const CLOZE_REGEXP = /(?:(?<!{){(?:c?(\d+)[:|])?(?!{))((?:[^\n][\n]?)+?)(?:(?<!})}(?!}))/g

const IMAGE_EXTS: string[] = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.svg', '.tiff']
const AUDIO_EXTS: string[] = ['.wav', '.m4a', '.flac', '.mp3', '.wma', '.aac', '.webm']

let cloze_unset_num = 1

const converter: Converter = new Converter({
  simplifiedAutoLink: true,
  literalMidWordUnderscores: true,
  tables: true,
  tasklists: true,
  simpleLineBreaks: true,
  requireSpaceBeforeHeadingText: true,
  extensions: [showdownHighlight],
})

export class FormatConverter {
  file_cache: CachedMetadata
  vault_name: string
  detectedMedia: Set<string>

  constructor(file_cache: CachedMetadata, vault_name: string) {
    this.vault_name = vault_name
    this.file_cache = file_cache
    this.detectedMedia = new Set()
  }

  getUrlFromLink(link: string): string {
    return (
      'obsidian://open?vault=' +
      encodeURIComponent(this.vault_name) +
      String.raw`&file=` +
      encodeURIComponent(link)
    )
  }

  format_note_with_url(note: AnkiConnectNote, url: string, field: string): void {
    note.fields[field] += '<br><a href="' + url + '" class="obsidian-link">Obsidian</a>'
  }

  format_note_with_frozen_fields(
    note: AnkiConnectNote,
    frozen_fields_dict: Record<string, Record<string, string>>
  ): void {
    for (const field in note.fields) {
      note.fields[field] += frozen_fields_dict[note.modelName][field]
    }
  }

  cloze_repl(_1: string, match_id: string, match_content: string): string {
    if (match_id == undefined) {
      const result = '{{c' + cloze_unset_num.toString() + '::' + match_content + '}}'
      cloze_unset_num += 1
      return result
    }
    const result = '{{c' + match_id + '::' + match_content + '}}'
    return result
  }

  curly_to_cloze(text: string): string {
    /*Change text in curly brackets to Anki-formatted cloze.*/
    text = text.replace(CLOZE_REGEXP, this.cloze_repl)
    cloze_unset_num = 1
    return text
  }

  getAndFormatMedias(note_text: string): string {
    if (!this.file_cache.hasOwnProperty('embeds')) {
      return note_text
    }
    for (const embed of this.file_cache.embeds) {
      if (note_text.includes(embed.original)) {
        this.detectedMedia.add(embed.link)
        if (AUDIO_EXTS.includes(extname(embed.link))) {
          note_text = note_text.replace(
            new RegExp(escapeRegex(embed.original), 'g'),
            '[sound:' + basename(embed.link) + ']'
          )
        } else if (IMAGE_EXTS.includes(extname(embed.link))) {
          note_text = note_text.replace(
            new RegExp(escapeRegex(embed.original), 'g'),
            '<img src="' + basename(embed.link) + '" alt="' + embed.displayText + '">'
          )
        } else {
          console.warn('Unsupported extension: ', extname(embed.link))
        }
      }
    }
    return note_text
  }

  formatLinks(note_text: string): string {
    if (!this.file_cache.hasOwnProperty('links')) {
      return note_text
    }
    for (const link of this.file_cache.links) {
      note_text = note_text.replace(
        new RegExp(escapeRegex(link.original), 'g'),
        '<a href="' + this.getUrlFromLink(link.link) + '">' + link.displayText + '</a>'
      )
    }
    return note_text
  }

  censor(note_text: string, regexp: RegExp, mask: string): [string, string[]] {
    /*Take note_text and replace every match of regexp with mask, simultaneously adding it to a string array*/
    const matches: string[] = []
    for (const match of note_text.matchAll(regexp)) {
      matches.push(match[0])
    }
    return [note_text.replace(regexp, mask), matches]
  }

  decensor(note_text: string, mask: string, replacements: string[], escape: boolean): string {
    for (const replacement of replacements) {
      note_text = note_text.replace(mask, escape ? escapeHtml(replacement) : replacement)
    }
    return note_text
  }

  format(note_text: string, cloze: boolean, highlights_to_cloze: boolean): string {
    note_text = dollarToLatexMath(note_text)
    //Extract the parts that are anki math
    let math_matches: string[]
    let inline_code_matches: string[]
    let display_code_matches: string[]
    const add_highlight_css: boolean = note_text.match(OBS_DISPLAY_CODE_REGEXP) ? true : false
    ;[note_text, math_matches] = this.censor(note_text, ANKI_MATH_REGEXP, MATH_REPLACE)
    ;[note_text, display_code_matches] = this.censor(
      note_text,
      OBS_DISPLAY_CODE_REGEXP,
      DISPLAY_CODE_REPLACE
    )
    ;[note_text, inline_code_matches] = this.censor(note_text, OBS_CODE_REGEXP, INLINE_CODE_REPLACE)
    if (cloze) {
      if (highlights_to_cloze) {
        note_text = note_text.replace(HIGHLIGHT_REGEXP, '{$1}')
      }
      note_text = this.curly_to_cloze(note_text)
    }
    note_text = this.getAndFormatMedias(note_text)
    note_text = this.formatLinks(note_text)
    //Special for formatting highlights now, but want to avoid any == in code
    note_text = note_text.replace(HIGHLIGHT_REGEXP, String.raw`<mark>$1</mark>`)
    note_text = this.decensor(note_text, DISPLAY_CODE_REPLACE, display_code_matches, false)
    note_text = this.decensor(note_text, INLINE_CODE_REPLACE, inline_code_matches, false)
    note_text = converter.makeHtml(note_text)
    note_text = this.decensor(note_text, MATH_REPLACE, math_matches, true).trim()
    // Remove unnecessary paragraph tag
    if (note_text.startsWith(PARA_OPEN) && note_text.endsWith(PARA_CLOSE)) {
      note_text = note_text.slice(PARA_OPEN.length, -1 * PARA_CLOSE.length)
    }
    if (add_highlight_css) {
      note_text = '<link href="' + CODE_CSS_URL + '" rel="stylesheet">' + note_text
    }
    return note_text
  }
}

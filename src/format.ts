import { AnkiConnectNote } from './interfaces/note-interface'
import { basename, extname } from 'path'
import { CachedMetadata } from 'obsidian'
import { OBS_DISPLAY_CODE_REGEXP, OBS_CODE_REGEXP, CODE_CSS_URL } from './constants'
import { dollarToLatexMath } from './lib/markdown'
import { escapeRegex } from './lib/regex'
import { escapeHtml, PARA_OPEN, PARA_CLOSE } from './lib/html'

import { Converter } from 'showdown'
import showdownHighlight from 'showdown-highlight'

const ANKI_MATH_REGEXP = /(\\\[[\s\S]*?\\\])|(\\\([\s\S]*?\\\))/g
const HIGHLIGHT_REGEXP = /==(.*?)==/g

// Used to (temporarily) replace corresponding regexp match by specified mask
const MATH_MASK = 'MATH_MASK'
const INLINE_CODE_MASK = 'INLINE_CODE_MASK'
const DISPLAY_CODE_MASK = 'DISPLAY_CODE_MASK'

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
  extensions: [showdownHighlight({ pre: true })],
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
    note.fields[field] += `<br><a href="${url}" class="ankifier">View</a>`
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
      cloze_unset_num += 1
      return `{{c${cloze_unset_num.toString()}::${match_content}}}`
    }
    return `{{c${match_id}::${match_content}}}`
  }

  curly_to_cloze(text: string): string {
    /*Change text in curly brackets to Anki-formatted cloze.*/
    text = text.replace(CLOZE_REGEXP, this.cloze_repl)
    cloze_unset_num = 1
    return text
  }

  getAndFormatMedias(text: string): string {
    if (!this.file_cache.hasOwnProperty('embeds')) {
      return text
    }
    for (const embed of this.file_cache.embeds) {
      if (text.includes(embed.original)) {
        this.detectedMedia.add(embed.link)
        if (AUDIO_EXTS.includes(extname(embed.link))) {
          text = text.replace(
            new RegExp(escapeRegex(embed.original), 'g'),
            `[sound:${basename(embed.link)}]`
          )
        } else if (IMAGE_EXTS.includes(extname(embed.link))) {
          text = text.replace(
            new RegExp(escapeRegex(embed.original), 'g'),
            embed.displayText
              ? `<img src="${basename(embed.link)}" alt="${embed.displayText}">`
              : `<img src="${basename(embed.link)}">`
          )
        } else {
          console.warn('Unsupported extension: ', extname(embed.link))
        }
      }
    }
    return text
  }

  formatLinks(text: string): string {
    if (!this.file_cache.hasOwnProperty('links')) {
      return text
    }
    for (const link of this.file_cache.links) {
      text = text.replace(
        new RegExp(escapeRegex(link.original), 'g'),
        `<a href="${this.getUrlFromLink(link.link)}">${link.displayText}</a>`
      )
    }
    return text
  }

  // Replace every match of regexp in `text` with mask
  // Save matches to array
  censor(text: string, regexp: RegExp, mask: string): [string, string[]] {
    const textOfMatches = [...text.matchAll(regexp)].map((arr) => arr[0])
    return [text.replace(regexp, mask), textOfMatches]
  }

  // Replace occurences of `mask` in `text` with corresponding replacement
  decensor(text: string, mask: string, replacements: string[], escape: boolean): string {
    for (const replacement of replacements) {
      text = text.replace(mask, escape ? escapeHtml(replacement) : replacement)
    }
    return text
  }

  // TODO: Convert this to remarked+rehype and use abstract syntax tree to
  // instead of regexp.

  format(text: string, cloze: boolean, highlights_to_cloze: boolean): string {
    // Dollar math syntax to Anki's LaTeX math syntax
    text = dollarToLatexMath(text)

    // Initialize arrays for saving text that gets masked
    let math_matches: string[]
    let inline_code_matches: string[]
    let display_code_matches: string[]

    // Flag if syntax highlighting is necessary
    const add_highlight_css: boolean = text.match(OBS_DISPLAY_CODE_REGEXP) ? true : false

    // Replace text with masked text and save matches to corresponding arrays
    ;[text, math_matches] = this.censor(text, ANKI_MATH_REGEXP, MATH_MASK)
    ;[text, display_code_matches] = this.censor(text, OBS_DISPLAY_CODE_REGEXP, DISPLAY_CODE_MASK)
    ;[text, inline_code_matches] = this.censor(text, OBS_CODE_REGEXP, INLINE_CODE_MASK)

    if (cloze) {
      if (highlights_to_cloze) {
        text = text.replace(HIGHLIGHT_REGEXP, '{$1}')
      }
      text = this.curly_to_cloze(text)
    }

    text = this.getAndFormatMedias(text)
    text = this.formatLinks(text)
    //Special for formatting highlights now, but want to avoid any == in code
    text = text.replace(HIGHLIGHT_REGEXP, String.raw`<mark>$1</mark>`)
    text = this.decensor(text, DISPLAY_CODE_MASK, display_code_matches, false)
    text = this.decensor(text, INLINE_CODE_MASK, inline_code_matches, false)
    console.log(`text:`)
    console.log(text)
    text = converter.makeHtml(text)
    text = this.decensor(text, MATH_MASK, math_matches, true).trim()

    // Remove unnecessary paragraph tag
    if (text.startsWith(PARA_OPEN) && text.endsWith(PARA_CLOSE)) {
      text = text.slice(PARA_OPEN.length, -1 * PARA_CLOSE.length)
    }

    // Prepend text with highlight stylesheet if note requires syntax highlighting
    if (add_highlight_css) text = `<link href="${CODE_CSS_URL}" rel="stylesheet">${text}`

    return text
  }
}

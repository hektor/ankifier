import { PluginSettings, ParsedSettings } from './interfaces/settings-interface'
import { App } from 'obsidian'
import * as AnkiConnect from './anki'
import { ID_REGEXP_STR } from './note'
import { escapeRegex } from './lib/regex'

export async function settingToData(
  app: App,
  settings: PluginSettings,
  fields_dict: Record<string, string[]>
): Promise<ParsedSettings> {
  const result: ParsedSettings = <ParsedSettings>{}

  const { Syntax, Defaults } = settings

  //Some processing required
  result.vault_name = app.vault.getName()
  result.fields_dict = fields_dict
  result.custom_regexps = settings.CUSTOM_REGEXPS
  result.file_link_fields = settings.FILE_LINK_FIELDS
  result.context_fields = settings.CONTEXT_FIELDS
  result.folder_decks = settings.FOLDER_DECKS
  result.folder_tags = settings.FOLDER_TAGS
  result.template = {
    deckName: Defaults.Deck,
    modelName: '',
    fields: {},
    options: {
      allowDuplicate: false,
      duplicateScope: 'deck',
    },
    tags: [Defaults.Tag],
  }

  // Get all note IDs from Anki
  result.EXISTING_IDS = (await AnkiConnect.invoke('findNotes', {
    query: '',
  })) as number[]

  //RegExp section
  result.FROZEN_REGEXP = new RegExp(
    escapeRegex(Syntax['Frozen Fields Line']) + String.raw` - (.*?):\n((?:[^\n][\n]?)+)`,
    'g'
  )
  result.DECK_REGEXP = new RegExp(
    String.raw`^` + escapeRegex(Syntax['Target Deck Line']) + String.raw`(?:\n|: )(.*)`,
    'm'
  )
  result.TAG_REGEXP = new RegExp(
    String.raw`^` + escapeRegex(Syntax['File Tags Line']) + String.raw`(?:\n|: )(.*)`,
    'm'
  )
  result.NOTE_REGEXP = new RegExp(
    String.raw`^` +
      escapeRegex(Syntax['Begin Note']) +
      String.raw`\n([\s\S]*?\n)` +
      escapeRegex(Syntax['End Note']),
    'gm'
  )
  result.INLINE_REGEXP = new RegExp(
    escapeRegex(Syntax['Begin Inline Note']) +
      String.raw`(.*?)` +
      escapeRegex(Syntax['End Inline Note']),
    'g'
  )
  result.EMPTY_REGEXP = new RegExp(escapeRegex(Syntax['Delete Note Line']) + ID_REGEXP_STR, 'g')

  //Just a simple transfer
  result.curly_cloze = Defaults.CurlyCloze
  result.highlights_to_cloze = Defaults['CurlyCloze - Highlights to Clozes']
  result.add_file_link = Defaults['Add File Link']
  result.comment = Defaults['ID Comments']
  result.add_context = Defaults['Add Context']
  result.add_obs_tags = Defaults['Add Obsidian Tags']

  return result
}

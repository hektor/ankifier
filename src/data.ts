interface Descriptions {
  [description: string]: string;
}

export const descriptions: Descriptions = {
	"Tag": "The tag that the plugin automatically adds to any generated cards.",
	"Deck": "The deck the plugin adds cards to if TARGET DECK is not specified in the file.",
	"Scheduling Interval": "The time, in minutes, between automatic scans of the vault. Set this to 0 to disable automatic scanning.",
	"Add File Link": "Append a link to the file that generated the flashcard on the field specified in the table.",
	"Add Context": "Append 'context' for the card, in the form of path > heading > heading etc, to the field specified in the table.",
	"CurlyCloze": "Convert {cloze deletions} -> {{c1::cloze deletions}} on note types that have a 'Cloze' in their name.",
	"CurlyCloze - Highlights to Clozes": "Convert ==highlights== -> {highlights} to be processed by CurlyCloze.",
	"ID Comments": "Wrap note IDs in a HTML comment.",
	"Add Obsidian Tags": "Interpret #tags in the fields of a note as Anki tags, removing them from the note text in Anki."
}


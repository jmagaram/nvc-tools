import type { Format, Note, Picked } from '../src/components/PickedEntries.tsx'

/**
 * The fence language each layout is written as, and the two a person might type
 * by hand. The layout lives in the language rather than in an argument after it
 * because Obsidian hands a code block processor the block's body and nothing
 * else — the info string never reaches it — so one registration per language is
 * what makes the layout knowable without reading the note back.
 *
 * `nvc-list` is the name the default layout was written under before it was
 * called `gloss`, and it is kept for exactly one reason: every block this
 * plugin has ever written carries it. Dropping the registration would leave
 * each of them drawn as a grey code block. The bodies are unchanged — a note
 * bullet is an addition to the grammar, not a change to it — so an old block
 * reads as a new one. Nothing is ever written under this name again.
 */
export const languages: Record<string, Format> = {
  nvc: 'gloss',
  'nvc-list': 'gloss',
  'nvc-gloss': 'gloss',
  'nvc-column': 'column',
  'nvc-sentence': 'sentence',
  'nvc-inline': 'inline',
  'nvc-table': 'table',
}

/** The language a block gets written as when it is drawn this way. */
export function languageFor(format: Format): string {
  return `nvc-${format}`
}

/**
 * Needs-not-met first, then needs-met, and everything else left where it is —
 * the whole of how the split is written down, on the page and here. It was two
 * headings and they were a line of chrome each to say what the category names
 * already say. A word with no kind sorts with the first group and keeps its
 * place, which is what needs want and what an unresolved block wants.
 */
function inSplitOrder(entries: readonly Picked[]): Picked[] {
  return [...entries].sort(
    (a, b) => (a.kind === 'met' ? 1 : 0) - (b.kind === 'met' ? 1 : 0),
  )
}

/**
 * A note as it is stored: one line, always.
 *
 * The box someone writes in wraps, and text pasted into it may arrive with
 * newlines, so the collapse happens on the way out rather than being left to
 * the keyboard. One line is what lets a note be a bullet — nothing else in the
 * grammar has to hold a line break, and a note that did would need a
 * continuation rule in every reader.
 */
export function oneLine(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

/** The notes on `entry`, in the order its words are listed. */
function notesOf(entry: Picked): readonly Note[] {
  return entry.notes ?? []
}

/**
 * What goes into the note: one bullet per category, words joined inline, and an
 * indented bullet under it for each word that carries a note.
 *
 * The category is kept because the walk is what gave it meaning — 'incensed'
 * on its own has lost the question it answered. Categories that were walked
 * without picking anything never reach here; `chosen` has already dropped them,
 * and it has already dropped notes on words that ended up unpicked.
 */
export function toMarkdown(entries: readonly Picked[]): string {
  return entries
    .flatMap((entry) => [
      `- ${entry.category}: ${entry.words.join(', ')}`,
      ...notesOf(entry).map((note) => `  - ${note.word}: ${oneLine(note.text)}`),
    ])
    .join('\n')
}

/**
 * The same bullets, fenced so the plugin can redraw them.
 *
 * The body is the markdown above and nothing more: with the plugin off, or the
 * note read anywhere but Obsidian, what shows is still the list someone wrote,
 * and it can be edited by hand. Empty in, empty out — an empty block would be a
 * worse answer than none.
 */
export function toBlock(entries: readonly Picked[]): string {
  const body = toMarkdown(entries)
  return body ? `\`\`\`${languageFor('gloss')}\n${body}\n\`\`\`` : ''
}

/** A cell's text, with the one character that would split it in two escaped. */
function cell(text: string): string {
  return text.replace(/\|/g, '\\|')
}

/**
 * Whether this set knows which side of the split it is on. Needs are one
 * undivided list and carry no kind; so does anything read back from a block
 * whose words did not resolve, which is the honest answer there rather than a
 * guess.
 */
function isSplit(entries: readonly Picked[]): boolean {
  return entries.some((entry) => entry.kind)
}

/**
 * The same picks as ordinary markdown, in the layout they are being drawn in —
 * what a block turns into when someone converts it and takes the text back.
 *
 * Built from the parsed entries and never from what is on screen: the commas
 * between words are drawn by CSS, and an empty note cell and a missing one look
 * identical in the DOM.
 *
 * Bold on a category is the only emphasis that survives the trip. Everything
 * else a layout does — the label column, the muted notes, the hairlines — is
 * gone, so each of these is written to read on its own rather than to look like
 * the view it came from.
 */
export function toPlainMarkdown(
  entries: readonly Picked[],
  format: Format,
): string {
  if (format === 'inline') {
    return entries.flatMap((entry) => entry.words).join(', ')
  }

  if (format === 'sentence') {
    /* Not met first, and no headings: the category names carry the sense of the
       line, and a heading over one sentence is heavier than the sentence. Which
       side is which is deliberately not written down here — see the view. */
    const order = isSplit(entries)
      ? [
          entries.filter((e) => e.kind !== 'met'),
          entries.filter((e) => e.kind === 'met'),
        ]
      : [entries]
    return order
      .filter((group) => group.length > 0)
      .map((group) => {
        const said = group
          .map((entry) => `**${entry.category}**: ${entry.words.join(', ')}.`)
          .join(' ')
        const notes = group.reduce((sum, e) => sum + notesOf(e).length, 0)
        return notes > 0
          ? `${said} *${notes} ${notes === 1 ? 'note' : 'notes'}*`
          : said
      })
      .join('\n\n')
  }

  const noted = entries.some((entry) => notesOf(entry).length > 0)
  // One block, one table, one list. The met/unmet split is carried by the order
  // and by nothing else — there are no headings to write any more.
  return body(inSplitOrder(entries), format, noted)
}

/** One side's worth of a layout that has sides. */
function body(
  entries: readonly Picked[],
  format: Format,
  noted: boolean,
): string {
  if (format === 'table') {
    /* A row per word with the category repeated, because a pipe table has
       neither a row span nor an indent — and because repeating it is what makes
       the result a grid someone can add a column to, which is most of the
       reason to convert a block at all. */
    const head = noted
      ? ['| Category | Word | Note |', '| --- | --- | --- |']
      : ['| Category | Word |', '| --- | --- |']
    const rows = entries.flatMap((entry) => {
      const written = new Map(notesOf(entry).map((n) => [n.word, n.text]))
      return entry.words.map((word) => {
        const cells = [cell(entry.category), cell(word)]
        if (noted) cells.push(cell(oneLine(written.get(word) ?? '')))
        return `| ${cells.join(' | ')} |`
      })
    })
    return [...head, ...rows].join('\n')
  }

  if (format === 'column') {
    // One bullet per word whether or not it carries a note, which is the whole
    // of what this layout says.
    return entries
      .flatMap((entry) => {
        const written = new Map(notesOf(entry).map((n) => [n.word, n.text]))
        return [
          `- **${entry.category}**`,
          ...entry.words.map((word) => {
            const note = written.get(word)
            return note
              ? `  - ${word}: ${oneLine(note)}`
              : `  - ${word}`
          }),
        ]
      })
      .join('\n')
  }

  // gloss: the stored shape, with the category bolded.
  return entries
    .flatMap((entry) => [
      `- **${entry.category}**: ${entry.words.join(', ')}`,
      ...notesOf(entry).map((note) => `  - ${note.word}: ${oneLine(note.text)}`),
    ])
    .join('\n')
}

/** How far into the line the text starts, counting a tab as four. */
function indentOf(line: string): number {
  const lead = /^[ \t]*/.exec(line)![0]
  return lead.replace(/\t/g, '    ').length
}

/**
 * `toMarkdown` backwards, for a block that is about to be drawn.
 *
 * Tolerant of what a person types and strict about what is written back. A note
 * split over several indented lines is read and joined with a space, because
 * somebody hand-editing the block has no reason to know that a note is supposed
 * to be one line; the next save puts it back as one.
 *
 * Null when any line fails to make sense, rather than a partial result: a block
 * someone has typed into is shown to them verbatim instead of half-swallowed.
 * That includes a blockquote — the category-level note the format leaves room
 * for is not something this plugin writes or reads yet, and quietly dropping a
 * line somebody wrote would be the worst of the three answers.
 */
export function parseBlock(source: string): Picked[] | null {
  const lines = source.split('\n').filter((line) => line.trim())
  if (lines.length === 0) return null

  const entries: Picked[] = []
  let base: number | null = null
  let notes: { word: string; text: string }[] = []
  let open: { word: string; text: string } | null = null
  let noteIndent = 0

  const bullet = /^[ \t]*-[ \t]+([^:]+):(.*)$/

  for (const line of lines) {
    const indent = indentOf(line)
    const match = bullet.exec(line)

    if (match && (base === null || indent <= base)) {
      // A category, and the first one fixes what counts as the outer level.
      if (base === null) base = indent
      if (entries.length > 0) entries[entries.length - 1].notes = notes
      notes = []
      open = null
      entries.push({
        category: match[1].trim(),
        words: match[2]
          .split(',')
          .map((word) => word.trim())
          .filter(Boolean),
      })
      continue
    }

    // Anything indented before a category has nothing to belong to.
    if (entries.length === 0) return null

    if (match) {
      open = { word: match[1].trim(), text: match[2].trim() }
      noteIndent = indent
      notes.push(open)
      continue
    }

    // A line that is not a bullet continues the note above it, if it is
    // indented past that note and there is one to continue.
    if (open && indent > noteIndent) {
      open.text = `${open.text} ${line.trim()}`.trim()
      continue
    }

    return null
  }

  if (entries.length > 0) entries[entries.length - 1].notes = notes
  return entries
}

import type { Format, Picked } from '../src/components/PickedEntries.tsx'

/**
 * The fence language each layout is written as, and the plain `nvc` a person
 * might type by hand, read as the default. The layout lives in the language
 * rather than in an argument after it because Obsidian hands a code block
 * processor the block's body and nothing else — the info string never reaches
 * it — so one registration per language is what makes the layout knowable
 * without reading the note back.
 */
export const languages: Record<string, Format> = {
  nvc: 'list',
  'nvc-list': 'list',
  'nvc-table': 'table',
  'nvc-inline': 'inline',
}

/** The language a block gets written as when it is drawn this way. */
export function languageFor(format: Format): string {
  return `nvc-${format}`
}

/**
 * What goes into the note: one bullet per category, words joined inline.
 *
 * The category is kept because the walk is what gave it meaning — 'incensed'
 * on its own has lost the question it answered. Categories that were walked
 * without picking anything never reach here; `chosen` has already dropped them.
 */
export function toMarkdown(entries: readonly Picked[]): string {
  return entries
    .map((entry) => `- ${entry.category}: ${entry.words.join(', ')}`)
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
  return body ? `\`\`\`${languageFor('list')}\n${body}\n\`\`\`` : ''
}

/** A cell's text, with the one character that would split it in two escaped. */
function cell(text: string): string {
  return text.replace(/\|/g, '\\|')
}

/**
 * The same picks as ordinary markdown, in the layout they are being drawn in —
 * what a block turns into when someone converts it and takes the text back.
 *
 * The table is one row per category, exactly what the block on screen shows:
 * converting should hand over what you were already looking at, not a second
 * arrangement of it. Cells are left unpadded because Obsidian's table editor
 * reflows them on the first edit, and hand-aligned columns go stale the moment
 * anyone types in one.
 */
export function toPlainMarkdown(
  entries: readonly Picked[],
  format: Format,
): string {
  if (format === 'table') {
    return [
      '| Category | Words |',
      '| --- | --- |',
      ...entries.map(
        (entry) => `| ${cell(entry.category)} | ${cell(entry.words.join(', '))} |`,
      ),
    ].join('\n')
  }

  if (format === 'inline') {
    return entries.flatMap((entry) => entry.words).join(', ')
  }

  return toMarkdown(entries)
}

/**
 * `toMarkdown` backwards, for a block that is about to be drawn.
 *
 * Null when any line fails to parse, rather than a partial result: a block
 * someone has typed into is shown to them verbatim instead of half-swallowed.
 */
export function parseBlock(source: string): Picked[] | null {
  const lines = source.split('\n').filter((line) => line.trim())
  if (lines.length === 0) return null

  const entries: Picked[] = []
  for (const line of lines) {
    const match = /^\s*-\s+([^:]+):(.*)$/.exec(line)
    if (!match) return null
    entries.push({
      category: match[1].trim(),
      words: match[2]
        .split(',')
        .map((word) => word.trim())
        .filter(Boolean),
    })
  }
  return entries
}

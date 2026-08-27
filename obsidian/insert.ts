/**
 * A category and what was picked in it. Both pickers report this shape —
 * `feelingPicker.Visited` carries a `kind` as well, which the markdown drops,
 * so one function serves both.
 */
type Picked = {
  category: string
  words: readonly string[]
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

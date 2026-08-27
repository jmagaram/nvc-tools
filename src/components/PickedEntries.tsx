import styles from './PickedEntries.module.css'

/**
 * A category and what was picked in it. Both pickers report this shape —
 * `feelingPicker.Visited` carries a `kind` as well, which nothing here reads,
 * so one type serves feelings and needs alike.
 */
export type Picked = {
  category: string
  words: readonly string[]
}

/** The three ways the same picks can be laid out. */
export type Format = 'list' | 'table' | 'inline'

type Props = {
  /** The categories picked in, in the order they were walked. */
  entries: readonly Picked[]
  /**
   * Which layout to draw. A plain union rather than a union of prop shapes:
   * all three read the same `entries`, so there is no contradiction to rule
   * out.
   */
  format: Format
}

/**
 * What was picked, drawn one of three ways.
 *
 * The category is kept in two of them because the walk is what gave a word its
 * meaning — 'incensed' on its own has lost the question it answered. `inline`
 * drops it on purpose: that one is for pasting into a sentence you are already
 * writing, where the categories would only get in the way.
 */
export default function PickedEntries({ entries, format }: Props) {
  if (format === 'table') {
    return (
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Category</th>
            <th>Words</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.category}>
              <td>{entry.category}</td>
              <td>{entry.words.join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  if (format === 'inline') {
    return (
      <p className={styles.inline}>
        {entries.flatMap((entry) => entry.words).join(', ')}
      </p>
    )
  }

  return (
    <ul className={styles.list}>
      {entries.map((entry) => (
        <li key={entry.category}>
          <span className={styles.category}>{entry.category}</span>:{' '}
          {entry.words.join(', ')}
        </li>
      ))}
    </ul>
  )
}

import type { ReactNode } from 'react'
import styles from './NeedCard.module.css'

type Props = {
  /** The need itself, e.g. 'empathy'. */
  word: string
  /** The category the need belongs to, e.g. 'Connection'. */
  category: string
  /** A short plain-language gloss of the need. */
  definition: string
  /**
   * The line about a note on this word, drawn under the definition. What
   * belongs to the word belongs in the card: a walk throws the card off the
   * side when it is answered, and anything about the word left outside it is
   * left sitting there while the word flies away.
   *
   * A slot rather than the note itself, because the line has a second job the
   * card knows nothing about — offering to write one — and only a walk has
   * anything to offer.
   */
  note?: ReactNode
}

export default function NeedCard({ word, category, definition, note }: Props) {
  return (
    <div className={styles.card}>
      <p className={styles.category}>{category}</p>
      <h3 className={styles.word}>{word}</h3>
      <p className={styles.definition}>{definition}</p>
      {note !== undefined && <div className={styles.note}>{note}</div>}
    </div>
  )
}

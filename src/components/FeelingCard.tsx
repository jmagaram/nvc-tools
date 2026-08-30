import type { ReactNode } from 'react'
import styles from './FeelingCard.module.css'

type Props = {
  /** The feeling itself, e.g. 'fascinated'. */
  word: string
  /** The category the feeling belongs to, e.g. 'Engaged'. */
  category: string
  /** A short plain-language gloss of the feeling. */
  definition: string
  /** Whether the feeling signals needs met or needs unmet. */
  kind: 'met' | 'unmet'
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

export default function FeelingCard({
  word,
  category,
  definition,
  kind,
  note,
}: Props) {
  return (
    <div className={`${styles.card} ${styles[kind]}`}>
      <p className={styles.category}>{category}</p>
      <h3 className={styles.word}>{word}</h3>
      <p className={styles.definition}>{definition}</p>
      {note !== undefined && <div className={styles.note}>{note}</div>}
    </div>
  )
}

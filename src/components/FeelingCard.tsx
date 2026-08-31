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
      {/* The definition and the note share one floor, for the reason the sift
          gives: apart, a one-line definition left its spare line empty between
          the two, and the note was clamped small beside it. Together the height
          is the same on every card in a walk whatever is written on it, so the
          progress rule and the two answers under it do not move from one
          question to the next — which matters more here than anywhere, because
          answering is a click in the same place twenty-eight times. */}
      <div className={styles.body}>
        <p className={styles.definition}>{definition}</p>
        {note !== undefined && <div className={styles.note}>{note}</div>}
      </div>
    </div>
  )
}

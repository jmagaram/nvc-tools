import styles from './NeedCard.module.css'

type Props = {
  /** The need itself, e.g. 'empathy'. */
  word: string
  /** The category the need belongs to, e.g. 'Connection'. */
  category: string
  /** A short plain-language gloss of the need. */
  definition: string
}

export default function NeedCard({ word, category, definition }: Props) {
  return (
    <div className={styles.card}>
      <p className={styles.category}>{category}</p>
      <h3 className={styles.word}>{word}</h3>
      <p className={styles.definition}>{definition}</p>
    </div>
  )
}

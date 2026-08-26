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
}

const KIND_LABEL: Record<Props['kind'], string> = {
  met: 'needs met',
  unmet: 'needs unmet',
}

export default function FeelingCard({
  word,
  category,
  definition,
  kind,
}: Props) {
  return (
    <div className={`${styles.card} ${styles[kind]}`}>
      <p className={styles.category}>{category}</p>
      <h3 className={styles.word}>{word}</h3>
      <p className={styles.kind}>{KIND_LABEL[kind]}</p>
      <p className={styles.definition}>{definition}</p>
    </div>
  )
}

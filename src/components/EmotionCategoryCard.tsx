import styles from './EmotionCategoryCard.module.css'

type Props = {
  /** The feeling category, e.g. 'Engaged'. */
  category: string
  /** Which side of the NVC split this category sits on. */
  kind: 'met' | 'unmet'
  /** The specific feelings picked within this category. May be empty. */
  emotions: string[]
  /** Shown in place of the feelings when `emotions` is empty. */
  emptyText: string
  /** Called when the card is activated, to reopen this category. */
  onClick: () => void
}

export default function EmotionCategoryCard({
  category,
  kind,
  emotions,
  emptyText,
  onClick,
}: Props) {
  return (
    <div className={`${styles.card} ${styles[kind]}`}>
      <h3 className={styles.category}>
        <button type="button" className={styles.button} onClick={onClick}>
          {category}
        </button>
      </h3>
      {emotions.length > 0 ? (
        <ul className={styles.emotions}>
          {emotions.map((emotion) => (
            <li key={emotion}>{emotion}</li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>{emptyText}</p>
      )}
    </div>
  )
}

import styles from './FeelingCategoryCard.module.css'

type Props = {
  /** The feeling category, e.g. 'Engaged'. */
  category: string
  /** Which side of the NVC split this category sits on. */
  kind: 'met' | 'unmet'
  /** The specific feelings picked within this category. May be empty. */
  feelings: string[]
  /** Shown in place of the feelings when `feelings` is empty. */
  emptyText: string
  /** Called when the card is activated, to reopen this category. */
  onClick: () => void
}

export default function FeelingCategoryCard({
  category,
  kind,
  feelings,
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
      {feelings.length > 0 ? (
        <ul className={styles.feelings}>
          {feelings.map((feeling) => (
            <li key={feeling}>{feeling}</li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>{emptyText}</p>
      )}
    </div>
  )
}

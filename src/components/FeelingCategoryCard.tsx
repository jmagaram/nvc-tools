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
  /**
   * Whether a browse screen coming back into view resumes here — the category
   * just walked. Marks the button with `data-browse` for a host to find; see
   * useFocusScreen. At most one card on screen carries it.
   */
  resume: boolean
  /** Called when the card is activated, to reopen this category. */
  onClick: () => void
}

export default function FeelingCategoryCard({
  category,
  kind,
  feelings,
  emptyText,
  onClick,
  resume,
}: Props) {
  return (
    <div className={`${styles.card} ${styles[kind]}`}>
      <h3 className={styles.category}>
        <button
          type="button"
          className={styles.button}
          data-browse={resume ? '' : undefined}
          onClick={onClick}
        >
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

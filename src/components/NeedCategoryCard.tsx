import styles from './NeedCategoryCard.module.css'

type Props = {
  /** The need category, e.g. 'Autonomy'. */
  category: string
  /** The specific needs picked within this category. May be empty. */
  needs: string[]
  /** Shown in place of the needs when `needs` is empty. */
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

export default function NeedCategoryCard({
  category,
  needs,
  emptyText,
  onClick,
  resume,
}: Props) {
  return (
    <div className={styles.card}>
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
      {needs.length > 0 ? (
        <ul className={styles.needs}>
          {needs.map((need) => (
            <li key={need}>{need}</li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>{emptyText}</p>
      )}
    </div>
  )
}

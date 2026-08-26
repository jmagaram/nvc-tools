import styles from './NeedCategoryCard.module.css'

type Props = {
  /** The need category, e.g. 'Autonomy'. */
  category: string
  /** The specific needs picked within this category. May be empty. */
  needs: string[]
  /** Shown in place of the needs when `needs` is empty. */
  emptyText: string
  /** Called when the card is activated, to reopen this category. */
  onClick: () => void
}

export default function NeedCategoryCard({
  category,
  needs,
  emptyText,
  onClick,
}: Props) {
  return (
    <div className={styles.card}>
      <h3 className={styles.category}>
        <button type="button" className={styles.button} onClick={onClick}>
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

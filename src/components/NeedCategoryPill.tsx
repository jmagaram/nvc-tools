import styles from './NeedCategoryPill.module.css'

type Props = {
  /** The need category, e.g. 'Autonomy'. */
  category: string
  /** Called when the pill is activated, to open this category. */
  onClick: () => void
}

/**
 * A category with nothing picked from it yet, small enough that every category
 * fits on screen at once. Once someone has picked needs from a category, it has
 * words to show, and `NeedCategoryCard` is the shape for that.
 */
export default function NeedCategoryPill({ category, onClick }: Props) {
  return (
    <button type="button" className={styles.pill} onClick={onClick}>
      {category}
    </button>
  )
}

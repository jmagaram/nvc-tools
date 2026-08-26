import styles from './EmotionCategoryPill.module.css'

type Props = {
  /** The feeling category, e.g. 'Engaged'. */
  category: string
  /** Which side of the NVC split this category sits on. */
  kind: 'met' | 'unmet'
  /** Called when the pill is activated, to open this category. */
  onClick: () => void
}

/**
 * A category with nothing picked from it yet, small enough that every category
 * fits on screen at once. Once someone has picked feelings from a category, it
 * has words to show, and `EmotionCategoryCard` is the shape for that.
 */
export default function EmotionCategoryPill({
  category,
  kind,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      className={`${styles.pill} ${styles[kind]}`}
      onClick={onClick}
    >
      {category}
    </button>
  )
}

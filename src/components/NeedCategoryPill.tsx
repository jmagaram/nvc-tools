import { usePressDelay } from '../usePressDelay.ts'
import styles from './pill.module.css'

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
  const { pressed, onClick: press } = usePressDelay(onClick)
  return (
    <button
      type="button"
      className={styles.pill}
      data-pressed={pressed ? '' : undefined}
      onClick={press}
    >
      {category}
    </button>
  )
}

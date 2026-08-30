import { usePressDelay } from '../usePressDelay.ts'
import styles from './pill.module.css'

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
 * has words to show, and `FeelingCategoryCard` is the shape for that.
 */
export default function FeelingCategoryPill({
  category,
  kind,
  onClick,
}: Props) {
  const { pressed, onClick: press } = usePressDelay(onClick)
  return (
    <button
      type="button"
      className={`${styles.pill} ${styles[kind]}`}
      data-pressed={pressed ? '' : undefined}
      onClick={press}
    >
      {category}
    </button>
  )
}

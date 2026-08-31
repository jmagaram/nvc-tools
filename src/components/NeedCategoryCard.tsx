import { usePressDelay } from '../usePressDelay.ts'
import NoteMark from './NoteMark.tsx'
import type { Noted } from './NoteMark.tsx'
import styles from './NeedCategoryCard.module.css'

type Props = {
  /** The need category, e.g. 'Autonomy'. */
  category: string
  /**
   * The specific needs picked within this category, and what is written about
   * any of them. May be empty. One list rather than the words and the notes
   * side by side: a note belongs to a word, and two lists could disagree about
   * which.
   */
  needs: readonly Noted[]
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
  const { pressed, onClick: press } = usePressDelay(onClick)
  return (
    <div className={styles.card} data-pressed={pressed ? '' : undefined}>
      <h3 className={styles.category}>
        <button
          type="button"
          className={styles.button}
          data-browse={resume ? '' : undefined}
          onClick={press}
        >
          {category}
        </button>
      </h3>
      {needs.length > 0 ? (
        <ul className={styles.needs}>
          {needs.map((need) => (
            <li key={need.word}>
              {need.word}
              {need.note !== undefined && <NoteMark placement="inline" />}
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>{emptyText}</p>
      )}
    </div>
  )
}

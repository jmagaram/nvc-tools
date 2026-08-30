import { usePressDelay } from '../usePressDelay.ts'
import NoteMark from './NoteMark.tsx'
import type { Noted } from './NoteMark.tsx'
import styles from './FeelingCategoryCard.module.css'

type Props = {
  /** The feeling category, e.g. 'Engaged'. */
  category: string
  /** Which side of the NVC split this category sits on. */
  kind: 'met' | 'unmet'
  /**
   * The specific feelings picked within this category, and what is written about
   * any of them. May be empty. One list rather than the words and the notes
   * side by side: a note belongs to a word, and two lists could disagree about
   * which.
   */
  feelings: readonly Noted[]
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
  const { pressed, onClick: press } = usePressDelay(onClick)
  return (
    <div
      className={`${styles.card} ${styles[kind]}`}
      data-pressed={pressed ? '' : undefined}
    >
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
      {feelings.length > 0 ? (
        <ul className={styles.feelings}>
          {feelings.map((feeling) => (
            <li key={feeling.word}>
              {feeling.word}
              {feeling.note !== undefined && <NoteMark />}
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>{emptyText}</p>
      )}
    </div>
  )
}

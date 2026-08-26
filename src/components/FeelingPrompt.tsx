import type { KeyboardEvent } from 'react'
import FeelingCard from './FeelingCard.tsx'
import StepProgress from './StepProgress.tsx'
import styles from './FeelingPrompt.module.css'

type Props = {
  /** The feeling on the card right now, e.g. 'enchanted'. */
  word: string
  /** The category being walked through, e.g. 'Engaged'. */
  category: string
  /** A short plain-language gloss of the feeling. */
  definition: string
  /** Whether the category signals needs met or needs unmet. */
  kind: 'met' | 'unmet'
  /** Zero-based position of this feeling within the category. */
  index: number
  /** How many feelings the category holds. */
  total: number
  /** Accept this feeling and move on. */
  onAccept: () => void
  /** Reject this feeling and move on. */
  onReject: () => void
}

export default function FeelingPrompt({
  word,
  category,
  definition,
  kind,
  index,
  total,
  onAccept,
  onReject,
}: Props) {
  // Swipe keys, borrowed from the dating apps: right takes the feeling, left
  // passes on it. The whole prompt is one focusable region so the keys work
  // wherever focus sits inside it — on either button after a click, or on the
  // region itself after a Tab. Whether it takes focus the moment it appears is
  // the host's call, the same as the way out of a walk.
  const answerOnArrow = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      onAccept()
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      onReject()
    }
  }

  return (
    <div
      className={styles.prompt}
      tabIndex={0}
      role="group"
      aria-label={`Do you feel ${word}? Right arrow for yes, left arrow for no`}
      onKeyDown={answerOnArrow}
    >
      <StepProgress
        total={total}
        current={index}
        label={`Feelings in ${category}`}
      />

      {/* The card sits alone in the stage so a later swipe animation has a
          single element to move, and a fixed height so the card does not jump
          between a short and a long definition. */}
      <div className={styles.stage}>
        <FeelingCard
          word={word}
          category={category}
          definition={definition}
          kind={kind}
        />
      </div>

      {/* The walk only runs forwards: answering is the only way to move. Each
          button sits on the side its arrow key points to. */}
      <div className={styles.actions}>
        <button type="button" onClick={onReject}>
          <span aria-hidden="true">←</span> Not this
        </button>
        <button type="button" onClick={onAccept}>
          Yes, I feel this <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  )
}

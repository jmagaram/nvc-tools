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
  return (
    <div className={styles.picker}>
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

      {/* The walk only runs forwards: answering is the only way to move. */}
      <div className={styles.actions}>
        <button type="button" onClick={onReject}>
          Not this
        </button>
        <button type="button" onClick={onAccept}>
          Yes, I feel this
        </button>
      </div>
    </div>
  )
}

import styles from './StepProgress.module.css'

/** What was said to a step already answered. */
export type StepMark = 'chosen' | 'skipped'

type Props = {
  /** What was said to each step already answered, oldest first. */
  past: readonly StepMark[]
  /** How many steps come after the one on screen. */
  upcoming: number
  /** Names the sequence to assistive tech, e.g. 'Feelings in Engaged'. */
  label: string
}

type Status = StepMark | 'current' | 'upcoming'

export default function StepProgress({ past, upcoming, label }: Props) {
  // The cursor is wherever the past runs out, so it cannot fall off the bar.
  const statuses: Status[] = [
    ...past,
    'current',
    ...Array.from({ length: upcoming }, (): Status => 'upcoming'),
  ]
  const kept = past.filter((mark) => mark === 'chosen').length

  /* One element, not a list. The segments are a picture of a number, so they
     are `aria-hidden` decoration and the number is spoken instead — a walk of
     twenty would otherwise announce twenty list items on every card. */
  return (
    <div
      className={styles.rule}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={statuses.length}
      aria-valuenow={past.length}
      aria-label={`${label}, ${past.length + 1} of ${statuses.length}, ${kept} kept`}
    >
      {statuses.map((status, index) => (
        <span
          key={index}
          className={`${styles.step} ${styles[status]}`}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

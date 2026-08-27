import styles from './StepProgress.module.css'

/** What was said to a step already answered. */
export type StepMark = 'chosen' | 'skipped'

type Props = {
  /** What was said to each step already answered, oldest first. */
  past: readonly StepMark[]
  /** How many steps come after the one on screen. */
  upcoming: number
  /** Describes the sequence to assistive tech, e.g. 'Feelings in Engaged'. */
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

  return (
    <ol className={styles.steps} aria-label={label}>
      {statuses.map((status, index) => (
        <li
          key={index}
          className={styles[status]}
          aria-current={status === 'current' ? 'step' : undefined}
        />
      ))}
    </ol>
  )
}

import styles from './StepProgress.module.css'

type Props = {
  /** How many steps there are in all. */
  total: number
  /** Zero-based position of the cursor. */
  current: number
  /** Describes the sequence to assistive tech, e.g. 'Feelings in Engaged'. */
  label: string
}

type Status = 'done' | 'current' | 'upcoming'

function statusOf(index: number, current: number): Status {
  if (index < current) return 'done'
  if (index === current) return 'current'
  return 'upcoming'
}

export default function StepProgress({ total, current, label }: Props) {
  return (
    <ol className={styles.steps} aria-label={label}>
      {Array.from({ length: total }, (_, index) => (
        <li
          key={index}
          className={styles[statusOf(index, current)]}
          aria-current={index === current ? 'step' : undefined}
        />
      ))}
    </ol>
  )
}

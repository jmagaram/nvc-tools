import { useState } from 'react'
import StepProgress from '../components/StepProgress.tsx'
import type { StepMark } from '../components/StepProgress.tsx'

const TOTALS = [5, 8, 12, 25]

/* Stand-in answer histories, so the bar can be seen counting picks back. */
const PATTERNS = [
  { name: 'none', keeps: () => false },
  { name: 'every third', keeps: (index: number) => index % 3 === 0 },
  { name: 'every other', keeps: (index: number) => index % 2 === 0 },
  { name: 'all', keeps: () => true },
]

export default function StepProgressDemo() {
  const [total, setTotal] = useState(12)
  const [current, setCurrent] = useState(3)
  const [pattern, setPattern] = useState(PATTERNS[1].name)

  // Keep the cursor inside the bar when the total shrinks under it.
  const clamped = Math.min(current, total - 1)
  const positions = Array.from({ length: total }, (_, index) => index)

  const keeps = (PATTERNS.find((it) => it.name === pattern) ?? PATTERNS[0]).keeps
  const pastOf = (upTo: number): StepMark[] =>
    Array.from({ length: upTo }, (_, index) =>
      keeps(index) ? 'chosen' : 'skipped',
    )

  return (
    <>
      <label>
        Total steps{' '}
        <select
          value={total}
          onChange={(e) => setTotal(Number(e.target.value))}
        >
          {TOTALS.map((count) => (
            <option key={count} value={count}>
              {count}
            </option>
          ))}
        </select>
      </label>
      <label>
        Current step{' '}
        <select
          value={clamped}
          onChange={(e) => setCurrent(Number(e.target.value))}
        >
          {positions.map((position) => (
            <option key={position} value={position}>
              {position}
            </option>
          ))}
        </select>
      </label>
      <label>
        Kept so far{' '}
        <select value={pattern} onChange={(e) => setPattern(e.target.value)}>
          {PATTERNS.map((it) => (
            <option key={it.name} value={it.name}>
              {it.name}
            </option>
          ))}
        </select>
      </label>
      <hr />
      <StepProgress
        past={pastOf(clamped)}
        upcoming={total - clamped - 1}
        label="Demo progress"
      />

      <h2>Edges</h2>
      <p>First step</p>
      <StepProgress past={[]} upcoming={total - 1} label="At the first step" />
      <p>Last step</p>
      <StepProgress
        past={pastOf(total - 1)}
        upcoming={0}
        label="At the last step"
      />
    </>
  )
}

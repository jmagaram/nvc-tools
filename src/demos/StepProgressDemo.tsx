import { useState } from 'react'
import StepProgress from '../components/StepProgress.tsx'

const TOTALS = [5, 8, 12, 25]

export default function StepProgressDemo() {
  const [total, setTotal] = useState(12)
  const [current, setCurrent] = useState(3)

  // Keep the cursor inside the bar when the total shrinks under it.
  const clamped = Math.min(current, total - 1)
  const positions = Array.from({ length: total }, (_, index) => index)

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
      <hr />
      <StepProgress total={total} current={clamped} label="Demo progress" />

      <h2>Edges</h2>
      <p>First step</p>
      <StepProgress total={total} current={0} label="At the first step" />
      <p>Last step</p>
      <StepProgress
        total={total}
        current={total - 1}
        label="At the last step"
      />
    </>
  )
}

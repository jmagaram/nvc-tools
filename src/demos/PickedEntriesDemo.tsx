import { useState } from 'react'
import PickedEntries from '../components/PickedEntries.tsx'
import type { Format, Picked } from '../components/PickedEntries.tsx'

/* Every layout on the page at once, under its own heading — the point of the
   component is that these are three views of the same picks, and a dropdown
   would only let you see one of them at a time. */
const FORMATS: { format: Format; heading: string }[] = [
  { format: 'list', heading: 'List' },
  { format: 'table', heading: 'Table' },
  { format: 'inline', heading: 'Comma separated' },
]

const ENTRIES: Picked[] = [
  { category: 'Angry', words: ['incensed', 'furious', 'resentful'] },
  { category: 'Peaceful', words: ['calm', 'centred'] },
  { category: 'Tired', words: ['exhausted'] },
]

export default function PickedEntriesDemo() {
  const [count, setCount] = useState(3)

  return (
    <>
      <label>
        Categories{' '}
        <select
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
        >
          {[0, 1, 2, 3].map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <hr />
      {FORMATS.map(({ format, heading }) => (
        <div key={format}>
          <h2>{heading}</h2>
          <PickedEntries entries={ENTRIES.slice(0, count)} format={format} />
        </div>
      ))}
    </>
  )
}

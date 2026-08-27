import { useState } from 'react'
import FeelingCategoryCard from '../components/FeelingCategoryCard.tsx'
import { useFocusScreen } from '../focusScreen.ts'

type Sample = {
  category: string
  kind: 'met' | 'unmet'
  feelings: string[]
}

const CATEGORIES: Sample[] = [
  {
    category: 'Engaged',
    kind: 'met',
    feelings: [
      'curious',
      'absorbed',
      'alert',
      'ardent',
      'aroused',
      'astonished',
      'dazzled',
      'eager',
      'enchanted',
      'engrossed',
      'entranced',
      'fascinated',
    ],
  },
  {
    category: 'Angry',
    kind: 'unmet',
    feelings: [
      'enraged',
      'furious',
      'incensed',
      'indignant',
      'irate',
      'livid',
      'outraged',
      'resentful',
      'agitated',
      'bitter',
      'cross',
      'exasperated',
    ],
  },
]

const COUNTS = [12, 3, 0]

export default function FeelingCategoryCardDemo() {
  const [counts, setCounts] = useState([12, 3])
  const [clicks, setClicks] = useState([0, 0])
  // One card at most, the way a picker uses it — so a select, not a checkbox
  // apiece, which could put the mark on both.
  const [resume, setResume] = useState('')

  // What `resume` is for, done the way a picker does it: the browse screen
  // coming back into view puts focus on the category just left. Without this
  // the prop marks a button no one looks for and nothing on the page moves.
  const bodyRef = useFocusScreen(`browse:${resume}`)

  const setAt = (
    values: number[],
    index: number,
    value: number,
  ): number[] => values.map((v, i) => (i === index ? value : v))

  return (
    <>
      {CATEGORIES.map((sample, index) => (
        <label key={sample.category}>
          {sample.category}{' '}
          <select
            value={counts[index]}
            onChange={(e) =>
              setCounts(setAt(counts, index, Number(e.target.value)))
            }
          >
            {COUNTS.map((count) => (
              <option key={count} value={count}>
                {count} chosen
              </option>
            ))}
          </select>
        </label>
      ))}
      <label>
        Resumes at{' '}
        <select value={resume} onChange={(e) => setResume(e.target.value)}>
          <option value="">nothing</option>
          {CATEGORIES.map((sample) => (
            <option key={sample.category} value={sample.category}>
              {sample.category}
            </option>
          ))}
        </select>
      </label>
      <hr />
      <p>
        Resuming moves the focus ring, and nothing else: the card marks its
        heading with <code>data-browse</code> and a host's{' '}
        <code>useFocusScreen</code> looks for it. In a picker that is how coming
        back from a category lands on the one just left, rather than on nothing
        with the arrow keys dead.
      </p>
      <div ref={bodyRef}>
        {CATEGORIES.map((sample, index) => (
          <div key={sample.category}>
            <FeelingCategoryCard
              category={sample.category}
              kind={sample.kind}
              feelings={sample.feelings.slice(0, counts[index])}
              emptyText="no specific feelings chosen"
              resume={sample.category === resume}
              onClick={() => setClicks(setAt(clicks, index, clicks[index] + 1))}
            />
            <p>Clicked {clicks[index]} times</p>
          </div>
        ))}
      </div>
    </>
  )
}

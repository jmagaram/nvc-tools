import { useState } from 'react'
import FeelingCategoryCard from '../components/FeelingCategoryCard.tsx'

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
      <hr />
      {CATEGORIES.map((sample, index) => (
        <div key={sample.category}>
          <FeelingCategoryCard
            category={sample.category}
            kind={sample.kind}
            feelings={sample.feelings.slice(0, counts[index])}
            emptyText="no specific feelings chosen"
            onClick={() => setClicks(setAt(clicks, index, clicks[index] + 1))}
          />
          <p>Clicked {clicks[index]} times</p>
        </div>
      ))}
    </>
  )
}

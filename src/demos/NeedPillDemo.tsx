import { useState } from 'react'
import NeedPill from '../components/NeedPill.tsx'
import { categories } from '../data/needs.ts'
import styles from './NeedPillDemo.module.css'

/* One category's worth of words to lay out in a row, and a fixed handful of
   them marked. Fixed rather than random so the page looks the same twice: what
   is being shown is the two states side by side, not which words they landed
   on. Connection is the longest category and holds the longest phrases. */
const SAMPLE = categories.find((category) => category.name === 'Connection')!

const MARKED = new Set([
  'acceptance',
  'closeness',
  'empathy',
  'to know and be known',
])

/* A note only ever sits on a marked word, so these are a subset of the above.
   The badge is the only thing that says one is there — the note itself shows
   on the one word a screen is about. */
const NOTED = new Set(['empathy'])

export default function NeedPillDemo() {
  const [word, setWord] = useState('companionship')
  const [clicks, setClicks] = useState(0)
  const [shows, setShows] = useState(0)

  return (
    <>
      <label>
        Word <input value={word} onChange={(e) => setWord(e.target.value)} />
      </label>
      <hr />
      {/* Both states of the same word, side by side, rather than a control to
          flip one between them: the difference between them is the thing worth
          looking at, and a checkbox shows only one at a time. */}
      <div className={styles.row}>
        {[false, true].map((marked) => (
          <NeedPill
            key={String(marked)}
            word={word}
            marked={marked}
            noted={false}
            resume={false}
            onClick={() => setClicks(clicks + 1)}
            onShow={() => setShows(shows + 1)}
          />
        ))}
      </div>
      <p>
        Unmarked and marked. Clicked {clicks} times, shown {shows} times.
      </p>
      <hr />

      {/* What a row of them looks like — the shape the sift lays a category out
          in. Display only: the marks do not move, and marking and unmarking is
          what the Need Category Sift page is for. */}
      <p>
        {SAMPLE.name}, some of it marked. A wash of the text colour and a
        heavier border say so, and neither changes the pill's width, so marking
        a word cannot shuffle the row under the finger that tapped it.
      </p>
      <div className={styles.row}>
        {SAMPLE.needs.map((need) => (
          <NeedPill
            key={need.word}
            word={need.word}
            marked={MARKED.has(need.word)}
            noted={NOTED.has(need.word)}
            resume={false}
            onClick={() => {}}
            onShow={() => {}}
          />
        ))}
      </div>
    </>
  )
}

import { useState } from 'react'
import FeelingPill from '../components/FeelingPill.tsx'
import { categories } from '../data/feelings.ts'
import styles from './FeelingPillDemo.module.css'

const KINDS: ('met' | 'unmet')[] = ['met', 'unmet']

/* One category's worth of words to lay out in a row, and a fixed handful of
   them marked. Fixed rather than random so the page looks the same twice: what
   is being shown is the two states side by side, not which words they landed
   on. Disquiet is the longest category and holds the longest word. */
const SAMPLE = categories.find((category) => category.name === 'Disquiet')!

const MARKED = new Set(['agitated', 'discombobulated', 'startled', 'unnerved'])

/* A note only ever sits on a marked word, so these are a subset of the above.
   The badge is the only thing that says one is there — the note itself shows
   on the one word a screen is about. */
const NOTED = new Set(['agitated', 'startled'])

export default function FeelingPillDemo() {
  const [word, setWord] = useState('fascinated')
  const [kind, setKind] = useState<'met' | 'unmet'>('met')
  const [clicks, setClicks] = useState(0)
  const [shows, setShows] = useState(0)

  return (
    <>
      <label>
        Word <input value={word} onChange={(e) => setWord(e.target.value)} />
      </label>
      <label>
        Kind{' '}
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as 'met' | 'unmet')}
        >
          {KINDS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <hr />
      {/* Both states of the same word, side by side, rather than a control to
          flip one between them: the difference between them is the thing worth
          looking at, and a checkbox shows only one at a time. */}
      <div className={styles.row}>
        {[false, true].map((marked) => (
          <FeelingPill
            key={String(marked)}
            word={word}
            kind={kind}
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
          what the Feeling Category Sift page is for. */}
      <p>
        {SAMPLE.name}, some of it marked. A wash of the text colour and a
        heavier border say so, and neither changes the pill's width, so marking
        a word cannot shuffle the row under the finger that tapped it. Two of
        them carry a note, which the pencil says — the one thing here that does
        cost width, and only ever on a word that was already marked.
      </p>
      <div className={styles.row}>
        {SAMPLE.feelings.map((feeling) => (
          <FeelingPill
            key={feeling.word}
            word={feeling.word}
            kind={SAMPLE.kind}
            marked={MARKED.has(feeling.word)}
            noted={NOTED.has(feeling.word)}
            resume={false}
            onClick={() => {}}
            onShow={() => {}}
          />
        ))}
      </div>
    </>
  )
}

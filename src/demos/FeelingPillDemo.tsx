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

/* The three a pill can be. There is no fourth: a note cannot sit on a word
   that is not picked. */
const STATES = [
  { label: 'unmarked', marked: false, noted: false },
  { label: 'marked', marked: true, noted: false },
  { label: 'marked with a note', marked: true, noted: true },
]

export default function FeelingPillDemo() {
  const [word, setWord] = useState('fascinated')
  const [kind, setKind] = useState<'met' | 'unmet'>('met')
  const [clicks, setClicks] = useState(0)
  const [shows, setShows] = useState(0)
  const [notes, setNotes] = useState(0)

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
      {/* Every state of the same word, side by side, rather than a control to
          flip one between them: the difference between them is the thing worth
          looking at, and a checkbox shows only one at a time.

          Three, not four. A note cannot outlive the mark under it, so there is
          no unmarked word with one — the missing fourth pill is the shape of
          that rule, and worth the gap it leaves in the row. */}
      <div className={styles.row}>
        {STATES.map((state) => (
          <FeelingPill
            key={state.label}
            word={word}
            kind={kind}
            marked={state.marked}
            noted={state.noted}
            resume={false}
            onClick={() => setClicks(clicks + 1)}
            onNote={() => setNotes(notes + 1)}
            onShow={() => setShows(shows + 1)}
          />
        ))}
      </div>
      <p>
        {STATES.map((state) => state.label).join(', ')}. Clicked {clicks} times,
        shown {shows} times, pencil clicked {notes} times.
      </p>
      <p>
        The pencil is its own target for a mouse: clicking it opens the note,
        where clicking the word marks or unmarks. Only for a mouse — a thumb
        would miss a glyph that small more often than it hit it, and a miss
        unmarks the word, which takes the note with it.
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
            onNote={() => {}}
            onShow={() => {}}
          />
        ))}
      </div>
    </>
  )
}

import { useId, useState } from 'react'
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
  /* Nothing here draws a definition strip, and no specimen is anchored, so the
     pill never actually renders this — it is gated on `anchored`. It is still a
     real id rather than a made-up string, because a description that pointed at
     nothing would be the kind of thing a sheet like this exists to catch. */
  const glossId = useId()
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

          Three, not four. A note is kept when a word is unmarked, so that an
          unmark is undoable — but it is never *drawn* on an unmarked word,
          there being nothing on screen for it to belong to. So the fourth pill
          would be identical to the first, and the gap where it is not is the
          shape of that rule. */}
      {/* A row of word pills is a listbox wherever it appears, so the specimens
          say so too: `role="option"` outside one is not valid markup, and a
          sheet that shows a component in invalid surroundings is not showing
          the component. */}
      <div
        className={styles.row}
        role="listbox"
        aria-multiselectable="true"
        aria-label="Every state of one word"
      >
        {STATES.map((state, index) => (
          <FeelingPill
            key={state.label}
            word={word}
            kind={kind}
            marked={state.marked}
            noted={state.noted}
            tabbable={index === 0}
            anchored={false}
            describedBy={glossId}
            onClick={() => setClicks(clicks + 1)}
            onNote={() => setNotes(notes + 1)}
            onAnchor={() => setShows(shows + 1)}
            onPreview={() => setShows(shows + 1)}
          />
        ))}
      </div>
      <p>
        {STATES.map((state) => state.label).join(', ')}. Clicked {clicks} times,
        shown {shows} times, pencil clicked {notes} times.
      </p>
      <p>
        The pencil is its own target for a mouse: clicking it opens the note,
        where clicking the word marks or unmarks. It appears on any marked word,
        quietly, while the pointer or the focus ring is on it — and stays at
        full strength once there is something to read. It hangs off the corner
        out of flow, so it costs the pill no width and a row cannot reflow under
        the pointer crossing it. Only for a mouse: a thumb would miss a glyph
        that small more often than it hit it, and a miss unmarks the word.
      </p>
      <hr />

      {/* What a row of them looks like — the shape the sift lays a category out
          in. Display only: the marks do not move, and marking and unmarking is
          what the Feeling Category Sift page is for. */}
      <p>
        {SAMPLE.name}, some of it marked. A wash of the text colour and a
        heavier border say so, and neither changes the pill's width, so marking
        a word cannot shuffle the row under the finger that tapped it. Two of
        them carry a note, which the pencil says — drawn over the corner rather
        than in the row, so it costs no width either.
      </p>
      <div
        className={styles.row}
        role="listbox"
        aria-multiselectable="true"
        aria-label={`${SAMPLE.name}, some of it marked`}
      >
        {SAMPLE.feelings.map((feeling, index) => (
          <FeelingPill
            key={feeling.word}
            word={feeling.word}
            kind={SAMPLE.kind}
            marked={MARKED.has(feeling.word)}
            noted={NOTED.has(feeling.word)}
            tabbable={index === 0}
            anchored={false}
            describedBy={glossId}
            onClick={() => {}}
            onNote={() => {}}
            onAnchor={() => {}}
            onPreview={() => {}}
          />
        ))}
      </div>
    </>
  )
}

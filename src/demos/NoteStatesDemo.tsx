import { useState } from 'react'
import type { ReactNode } from 'react'
import FeelingCategorySift from '../components/FeelingCategorySift.tsx'
import FeelingPrompt from '../components/FeelingPrompt.tsx'
import { categories } from '../data/feelings.ts'
import type { FeelingCategory } from '../data/feelings.ts'
import { init, reduce } from '../machines/feelingCategorySift.ts'
import type { FeelingCategorySiftState } from '../machines/feelingCategorySift.ts'
import styles from './NoteStatesDemo.module.css'

/**
 * Every state a note can be in, on one page, side by side.
 *
 * The other demo pages each drive one component and let you walk it into a
 * state. This one does the opposite: it puts the states next to each other and
 * lets you change what is *in* them, which is the only way to see whether a
 * long note and an empty one still look like the same design, or whether the
 * grid's one line and the card's three disagree about what a note is.
 *
 * The specimens are deliberately inert — `onAction` and the answer handlers go
 * nowhere. A sheet you can click is a sheet that drifts out of the arrangement
 * you came to look at, and by the third specimen you no longer know which of
 * them you have disturbed. Everything here changes from the three controls at
 * the top, together, or not at all.
 *
 * Feelings only. The need components are the same components with the other
 * inventory behind them, and drawing both would halve how much of the sheet
 * fits on a screen at once.
 */

/** The category the specimens sift, with the configured word standing in. */
function categoryWith(word: string, definition: string): FeelingCategory {
  /* A real category rather than an invented one, so the grid around the word
     has the shape and the wording of the real thing — a specimen sheet is only
     worth looking at if what surrounds the specimen is honest. The configured
     word goes first, so it is the one the eye lands on.

     Anything the category already had under that word comes out. Typing a word
     the category holds — and `irate` is in this one, so the page opens on that
     case — otherwise put it in the grid twice, both wearing the mark and the
     pencil, which reads as a rendering fault rather than as the specimen. */
  const source =
    categories.find((category) => category.name === 'Angry') ?? categories[0]
  return {
    ...source,
    feelings: [
      { word, definition },
      ...source.feelings.filter((feeling) => feeling.word !== word),
    ],
  }
}

/** A sift showing `word`, marked or not, with or without a note on it. */
function siftState(
  category: FeelingCategory,
  word: string,
  note: string | null,
  marked: boolean,
): FeelingCategorySiftState {
  const seeded = init(
    category,
    marked ? [word] : [],
    note === null ? [] : [{ word, text: note }],
  )
  /* `init` leaves nothing showing, and the note line lives under the gloss
     strip — so without this the specimens would all be the empty strip. */
  return reduce(seeded, { type: 'show', word })
}

/** The same, with the drawer open over it. */
function notingState(
  category: FeelingCategory,
  word: string,
  note: string | null,
): FeelingCategorySiftState {
  return reduce(siftState(category, word, note, true), { type: 'note', word })
}

type SpecimenProps = {
  /** What this specimen is, in the fewest words that tell it from its neighbours. */
  label: string
  /** What the label does not say: why this state is worth a frame of its own. */
  note?: string
  children: ReactNode
}

function Specimen({ label, note, children }: SpecimenProps) {
  return (
    <figure className={styles.specimen}>
      <figcaption className={styles.label}>
        {label}
        {note !== undefined && <span className={styles.why}>{note}</span>}
      </figcaption>
      {/* Held to something near a modal's width, because almost everything the
          note line does — ellipsising, hugging, wrapping — only happens once
          the width runs out. At the page's full width every specimen looks
          fine and the sheet says nothing. */}
      <div className={styles.frame}>{children}</div>
    </figure>
  )
}

const WORD = 'irate'
const DEFINITION = 'Angry to the point of losing your composure.'
const NOTE = 'wow, this one lands\nnot at him, at the meeting itself'

export default function NoteStatesDemo() {
  const [word, setWord] = useState(WORD)
  const [definition, setDefinition] = useState(DEFINITION)
  const [note, setNote] = useState(NOTE)

  const category = categoryWith(word, definition)
  const written = note === '' ? null : note

  /* Every answer handler goes nowhere: see the note on the component above. */
  const inert = {
    onNote: () => {},
    onDraft: () => {},
    onKeepNote: () => {},
    onDropNote: () => {},
    onAccept: () => {},
    onReject: () => {},
  }
  const walk = {
    category: category.name,
    kind: category.kind,
    past: ['chosen', 'skipped', 'chosen'] as const,
    upcoming: 4,
  }

  return (
    <>
      <label>
        Word
        <input value={word} onChange={(event) => setWord(event.target.value)} />
      </label>

      <label>
        Definition
        <input
          value={definition}
          onChange={(event) => setDefinition(event.target.value)}
        />
      </label>

      <label>
        Note
        <textarea
          rows={3}
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </label>

      <p className={styles.how}>
        Nothing on the sheet answers a click — change the three above and every
        specimen changes together. An empty note box is the state with no note
        written; newlines in it are the note&rsquo;s own lines.
      </p>

      <hr />

      <div className={styles.sheet}>
        <Specimen
          label="Grid · unmarked"
          note="no line at all — a note belongs to a picked word"
        >
          <FeelingCategorySift
            state={siftState(category, word, null, false)}
            onAction={() => {}}
          />
        </Specimen>

        <Specimen label="Grid · marked, nothing written" note="the offer">
          <FeelingCategorySift
            state={siftState(category, word, null, true)}
            onAction={() => {}}
          />
        </Specimen>

        <Specimen label="Grid · with a note" note="one line, the rest counted">
          <FeelingCategorySift
            state={siftState(category, word, written, true)}
            onAction={() => {}}
          />
        </Specimen>

        <Specimen label="Grid · drawer, empty box" note="writing a first note">
          <FeelingCategorySift
            state={notingState(category, word, null)}
            onAction={() => {}}
          />
        </Specimen>

        <Specimen label="Grid · drawer, note in the box" note="editing one">
          <FeelingCategorySift
            state={notingState(category, word, written)}
            onAction={() => {}}
          />
        </Specimen>

        <Specimen label="Card · nothing written" note="the offer, on one word">
          <FeelingPrompt
            {...walk}
            {...inert}
            word={word}
            definition={definition}
            note={null}
            noting={null}
          />
        </Specimen>

        <Specimen label="Card · with a note" note="up to three of its lines">
          <FeelingPrompt
            {...walk}
            {...inert}
            word={word}
            definition={definition}
            note={written}
            noting={null}
          />
        </Specimen>

        <Specimen label="Card · drawer, empty box" note="writing a first note">
          <FeelingPrompt
            {...walk}
            {...inert}
            word={word}
            definition={definition}
            note={null}
            noting={{ word, draft: '' }}
          />
        </Specimen>

        <Specimen label="Card · drawer, note in the box" note="editing one">
          <FeelingPrompt
            {...walk}
            {...inert}
            word={word}
            definition={definition}
            note={written}
            noting={{ word, draft: note }}
          />
        </Specimen>
      </div>
    </>
  )
}

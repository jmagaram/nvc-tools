import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import FeelingCard from './FeelingCard.tsx'
import NoteDrawer from './NoteDrawer.tsx'
import type { Noting } from './NoteDrawer.tsx'
import NoteLine from './NoteLine.tsx'
import StepProgress from './StepProgress.tsx'
import type { StepMark } from './StepProgress.tsx'
import styles from './FeelingPrompt.module.css'

/** Which way an answer sends the card, and which way it tilts on the way out. */
type Toward = 'accept' | 'reject'

/** A copy of the card just answered, kept only until it has flown off. */
type Leaving = {
  word: string
  category: string
  definition: string
  /* What was written about it, so the note leaves with the word rather than
     being left sitting under the card arriving behind it. */
  note: string | null
  kind: 'met' | 'unmet'
  toward: Toward
}

type Props = {
  /** The feeling on the card right now, e.g. 'enchanted'. */
  word: string
  /** The category being walked through, e.g. 'Engaged'. */
  category: string
  /** A short plain-language gloss of the feeling. */
  definition: string
  /** Whether the category signals needs met or needs unmet. */
  kind: 'met' | 'unmet'
  /** What was said to each step already answered, oldest first. */
  past: readonly StepMark[]
  /** How many steps come after the one on screen. */
  upcoming: number
  /** A few words of someone's own about this feeling, or null for none yet. */
  note: string | null
  /**
   * The note being written, or null when the card is what is on top. Nothing
   * on a card is decided until it is answered, so keeping a note leaves the
   * card exactly where it was: what is written is part of the answer rather
   * than a substitute for it.
   */
  noting: Noting | null
  /** Write a note about the card on screen, or open the one already there. */
  onNote: () => void
  /** Called with what is in the box, on every keystroke. */
  onDraft: (text: string) => void
  /** Keep what is in the box. An emptied box deletes the note there was. */
  onKeepNote: () => void
  /** Close the drawer and leave the note as it was found. */
  onDropNote: () => void
  /** Accept this feeling and move on. */
  onAccept: () => void
  /** Reject this feeling and move on. */
  onReject: () => void
}

export default function FeelingPrompt({
  word,
  category,
  definition,
  kind,
  past,
  upcoming,
  note,
  noting,
  onNote,
  onDraft,
  onKeepNote,
  onDropNote,
  onAccept,
  onReject,
}: Props) {
  // The one place this component keeps state, and it is pure presentation: an
  // answer is instant everywhere else, so the card that just left has to be
  // remembered here or there is nothing to animate. By the time the flight
  // renders, the props have already moved on to the next feeling.
  const [leaving, setLeaving] = useState<Leaving | null>(null)
  // Counts answers rather than feelings. Keying the cards on this restarts
  // both animations on every answer — including one that leaves the word
  // alone, and a second answer that lands mid-flight.
  const [dealt, setDealt] = useState(0)

  const answer = (toward: Toward) => {
    setLeaving({ word, category, definition, kind, note, toward })
    setDealt(dealt + 1)
    if (toward === 'accept') onAccept()
    else onReject()
  }

  // Swipe keys, borrowed from the dating apps: right takes the feeling, left
  // passes on it. The whole prompt is one focusable region so the keys work
  // wherever focus sits inside it — on either button after a click, or on the
  // region itself after a Tab. Whether it takes focus the moment it appears is
  // the host's call, the same as the way out of a walk.
  const answerOnArrow = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      answer('accept')
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      answer('reject')
    } else if (event.key === 'n' || event.key === 'N') {
      // Writing is not answering: this opens the drawer and leaves the card
      // where it is. The box is a sibling of this region rather than inside
      // it, so an `n` typed into a note never arrives back here.
      event.preventDefault()
      onNote()
    }
  }

  return (
    <NoteDrawer
      noting={noting}
      onDraft={onDraft}
      onKeep={onKeepNote}
      onDrop={onDropNote}
    >
      {/* 'data-prompt' is how a host finds this region to focus it — see
          useFocusScreen. Not an aria attribute on purpose: a role or a label
          here becomes the region's accessible name and gets read out on every
          card. */}
      <div
        className={styles.prompt}
        tabIndex={0}
        data-prompt=""
        onKeyDown={answerOnArrow}
      >
        {/* Two cards at most: the one just answered tilting away, and the one
            rising into its place. The stage is a fixed height so neither of them
            jostles the buttons below, and it clips the flight at its edges. */}
        <div className={styles.stage}>
          {leaving && (
            <div
              key={`leaving-${dealt}`}
              className={`${styles.leaving} ${styles[leaving.toward]}`}
              aria-hidden="true"
              // The wash and the stamp animate too, and their events bubble
              // here. Only the card's own flight ending means it is really gone.
              onAnimationEnd={(event) => {
                if (event.target === event.currentTarget) setLeaving(null)
              }}
            >
              <FeelingCard
                word={leaving.word}
                category={leaving.category}
                definition={leaving.definition}
                note={
                  leaving.note === null ? null : (
                    <NoteLine
                      word={leaving.word}
                      note={leaving.note}
                      clickable={false}
                      maxLines={3}
                      onOpen={() => {}}
                    />
                  )
                }
                kind={leaving.kind}
              />
              <div className={styles.wash} />
              <p className={styles.stamp}>
                {leaving.toward === 'accept' ? '✓' : '✕'}
              </p>
            </div>
          )}
          <div key={`arriving-${dealt}`} className={styles.arriving}>
            <FeelingCard
              word={word}
              category={category}
              definition={definition}
              kind={kind}
              note={
                <NoteLine
                  word={word}
                  note={note}
                  clickable
                  maxLines={3}
                  onOpen={onNote}
                />
              }
            />
          </div>
        </div>

        {/* The seam between the card and the answer: how far along the walk is,
            and which words were kept on the way. Below the card so the card
            stays the loudest thing on screen, and above the buttons so the count
            it is keeping sits next to the gesture that changes it. */}
        <StepProgress
          past={past}
          upcoming={upcoming}
          label={`Feelings in ${category}`}
        />

        {/* The walk only runs forwards: answering is the only way to move. Each
            button sits on the side its arrow key points to. */}
        <div className={styles.actions}>
          <button type="button" onClick={() => answer('reject')}>
            <span aria-hidden="true">←</span>
            Not this
          </button>
          <button type="button" onClick={() => answer('accept')}>
            Yes
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </NoteDrawer>
  )
}

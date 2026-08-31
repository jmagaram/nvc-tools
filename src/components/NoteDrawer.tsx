import { useId } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import styles from './NoteDrawer.module.css'

/* `Your words` rather than `Words of your own`, which read as an invitation to
   supply words — and what somebody then supplies is words: `hurt, angry,
   dismissed`, a second go at the inventory rather than a thought about the one
   word already picked. */
/** The word a note is being written about, and what is in the box. */
export type Noting = {
  word: string
  draft: string
}

type Props = {
  /** The note being written, or null when what it parks is what is on top. */
  noting: Noting | null
  /** Called with what is in the box, on every keystroke. */
  onDraft: (text: string) => void
  /** Keep what is in the box. An emptied box deletes the note there was. */
  onKeep: () => void
  /** Close the drawer and leave the note as it was found. */
  onDrop: () => void
  /** The screen the drawer comes up over. */
  children: ReactNode
}

/**
 * A few words of your own about one word, written in a drawer the screen makes
 * room for.
 *
 * The screen parks itself — pushed up, faded, dissolved into the top edge — and
 * the drawer comes in off the bottom. Nothing outside changes height, so a
 * modal that hangs from a fixed line does not move; and because the drawer
 * grows upwards as the note runs on, the line being written stays where the
 * thumbs and the software keyboard already are.
 *
 * What it parks is inert while it is open: the words, the answers, and the
 * host's button row, which reads `isNoting` for itself. There is nothing to do
 * but finish the note or drop it, which is why the box needs no way in of its
 * own besides the one it already has.
 *
 * The caption above the box is its label, and there is no placeholder: the two
 * said the same thing, and only one of them was still there once you had typed
 * a character. Whether it names the word as well is the screen's to say — see
 * `namesWord`.
 *
 * The box is a textarea so that a long note wraps and stays visible, but what
 * it holds is one line: `Enter` keeps it whatever is held down with it, so no
 * line break can be typed, and text pasted in with newlines is flattened on the
 * way out. A note is a few words caught as they come, not a paragraph being
 * composed — and one line is what lets it live as a bullet in the note, where a
 * line break would need a continuation rule in every reader of the format.
 *
 * `Escape` puts it back the way it was found, and an emptied box is the delete
 * — there is no second control for that. None of the three is printed.
 */
export default function NoteDrawer({
  noting,
  onDraft,
  onKeep,
  onDrop,
  children,
}: Props) {
  const open = noting !== null
  /* The caption is the box's label, which is what a placeholder was standing in
     for and doing badly: it named the box only until the first keystroke, and
     only ever on a note being written for the first time — an edit opens the
     box full and never showed it at all. */
  const boxId = useId()

  const boxKeys = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      event.key === 'Enter' &&
      // A modified Enter is somebody else's. ⌘/Ctrl+Enter is the host's commit
      // chord, and without this it kept the note here *and* was heard at the
      // window a moment later — against a state that was no longer noting, so
      // it left the whole category. Two things on one keystroke, and the second
      // one threw away the screen.
      !event.metaKey &&
      !event.ctrlKey &&
      !event.altKey
    ) {
      event.preventDefault()
      onKeep()
    } else if (event.key === 'Escape') {
      // Stopped here rather than left to bubble: Escape means the drawer while
      // the drawer is open, and a host — Obsidian's modal, listening on the
      // document — would otherwise take it as meaning itself.
      event.preventDefault()
      event.stopPropagation()
      onDrop()
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      // Inside the box they are the caret. Nothing above would hear them
      // anyway, the drawer being a sibling of the screen rather than inside
      // it, but a host is free to listen higher up.
      event.stopPropagation()
    }
  }

  return (
    <div className={styles.surface}>
      <div
        className={styles.parked}
        data-parked={open ? '' : undefined}
        inert={open}
      >
        {children}
      </div>

      {/* Kept in the DOM when closed so it can come and go with a transition,
          and inert so it is neither reachable nor read while it is off. */}
      <div
        className={styles.drawer}
        data-open={open ? '' : undefined}
        inert={!open}
      >
        {/* One caption doing the two jobs a heading and a placeholder were
            splitting between them: naming the box, and saying whose words go
            in it. It is a real label, so it survives the first keystroke and
            is read out when the box takes focus.

            Where it names the word, the word keeps the source's own lowercase
            rather than being capitalised or set in caps for looking like a
            title. A feeling is spelled the way the inventory spells it
            everywhere else here — the card sets it lowercase at heading size
            and it reads fine — and the plugin's whole contract with a block is
            that it writes a word back in the spelling it read it in. Title
            case here would be the one place the app disagreed with itself
            about what the word is. */}
        <div className={styles.field}>
          <label className={styles.who} htmlFor={boxId}>
            {noting === null ? (
              ''
            ) : (
              <>
                Your words about <b>{noting.word}</b>
              </>
            )}
          </label>

          {/* `data-value` is the same text again, and the CSS grows the box to
            fit it — see the module. An effect measuring scrollHeight would say
            the same thing and would make this the one component here that
            reaches for the DOM. */}
          <div className={styles.grow} data-value={noting?.draft ?? ''}>
            <textarea
              className={styles.box}
              data-note=""
              id={boxId}
              rows={1}
              value={noting?.draft ?? ''}
              onChange={(event) => onDraft(event.target.value)}
              onKeyDown={boxKeys}
            />
          </div>
        </div>

        <div className={styles.row}>
          <button type="button" onClick={onDrop}>
            Cancel
          </button>
          <button type="button" onClick={onKeep}>
            Ok
          </button>
        </div>
      </div>
    </div>
  )
}

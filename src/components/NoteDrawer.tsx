import type { KeyboardEvent, ReactNode } from 'react'
import { NotePencil } from './NoteMark.tsx'
import styles from './NoteDrawer.module.css'

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
 * The box is a textarea, because a note is allowed to be a sentence and then
 * another one. `Enter` keeps it, `Shift Enter` is a new line, `Escape` puts it
 * back the way it was found, and an emptied box is the delete — there is no
 * second control for that.
 */
export default function NoteDrawer({
  noting,
  onDraft,
  onKeep,
  onDrop,
  children,
}: Props) {
  const open = noting !== null

  const boxKeys = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
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
      <div className={styles.parked} data-parked={open ? '' : undefined} inert={open}>
        {children}
      </div>

      {/* Kept in the DOM when closed so it can come and go with a transition,
          and inert so it is neither reachable nor read while it is off. */}
      <div className={styles.drawer} data-open={open ? '' : undefined} inert={!open}>
        <p className={styles.who}>
          <span className={styles.glyph}>
            <NotePencil />
          </span>
          <span className={styles.about}>Note on</span>{' '}
          <b>{noting?.word}</b>
        </p>

        {/* `data-value` is the same text again, and the CSS grows the box to
            fit it — see the module. An effect measuring scrollHeight would say
            the same thing and would make this the one component here that
            reaches for the DOM. */}
        <div className={styles.grow} data-value={noting?.draft ?? ''}>
          <textarea
            className={styles.box}
            data-note=""
            rows={1}
            placeholder="A few words of your own…"
            value={noting?.draft ?? ''}
            onChange={(event) => onDraft(event.target.value)}
            onKeyDown={boxKeys}
          />
        </div>

        <div className={styles.row}>
          <p className={styles.hint}>
            <b>Enter</b> keeps · <b>Shift Enter</b> new line
            <br />
            <b>Esc</b> drops · empty deletes
          </p>
          <button type="button" className={styles.quiet} onClick={onDrop}>
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

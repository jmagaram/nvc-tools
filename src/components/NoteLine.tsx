import { NotePencil } from './NoteMark.tsx'
import styles from './NoteLine.module.css'

type Props = {
  /** The word this line is about. */
  word: string
  /** What is written about it, or null when nothing is yet. */
  note: string | null
  /**
   * Whether a pointer may open this line.
   *
   * False on the grid, and that is the whole of the reasoning: to reach a
   * target down here the pointer has to sweep across the words above it, and
   * every word it crosses changes which word this line is about — so a click
   * aimed at one would land on whichever the mouse passed last. Naming a key
   * costs the pointer nothing.
   *
   * True on a card, which is one word: nothing changes underneath the pointer
   * on its way down, and without it a mouse in a walk would have no way to a
   * note at all.
   *
   * A coarse pointer opens it either way — there is no hover to lose and no key
   * to press — which is in the CSS rather than here, because it is a property
   * of the pointer and not of the screen.
   */
  clickable: boolean
  /** Write a note about this word, or open the one already there. */
  onOpen: () => void
}

/**
 * The one line under the definition: what is written about this word, or the
 * offer to write something.
 *
 * The same line either way, so what is written comes back exactly where the
 * offer stood. The key is at the left in both, so the one thing on the line
 * shaped like a button does not move when a note appears beside it — and the
 * note is the darker of the two, being what is said rather than how to change
 * it.
 *
 * Whoever draws this reserves the height, whether or not there is a line to
 * put in it: a line that came and went would move the modal's bottom edge
 * every time the pointer crossed a word.
 */
export default function NoteLine({ word, note, clickable, onOpen }: Props) {
  const lines = note === null ? [] : note.split('\n')
  const rest = lines.length - 1

  return (
    /* A real button, so a tap has something to press, but never a tab stop:
       the key is the keyboard's way in, and a stop here would sit between the
       words and the button row. `data-clickable` is what the CSS reads to let
       a pointer reach it — see the prop. */
    <button
      type="button"
      className={styles.line}
      tabIndex={-1}
      data-clickable={clickable ? '' : undefined}
      aria-label={
        note === null
          ? `Write a note about ${word}`
          : `Edit the note about ${word}: ${note}`
      }
      onClick={onOpen}
    >
      <span className={styles.glyph}>
        <NotePencil />
      </span>

      {/* Two ways to say the same thing, one per pointer, and the CSS picks:
          a key where there is a keyboard, a tap where there is a screen. Both
          are written out rather than swapped in JavaScript, which would make a
          component ask about the device it is drawn on. */}
      <span className={styles.action}>
        <span className={styles.press}>
          Press <span className={styles.key}>N</span> to
        </span>
        <span className={styles.tap}>Tap to</span>{' '}
        {note === null ? `add a few words about ${word}` : 'edit'}
      </span>

      {note !== null && <span className={styles.note}>{lines[0]}</span>}
      {rest > 0 && (
        <span className={styles.more}>
          +{rest} {rest === 1 ? 'line' : 'lines'}
        </span>
      )}
    </button>
  )
}

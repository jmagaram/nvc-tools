import type { CSSProperties } from 'react'
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
  /**
   * How many of the note's own lines to show before the rest are counted.
   *
   * One on a grid, where this line is a strip under a list and every row of it
   * is a row the words above do not get. Three on a card, which is one word and
   * has the room — a note written as a sentence and then another one came back
   * as its first line and a number, which is a worse way to read two sentences
   * than simply reading them.
   *
   * Required rather than defaulted, because the two screens genuinely differ
   * and a silent one would quietly give a grid the card's answer.
   */
  maxLines: number
  /** Write a note about this word, or open the one already there. */
  onOpen: () => void
}

/**
 * The one line under the definition: what is written about this word, or the
 * offer to write something.
 *
 * Whatever is worth reading holds the left edge, under the definition and in
 * line with it: the offer while there is nothing written, and the note itself
 * once there is. How to change it goes to the right, in a column of its own
 * whose width is the same in both states, so the key does not wander as notes
 * come and go.
 *
 * The note is set in italic, as the offer is. Below the word the definition is
 * the only upright line on the card — it is the inventory's sentence, and
 * everything italic beside it is yours or about yours.
 *
 * Whoever draws this reserves the height, whether or not there is a line to
 * put in it: a line that came and went would move the modal's bottom edge
 * every time the pointer crossed a word.
 */
export default function NoteLine({
  word,
  note,
  clickable,
  maxLines,
  onOpen,
}: Props) {
  const lines = note === null ? [] : note.split('\n')
  /* Counted in the note's own lines, not in the lines it comes to once it has
     wrapped: what is hidden is what was written and did not fit, and a line
     that wrapped is still shown. */
  const rest = lines.length - maxLines

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
      {/* What was said comes first, so it starts at the same left edge as the
          definition above it and the two read as one column of prose about the
          word. The count hugs it rather than the instruction, being part of
          the same sentence. */}
      {note !== null && (
        <span className={styles.said}>
          <span
            className={styles.note}
            style={{ '--note-lines': maxLines } as CSSProperties}
          >
            {lines.slice(0, maxLines).join('\n')}
          </span>
          {rest > 0 && (
            <span className={styles.more}>
              +{rest} {rest === 1 ? 'line' : 'lines'}
            </span>
          )}
        </span>
      )}

      {/* Two ways to say the same thing, one per pointer, and the CSS picks:
          a key where there is a keyboard, a tap where there is a screen. Both
          are written out rather than swapped in JavaScript, which would make a
          component ask about the device it is drawn on.

          No pencil here. It marks a word that carries a note, which is a job
          only worth doing where the note itself cannot be seen — in a pill on
          the grid, beside a word in a card. On this line the note is right
          there, and the glyph had no baseline to sit on beside text this small.

          `say more about` rather than `add a few words`: the shorter phrase
          described the size of the answer, and describing the size of an
          answer is how you get that size. What is wanted here is a sentence
          about the word, and `a few words` invited three of them.

          The word is bold and not also quoted. The quotes were there to stop
          a phrase running into the sentence — four needs begin with `to` — but
          bold already ends the sentence's claim on it, and doing both put two
          marks around one word on a line with room for neither.

          `Press` only where there is something to teach. On the offer it is
          the whole point of the line; over an existing note it is a word of
          chrome beside a keycap that already says press, on the one line that
          has to share its width with the note itself. */}
      <span className={styles.action}>
        <span className={styles.press}>
          {note === null && 'Press '}
          <span className={styles.key}>N</span> to
        </span>
        <span className={styles.tap}>Tap to</span>{' '}
        {note === null ? (
          <>
            say more about <b>{word}</b>
          </>
        ) : (
          'edit'
        )}
      </span>
    </button>
  )
}

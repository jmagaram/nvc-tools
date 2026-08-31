import type { CSSProperties } from 'react'
import styles from './NoteLine.module.css'

type Props = {
  /**
   * The word this is about. Never null: a screen that has no word to write
   * about draws nothing here at all rather than a control explaining itself.
   * There is nothing worth saying about a word nobody has picked, and finding
   * out that notes exist after picking one is soon enough.
   */
  word: string
  /** What is written about it, or null when nothing is yet. */
  note: string | null
  /**
   * How many of the note's own lines to show before the rest are counted.
   *
   * Required rather than defaulted, because the screens that draw this could
   * genuinely differ and a silent default would quietly give one the other's
   * answer. Both ask for three today.
   */
  maxLines: number
  /** Write a note about this word, or open the one already there. */
  onOpen: () => void
}

/**
 * The way to a note, under the definition: a control naming the word it would
 * write about, with whatever is already written shown beside it. The whole row
 * is the target, so clicking what was written opens it for editing.
 *
 * It looks like a control, which it did not always. It began as a line of
 * instruction — *Press N to…* — because the word underneath it kept changing:
 * the definition strip followed the pointer, so a target here would have been
 * retargeted by the very journey the pointer made to reach it, and a click
 * aimed at one word would have landed on whichever it passed last. Naming a key
 * was the way round that. **The anchor retired the argument**: the word this
 * names is chosen on purpose and holds still while the pointer travels to it.
 * What was left was a button wearing the costume of the prose it used to be —
 * it worked and looked inert, which is worse than either.
 *
 * The key is still named, as a hint at the end rather than as the instruction,
 * drawn the way the commit button draws its chord: a size down and part way
 * into the background, so the words are read first.
 *
 * Quiet on purpose, and quietest where it is largest. A note is optional, and
 * most people will never write one — a control shouting about it on every
 * screen would be out of proportion to how often it is wanted. On a touch
 * screen the thumb's worth of target is bought with padding rather than with
 * ink, so the room it takes and the attention it draws are set separately.
 */
export default function NoteLine({ word, note, maxLines, onOpen }: Props) {
  const lines = note === null ? [] : note.split('\n')
  /* Counted in the note's own lines, not in the lines it comes to once it has
     wrapped: what is hidden is what was written and did not fit, and a line
     that wrapped is still shown. */
  const rest = lines.length - maxLines


  return (
    <button
      type="button"
      className={styles.line}
      /* No `aria-label`. Obsidian renders one as a hover tooltip — that is its
         tooltip mechanism, and the plugin uses it on purpose for the block
         menu — so a label here put a black box over the definition every time
         the pointer crossed this control. It was harmless while this line
         refused the pointer; making it a real target is what exposed it.

         Nothing is lost. The button's own contents name it, and they include
         what was written, which is the whole reason a label was here: on the
         grid the words above give no sign of a note beyond the pencil. */
      aria-keyshortcuts="n"
      onClick={onOpen}
    >
      {/* What was said comes first, so it starts at the same left edge as the
          definition above it and the two read as one column of prose about the
          word. The count hugs it rather than the label, being part of the same
          sentence. */}
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

      {/* The only part drawn as something to press. The row around it is the
          target too — so that what was written can be clicked to change it —
          but a border round three lines of somebody's own words would read as a
          field they were sitting in rather than as a way to edit them.

          No pencil here. It marks a word that carries a note, which is a job
          only worth doing where the note itself cannot be seen — in a pill on
          the grid, beside a word in a card. On this line the note is right
          there, and the glyph had no baseline to sit on beside text this small.

          The word is bold and not also quoted. The quotes were there to stop a
          phrase running into the sentence — four needs begin with `to` — but
          bold already ends the sentence's claim on it, and doing both put two
          marks around one word on a line with room for neither. */}
      <span className={styles.action}>
        {/* The offer names the word; the edit does not.

            Nothing else on the line says which word an empty offer is about, so
            there it has to. Once something is written the note is sitting right
            beside this, in the reader's own words — the most recognisable thing
            on the screen — and the pencil marks the pill it belongs to. Naming
            the word again bought nothing and cost the room the note needed.

            It cost more than nothing, in fact. The word sat at the end of the
            label, so it was the first thing the ellipsis took: a long note
            turned `Edit note on mortified` into `Edit note …`, which is longer
            than `Edit` and says less. The label is now longest where there is
            most room for it and shortest where there is least.

            The word stays in the *name*, hidden, because a screen reader has no
            equivalent of glancing at the note beside it. It cannot be an
            `aria-label` — Obsidian draws those as tooltips — so it is text that
            is there and not seen. */}
        <span className={styles.says}>
          {note === null ? (
            <>
              Add note on <b>{word}</b>
            </>
          ) : (
            'Edit'
          )}
        </span>
        {/* Beside what is drawn rather than inside it: `.says` is the box that
            ellipsises, and text hidden in there is still text it measures. */}
        {note !== null && (
          <span className={styles.unseen}> note on {word}</span>
        )}
        {/* Hidden from a screen reader, which has `aria-keyshortcuts` on the
            button instead — read out, it would put an N into the name of the
            control. Taken away on a coarse pointer, which has no key. */}
        <span className={styles.key} aria-hidden="true">
          N
        </span>
      </span>
    </button>
  )
}

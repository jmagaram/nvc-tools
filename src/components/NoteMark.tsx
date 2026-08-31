import styles from './NoteMark.module.css'

/**
 * A word picked, and the few words of someone's own about it if there are any.
 * What a card or a summary is handed: absent means nothing was written. A note
 * held against a word whose mark was dropped never reaches here — the pickers
 * build this list from what is marked.
 */
export type Noted = {
  word: string
  note?: string
}

/**
 * Where it is being drawn, and — only where the question means anything —
 * whether there is a note yet.
 *
 * A union rather than two flags, because `noted` is not a property an inline
 * mark has: a card lists the words that were picked and puts a pencil beside
 * the ones carrying a note, so an inline mark that is not noted is not drawn at
 * all. A badge is the other way about — it appears on any marked word, being
 * the way to write the first note as well as the sign that one exists — so
 * there the question is real and the answer is required.
 */
type Props =
  /** In a card's run of picked words, after the word and in the text. */
  | { placement: 'inline' }
  /** Over a pill's top-right corner, out of the pill's flow. */
  | { placement: 'badge'; noted: boolean }

/**
 * The pencil: on a marked word, the way to say something about it, and once
 * something is said, the only thing that says so — a note itself is visible
 * only on the one word a screen is about. So it has to survive being small,
 * being inside a marked pill's wash, and being read in a run of words separated
 * by dots.
 *
 * As a badge it is out of flow and costs the pill no width, which is what lets
 * it appear on every marked word rather than only on noted ones: nothing grows
 * under the finger, and a row cannot reflow because a pointer crossed it. A dot
 * in the corner and a rule under the word were both free too, and both read as
 * a rendering artefact until someone explained them.
 */
function NotePencil() {
  return (
    <svg
      className={styles.pencil}
      viewBox="0 0 16 16"
      width="0.72em"
      height="0.72em"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M11.2 1.9 14.1 4.8 5.5 13.4l-3.9 1 1-3.9z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * The pencil with something for a screen reader to say, since none of it is
 * text. Put inside whatever draws the word — the pill's own button, the card's
 * list item — so it is read in the same breath as the word it belongs to.
 *
 * What it says depends on whether there is a note, not on where it is drawn.
 * A badge on a marked word with nothing written is an offer, and announcing it
 * as a note that exists would be a lie told twice: once here, and again when
 * the drawer opened empty.
 */
export default function NoteMark(props: Props) {
  const noted = props.placement === 'inline' || props.noted
  return (
    /* `data-note-mark` is how the pill tells a click on the pencil from a click
       on the word — see `FeelingPill`. An attribute rather than the module's
       own class, because the pill imports a different stylesheet and should not
       have to know this one's hashed names. It is also what `pill.module.css`
       reveals the badge on hover by, for the same reason.

       An unnoted badge says nothing out loud and is hidden from the
       accessibility tree entirely. It is a mouse's shortcut and only that: `n`
       and the button under the grid both already carry 'write a note about this
       word', and a third announcement inside the pill's own name would have
       every marked word read as an offer to write on it. Once there is a note,
       it is the only sign anywhere that there is something to read, so then it
       speaks. */
    <span
      className={`${styles.mark} ${styles[props.placement]}`}
      data-note-mark=""
      data-noted={noted ? '' : undefined}
      aria-hidden={noted ? undefined : true}
    >
      <NotePencil />
      {noted && <span className={styles.said}> — has a note</span>}
    </span>
  )
}

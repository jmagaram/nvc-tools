import styles from './NoteMark.module.css'

/**
 * A word picked, and the few words of someone's own about it if there are any.
 * What a card or a summary is handed: absent means nothing was written, which
 * is the only other state there is — a note cannot exist on a word that was not
 * picked, so there is no third case to draw.
 */
export type Noted = {
  word: string
  note?: string
}

/**
 * The pencil, drawn wherever a word carries a note: in a pill on the grid, and
 * beside a word listed in a category card. It is the only thing that says so —
 * a note itself is only visible on the one word a screen is about — so it has
 * to survive being small, being inside a marked pill's wash, and being read in
 * a run of words separated by dots.
 *
 * A glyph in the flow rather than paint in the padding, which is the one thing
 * here that costs width: a pill grows by about a character when a note is
 * written on it. A dot in the corner and a rule under the word were both free
 * and both read as a rendering artefact until someone explained them. Nothing
 * grows under the finger, because a noted word is always a marked one and the
 * mark came first.
 */
export function NotePencil() {
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
 */
export default function NoteMark() {
  return (
    <span className={styles.mark}>
      <NotePencil />
      <span className={styles.said}> — has a note</span>
    </span>
  )
}

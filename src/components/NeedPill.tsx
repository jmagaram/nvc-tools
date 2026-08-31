import type { MouseEvent } from 'react'
import NoteMark from './NoteMark.tsx'
import styles from './pill.module.css'

type Props = {
  /** The need, e.g. 'belonging'. */
  word: string
  /** Whether this word is picked. */
  marked: boolean
  /** Whether something is written about it. Only ever true of a marked word. */
  noted: boolean
  /**
   * Whether this is the grid's one tab stop.
   *
   * A category of twenty-eight words was twenty-eight tab stops, which put the
   * whole inventory between the words and the button row past them. One roves
   * instead, and the arrows are what move inside — so Tab reaches the grid and
   * Tab again leaves it.
   *
   * True for the anchored word, and for the *first* word before anything is
   * anchored, so the grid can be tabbed into from the moment it opens. That
   * second case is why this is not the same prop as `anchored`: a grid nothing
   * has been chosen in yet still needs somewhere for Tab to land, but it must
   * not claim a word is chosen.
   */
  tabbable: boolean
  /**
   * Whether this is the word the screen is about. Marks the pill with
   * `data-sift` for a host to focus — see `useFocusScreen` — and is what takes
   * the definition strip's description, since only one word may claim it.
   */
  anchored: boolean
  /** The gloss strip's id, so the anchored word is described by it. */
  describedBy: string
  /** Called to turn the mark on or off. */
  onClick: () => void
  /**
   * Called to open the note here, when the pencil itself is clicked rather than
   * the word.
   *
   * Reachable on any marked word now that the pencil costs no width, so a host
   * must treat it as 'write or edit', not only as 'edit'. It is a mouse's way
   * in and nothing else's: the keyboard has `n`, and a coarse pointer has the
   * button under the grid.
   */
  onNote: () => void
  /**
   * Called when this word is chosen on purpose — clicked, or focused by the
   * arrow keys or Tab. It is what the screen's actions then apply to, so it
   * must never fire from the pointer merely passing over.
   */
  onAnchor: () => void
  /**
   * Called when a mouse arrives, so a host may show what the word means after
   * it has stayed long enough to mean it. Shows and nothing else: reading a
   * definition must not decide what a key or a button does.
   *
   * There is no matching leave. The grid clears its own preview when the
   * pointer leaves it, rather than each word clearing on the way out — between
   * two words that would drop the strip back to the anchor for the length of
   * the next word's wait, and the strip would flicker across every crossing it
   * is meant to ignore.
   */
  onPreview: () => void
}

export default function NeedPill({
  word,
  marked,
  noted,
  tabbable,
  anchored,
  describedBy,
  onClick,
  onNote,
  onAnchor,
  onPreview,
}: Props) {
  /* The pencil is a region of this button that means something else. It can be
     a region and not a button of its own because a button inside a button is
     not markup a browser or a screen reader is obliged to make sense of, and a
     pill split into two controls would put fifty-six tab stops in a category of
     twenty-eight words — which is exactly what the roving stop above exists to
     avoid. Which was hit is a question the event answers. */
  const click = (event: MouseEvent<HTMLButtonElement>) => {
    const target = event.target as HTMLElement
    if (target.closest('[data-note-mark]')) onNote()
    else onClick()
  }
  return (
    /* `role="option"` rather than the `aria-pressed` toggle it was: the grid is
       a listbox now, and a run of buttons announced one at a time said nothing
       about being one choice among twenty-eight of them. The element stays a
       real `<button>` so Enter and Space still press it natively. */
    <button
      type="button"
      className={styles.pill}
      role="option"
      aria-selected={marked}
      aria-describedby={anchored ? describedBy : undefined}
      tabIndex={tabbable ? 0 : -1}
      data-sift={anchored ? '' : undefined}
      onClick={click}
      onFocus={onAnchor}
      /* Mouse only, and the event is asked rather than the user agent. A tap
         fires a compatibility `pointerenter` too, and on a screen with no
         pointer to move away there is no `pointerleave` to undo it — so the
         preview would latch onto whatever was last tapped and stay there. */
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') onPreview()
      }}
    >
      {word}
      {/* Drawn on any marked word, not only a noted one: out of flow it costs
          no width, so it can be the offer as well as the sign. */}
      {marked && <NoteMark placement="badge" noted={noted} />}
    </button>
  )
}

import type { ReactNode } from 'react'
import styles from './ModalFrame.module.css'

/**
 * What the title bar reads. A modal at the top of its stack names itself; one a
 * level down offers the way back instead, because what it is showing already
 * says where you are and the way out matters more than the name.
 *
 * The `label` on the way back names the screen it returns to rather than the
 * move — the title the level above is wearing, so that the two read as the
 * same place.
 */
export type ModalHeading =
  | { kind: 'title'; text: string }
  | { kind: 'back'; label: string; onBack: () => void }

type Props = {
  /** The title, or the way back up a level. */
  heading: ModalHeading
  /**
   * Called when the close button is pressed. It leaves whatever is on top,
   * which is the host's to decide: a screen a level down goes back up, and only
   * the top of the stack cancels the modal.
   */
  onClose: () => void
  /** Fills the scrolling body between the title bar and the buttons. */
  children: ReactNode
  /** The button row pinned to the bottom, or null for a screen that has none. */
  footer: ReactNode
  /**
   * Obsidian lays a modal out edge to edge on a phone and as a centred card
   * everywhere else, so this is the shape, not the width — the surface it is
   * dropped into decides how wide it gets.
   */
  size: 'phone' | 'desktop'
}

/**
 * The chrome an Obsidian modal puts around its content: a title bar, a body
 * that scrolls on its own, and a button row that stays put while it does.
 *
 * This is a stand-in, not a dialog. Obsidian's `Modal` is a plain overlay that
 * brings its own backdrop, focus trap and Escape handling, so there is nothing
 * here for `<dialog>` to contribute that would survive the move — only the
 * shape a component has to fit into does, and that is what this holds.
 *
 * The two bars own different scopes and never trade: the title bar says where
 * you are and how to go up, the button row says what becomes of the whole
 * modal. A step inside the content that has nothing to say about the whole
 * modal passes `null` and is shown without a button row.
 */
export default function ModalFrame({
  heading,
  onClose,
  children,
  footer,
  size,
}: Props) {
  return (
    <div className={`${styles.frame} ${styles[size]}`}>
      <div className={styles.header}>
        {heading.kind === 'title' ? (
          <h2 className={styles.title}>{heading.text}</h2>
        ) : (
          <button
            type="button"
            className={styles.back}
            onClick={heading.onBack}
          >
            <span aria-hidden="true">&lsaquo;</span> {heading.label}
          </button>
        )}
        <button
          type="button"
          className={styles.close}
          aria-label="Close"
          onClick={onClose}
        >
          &times;
        </button>
      </div>
      {/* The one scrolling box. Everything above and below it is fixed, which
          is the whole reason to preview a component in here: a picker that
          grows between steps pushes on this and nothing else. */}
      <div className={styles.body}>{children}</div>
      {/* No row at all when a screen has nothing to say about the whole modal.
          An empty one would still spend its border and its padding on saying
          nothing, at the bottom of the sparsest screen there is. */}
      {footer !== null && <div className={styles.footer}>{footer}</div>}
    </div>
  )
}

import NoteMark from './NoteMark.tsx'
import styles from './pill.module.css'

type Props = {
  /** The feeling itself, e.g. 'fascinated'. */
  word: string
  /** Whether the feeling signals needs met or needs unmet. */
  kind: 'met' | 'unmet'
  /** Whether it is one of the feelings picked. */
  marked: boolean
  /**
   * Whether a few words of someone's own are written about it. Only ever true
   * of a marked word — a note cannot outlive the mark under it — so the badge
   * never turns up on a pill that was not already drawn differently, and the
   * row can only grow when a note is added to it.
   */
  noted: boolean
  /**
   * Whether a closing note drawer hands focus back here — see
   * `useFocusScreen`. At most one pill in a grid carries it: the word the last
   * note was about, so writing one puts you back on the word you wrote about
   * rather than on the grid as a whole.
   */
  resume: boolean
  /** Called to turn the mark on or off. */
  onClick: () => void
  /**
   * Called when the word comes under attention — pointed at, or tabbed to. One
   * prop rather than two named for the events, because to a host they mean the
   * same thing: show what this word means. Reading a definition must not cost a
   * mark, which is why hovering and tabbing say it as well as tapping.
   */
  onShow: () => void
}

/**
 * One feeling, marked or not. The shape a category's words are laid out in
 * during a sift; `FeelingCard` is the shape for showing one on its own.
 *
 * A pressed button rather than a checkbox: the whole word is the target, which
 * is what makes marking a run of them quick.
 */
export default function FeelingPill({
  word,
  kind,
  marked,
  noted,
  resume,
  onClick,
  onShow,
}: Props) {
  return (
    <button
      type="button"
      className={`${styles.pill} ${styles[kind]}`}
      aria-pressed={marked}
      data-sift={resume ? '' : undefined}
      onClick={onClick}
      onPointerEnter={onShow}
      onFocus={onShow}
    >
      {word}
      {noted && <NoteMark />}
    </button>
  )
}

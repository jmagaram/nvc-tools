import styles from './pill.module.css'

type Props = {
  /** The need itself, e.g. 'companionship'. */
  word: string
  /** Whether it is one of the needs picked. */
  marked: boolean
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
 * One need, marked or not. The shape a category's words are laid out in during
 * a sift; `NeedCard` is the shape for showing one on its own.
 *
 * A pressed button rather than a checkbox: the whole word is the target, which
 * is what makes marking a run of them quick. No met/unmet split, unlike
 * `FeelingPill`: needs are one undivided list.
 */
export default function NeedPill({ word, marked, onClick, onShow }: Props) {
  return (
    <button
      type="button"
      className={styles.pill}
      aria-pressed={marked}
      onClick={onClick}
      onPointerEnter={onShow}
      onFocus={onShow}
    >
      {word}
    </button>
  )
}

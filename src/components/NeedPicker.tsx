import type { KeyboardEvent } from 'react'
import { rowNeighbor } from '../rowNeighbor.ts'
import NeedCategoryCard from './NeedCategoryCard.tsx'
import NeedCategoryPill from './NeedCategoryPill.tsx'
import NeedCategorySift from './NeedCategorySift.tsx'
import NeedCategoryWalk from './NeedCategoryWalk.tsx'
import { cards, noted, pills, resumeAt } from '../machines/needPicker.ts'
import type {
  NeedPickerAction,
  NeedPickerState,
} from '../machines/needPicker.ts'
import styles from './NeedPicker.module.css'

type Props = {
  /** Which categories have been visited, and the one open now if any. */
  state: NeedPickerState
  /** Called with whatever the person just did. */
  onAction: (action: NeedPickerAction) => void
}

/** Stands in for the needs when a category was opened and none applied. */
const EMPTY_TEXT = 'none of these'

/**
 * Browse every need category and go through the ones that look right.
 *
 * Three screens: the categories, one category's words all at once, and — for
 * whoever wants to be asked rather than to scan — that category one word at a
 * time. The ways between them are all the host's chrome, because they speak for
 * the screen rather than for anything inside it.
 *
 * The cards and the pills together are every category there is — the ones
 * already visited, and the rest. That is why neither group carries a heading:
 * there is no partial list to explain. And no tabs, unlike `FeelingPicker`: the
 * met/unmet split belongs to the feelings, not to the needs.
 */
export default function NeedPicker({ state, onAction }: Props) {
  const visit = state.visit

  if (visit?.phase === 'walk') {
    // The machine ends the walk on the last answer and lands back on the grid,
    // so this only ever shows a need waiting to be answered. Leaving part way
    // through is a 'close' action the host raises from its own chrome.
    return (
      <div className={styles.picker}>
        <NeedCategoryWalk
          state={visit.walk}
          onAction={(answer) => onAction({ type: 'answer', answer })}
        />
      </div>
    )
  }

  if (visit) {
    return (
      <div className={styles.picker}>
        <NeedCategorySift
          state={visit.sift}
          onAction={(action) => onAction({ type: 'sift', action })}
        />
      </div>
    )
  }

  const shown = cards(state)
  const rest = pills(state)
  // Coming back from a category, focus belongs on the one just closed, which is
  // always a card by then. Before anything has been opened there is no such
  // card and no tabs to fall back to, so the list takes it — a staging point
  // for Tab, which is why it draws no ring of its own.
  const resume = resumeAt(state)

  /**
   * The arrow keys move between the categories, the same way they move between
   * the words inside one. Left and right go in the order the categories are
   * drawn and wrap at the ends; up and down land on the nearest one in the row
   * above or below and stop at the edges, since that is the shape of the block
   * rather than a run.
   *
   * Focus is moved directly here, where a sift routes the same keys through its
   * machine. The difference is that a sift's arrows move an *anchor* — the word
   * its definition strip and its note button are about — and this screen has no
   * such state: nothing here depends on which category is focused except the
   * focus itself. Putting it in a machine would be state that only ever mirrors
   * the DOM.
   *
   * Every category stays its own tab stop, so Tab walks them as it always has
   * and the arrows are a faster way through the same list, not the only way.
   */
  const categoryOnArrow = (event: KeyboardEvent<HTMLDivElement>) => {
    // A modifier means the keystroke belongs to whoever is hosting this —
    // Obsidian's hotkeys run through ⌘ and Ctrl — so those are left alone.
    if (event.ctrlKey || event.metaKey || event.altKey) return

    /* Every category is a button and nothing else in here is one, so this is
       the whole list in the order it is drawn — cards first, then pills. */
    const items = [
      ...event.currentTarget.querySelectorAll<HTMLElement>('button'),
    ]
    if (items.length === 0) return
    const at = items.indexOf(document.activeElement as HTMLElement)

    const go = (index: number) => {
      event.preventDefault()
      items[index]?.focus()
    }

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowLeft': {
        const step = event.key === 'ArrowRight' ? 1 : -1
        return go(at < 0 ? 0 : (at + step + items.length) % items.length)
      }
      case 'ArrowDown':
      case 'ArrowUp': {
        if (at < 0) return go(0)
        // The one place this reaches for the page: which category is above
        // another is known only to the layout — see `rowNeighbor`.
        const boxes = items.map((item) => item.getBoundingClientRect())
        const next = rowNeighbor(boxes, at, event.key === 'ArrowDown' ? 1 : -1)
        event.preventDefault()
        return next === null ? undefined : go(next)
      }
      case 'Home':
        return go(0)
      case 'End':
        return go(items.length - 1)
      default:
        return
    }
  }

  return (
    /* 'data-browse' is how a host finds this screen to focus it — see
       useFocusScreen. tabIndex -1 because it only ever takes focus that way:
       as a tab stop it would sit in front of the first category for no gain.
       Not an aria attribute, for the reason `NeedPrompt` gives. There are no
       tabs here, so unlike `FeelingPicker` the arrows have only one job. */
    <div
      className={styles.picker}
      tabIndex={-1}
      data-browse={resume === null ? '' : undefined}
    >
      <div className={styles.panel} onKeyDown={categoryOnArrow}>
        {/* Cards first, then pills: visited categories, then the rest. Together
            they are every category, which is why neither group needs a heading
            saying what it leaves out. An empty group is left out entirely so it
            does not spend a gap. */}
        {shown.length > 0 && (
          <div className={styles.cards}>
            {shown.map((card) => (
              <NeedCategoryCard
                key={card.category}
                category={card.category}
                needs={noted(card)}
                emptyText={EMPTY_TEXT}
                resume={card.category === resume}
                onClick={() =>
                  onAction({ type: 'open', category: card.category })
                }
              />
            ))}
          </div>
        )}
        {rest.length > 0 && (
          <div className={styles.pills}>
            {rest.map((category) => (
              <NeedCategoryPill
                key={category}
                category={category}
                onClick={() => onAction({ type: 'open', category })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

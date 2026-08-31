import type { KeyboardEvent } from 'react'

import FeelingCategoryCard from './FeelingCategoryCard.tsx'
import FeelingCategoryPill from './FeelingCategoryPill.tsx'
import FeelingCategorySift from './FeelingCategorySift.tsx'
import FeelingCategoryWalk from './FeelingCategoryWalk.tsx'
import { cards, counts, noted, pills, resumeAt } from '../machines/feelingPicker.ts'
import type {
  FeelingPickerAction,
  FeelingPickerState,
} from '../machines/feelingPicker.ts'
import { rowNeighbor } from '../rowNeighbor.ts'
import styles from './FeelingPicker.module.css'

type Props = {
  /** Which categories have been visited, and the one open now if any. */
  state: FeelingPickerState
  /** Called with whatever the person just did. */
  onAction: (action: FeelingPickerAction) => void
}

/** Stands in for the feelings when a category was walked and none applied. */
const EMPTY_TEXT = 'none of these'

const TABS: { kind: 'unmet' | 'met'; label: string }[] = [
  { kind: 'unmet', label: 'Needs unmet' },
  { kind: 'met', label: 'Needs met' },
]

/**
 * Browse every feeling category and go through the ones that look right.
 *
 * Three screens: the categories, one category's words all at once, and — for
 * whoever wants to be asked rather than to scan — that category one word at a
 * time. The ways between them are all the host's chrome, because they speak for
 * the screen rather than for anything inside it.
 *
 * A tab holds one side of the NVC split, and within it the cards and the pills
 * together are every category on that side — the ones already visited, and the
 * rest. That is why neither group carries a heading: there is no partial list
 * to explain.
 */
export default function FeelingPicker({ state, onAction }: Props) {
  const visit = state.visit

  if (visit?.phase === 'walk') {
    // The machine ends the walk on the last answer and lands back on the grid,
    // so this only ever shows a feeling waiting to be answered. Leaving part
    // way through is a 'close' action the host raises from its own chrome.
    return (
      <div className={styles.picker}>
        <FeelingCategoryWalk
          state={visit.walk}
          onAction={(answer) => onAction({ type: 'answer', answer })}
        />
      </div>
    )
  }

  if (visit) {
    return (
      <div className={styles.picker}>
        <FeelingCategorySift
          state={visit.sift}
          onAction={(action) => onAction({ type: 'sift', action })}
        />
      </div>
    )
  }

  const totals = counts(state)
  const shown = cards(state)
  const rest = pills(state)
  // Coming back from a walk, focus belongs on the category just walked, which
  // is always a card by then. Before anything has been walked there is no such
  // card, and the chosen tab takes it instead — something with a ring on it,
  // rather than the list as a whole, which has nothing to show for being
  // focused. Exactly one of the two carries `data-browse`.
  const resume = resumeAt(state)

  /* Sideways moves sideways — but only from a tab. This used to sit on the
     whole screen, which meant the arrows switched tabs wherever focus was, and
     so they could never move between the categories underneath. On the tab
     strip it is the natural reading of the key and leaves the arrows below free
     for the list they are pointing at. */
  const tabOnArrow = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault()
      const kind = event.key === 'ArrowRight' ? 'met' : 'unmet'
      onAction({ type: 'tab', kind })
    }
  }


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
    <div className={styles.picker}>
      {/* Two toggle buttons rather than role="tab": the ARIA tab pattern would
          promise ↑ and ↓ and Home and End alongside the arrows below, and
          these are plain buttons reached with Tab like everything else. */}
      <div className={styles.tabs} onKeyDown={tabOnArrow}>
        {TABS.map(({ kind, label }) => (
          <button
            key={kind}
            type="button"
            aria-pressed={state.tab === kind}
            className={styles.tab}
            data-browse={resume === null && state.tab === kind ? '' : undefined}
            onClick={() => onAction({ type: 'tab', kind })}
          >
            {totals[kind] > 0 ? `${label} (${totals[kind]})` : label}
          </button>
        ))}
      </div>

      <div className={styles.panel} onKeyDown={categoryOnArrow}>
        {/* Cards first, then pills: walked categories, then the rest. Together
            they are every category on this tab, which is why neither group
            needs a heading saying what it leaves out. An empty group is left
            out entirely so it does not spend a gap. */}
        {shown.length > 0 && (
          <div className={styles.cards}>
            {shown.map((card) => (
              <FeelingCategoryCard
                key={card.category}
                category={card.category}
                kind={card.kind}
                feelings={noted(card)}
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
            {rest.map((pill) => (
              <FeelingCategoryPill
                key={pill.category}
                category={pill.category}
                kind={pill.kind}
                onClick={() =>
                  onAction({ type: 'open', category: pill.category })
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

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

  return (
    /* 'data-browse' is how a host finds this screen to focus it — see
       useFocusScreen. tabIndex -1 because it only ever takes focus that way:
       as a tab stop it would sit in front of the first category for no gain.
       Not an aria attribute, for the reason `NeedPrompt` gives. There are no
       tabs here, so unlike `FeelingPicker` it has no arrow keys of its own. */
    <div
      className={styles.picker}
      tabIndex={-1}
      data-browse={resume === null ? '' : undefined}
    >
      <div className={styles.panel}>
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

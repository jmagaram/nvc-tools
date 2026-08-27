import FeelingCategoryCard from './FeelingCategoryCard.tsx'
import FeelingCategoryPill from './FeelingCategoryPill.tsx'
import FeelingCategoryWalk from './FeelingCategoryWalk.tsx'
import { cards, counts, pills } from '../machines/feelingPicker.ts'
import type {
  FeelingPickerAction,
  FeelingPickerState,
} from '../machines/feelingPicker.ts'
import styles from './FeelingPicker.module.css'

type Props = {
  /** Which categories have been walked, and the walk in progress if any. */
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
 * Browse every feeling category and walk through the ones that look right.
 *
 * A tab holds one side of the NVC split, and within it the cards and the pills
 * together are every category on that side — the ones already walked, and the
 * rest. That is why neither group carries a heading: there is no partial list
 * to explain.
 */
export default function FeelingPicker({ state, onAction }: Props) {
  if (state.walk) {
    // The machine closes the walk on the last answer, so this only ever shows a
    // feeling waiting to be answered. Leaving part way through is a 'close'
    // action the host raises from its own chrome — a modal puts it in the title
    // bar and the button row, where the rest of the ways out already live.
    return (
      <div className={styles.picker}>
        <FeelingCategoryWalk
          state={state.walk}
          onAction={(answer) => onAction({ type: 'answer', answer })}
        />
      </div>
    )
  }

  const totals = counts(state)
  const shown = cards(state)
  const rest = pills(state)

  return (
    <div className={styles.picker}>
      {/* Two toggle buttons rather than role="tab": the ARIA tab pattern also
          promises arrow-key navigation between tabs, and these are plain
          buttons reached with Tab like everything else on the page. */}
      <div className={styles.tabs}>
        {TABS.map(({ kind, label }) => (
          <button
            key={kind}
            type="button"
            aria-pressed={state.tab === kind}
            className={styles.tab}
            onClick={() => onAction({ type: 'tab', kind })}
          >
            {totals[kind] > 0 ? `${label} (${totals[kind]})` : label}
          </button>
        ))}
      </div>

      <div className={styles.panel}>
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
                feelings={[...card.words]}
                emptyText={EMPTY_TEXT}
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

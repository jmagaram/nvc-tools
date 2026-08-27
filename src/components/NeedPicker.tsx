import NeedCategoryCard from './NeedCategoryCard.tsx'
import NeedCategoryPill from './NeedCategoryPill.tsx'
import NeedCategoryWalk from './NeedCategoryWalk.tsx'
import { cards, pills } from '../machines/needPicker.ts'
import type {
  NeedPickerAction,
  NeedPickerState,
} from '../machines/needPicker.ts'
import styles from './NeedPicker.module.css'

type Props = {
  /** Which categories have been walked, and the walk in progress if any. */
  state: NeedPickerState
  /** Called with whatever the person just did. */
  onAction: (action: NeedPickerAction) => void
}

/** Stands in for the needs when a category was walked and none applied. */
const EMPTY_TEXT = 'none of these'

/**
 * Browse every need category and walk through the ones that look right.
 *
 * The cards and the pills together are every category there is — the ones
 * already walked, and the rest. That is why neither group carries a heading:
 * there is no partial list to explain. And no tabs, unlike `FeelingPicker`:
 * the met/unmet split belongs to the feelings, not to the needs.
 */
export default function NeedPicker({ state, onAction }: Props) {
  if (state.walk) {
    // The machine closes the walk on the last answer, so this only ever shows a
    // need waiting to be answered. Leaving part way through is a 'close' action
    // the host raises from its own chrome — a modal puts it in the title bar
    // and the button row, where the rest of the ways out already live.
    return (
      <div className={styles.picker}>
        <NeedCategoryWalk
          state={state.walk}
          onAction={(answer) => onAction({ type: 'answer', answer })}
        />
      </div>
    )
  }

  const shown = cards(state)
  const rest = pills(state)

  return (
    <div className={styles.picker}>
      <div className={styles.panel}>
        {/* Cards first, then pills: walked categories, then the rest. Together
            they are every category, which is why neither group needs a heading
            saying what it leaves out. An empty group is left out entirely so it
            does not spend a gap. */}
        {shown.length > 0 && (
          <div className={styles.cards}>
            {shown.map((card) => (
              <NeedCategoryCard
                key={card.category}
                category={card.category}
                needs={[...card.words]}
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

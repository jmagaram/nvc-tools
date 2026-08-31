import { useState } from 'react'
import { useNoteShortcut } from '../keyboard.ts'
import NeedCategorySift from '../components/NeedCategorySift.tsx'
import { useFocusScreen } from '../focusScreen.ts'
import { categories } from '../data/needs.ts'
import { init, reduce, screenKey } from '../machines/needCategorySift.ts'
import type {
  NeedCategorySiftAction,
  NeedCategorySiftState,
} from '../machines/needCategorySift.ts'

export default function NeedCategorySiftDemo() {
  const [categoryIndex, setCategoryIndex] = useState(1)
  const [state, setState] = useState<NeedCategorySiftState>(() =>
    init(categories[1]),
  )
  // Standing in for whatever the app stores between sessions, so that
  // re-opening a category comes back with the same words marked.
  const [picksByCategory, setPicksByCategory] = useState<
    Record<string, string[]>
  >({})

  const bodyRef = useFocusScreen(screenKey(state))

  const dispatch = (action: NeedCategorySiftAction) =>
    setState((current) => reduce(current, action))

  /* This page is the host, so it owns the key — see `useNoteShortcut`. There is
     no button row here to lose focus to, but a host that skipped this would
     have a grid whose `n` worked only while the grid itself had focus. */
  useNoteShortcut(true, () => dispatch({ type: 'noteShowing' }))

  /** Open another category, keeping what the one on screen marked. */
  const open = (index: number) => {
    const remembered = {
      ...picksByCategory,
      [state.category]: [...state.marked],
    }
    const category = categories[index]
    setPicksByCategory(remembered)
    setCategoryIndex(index)
    setState(init(category, remembered[category.name] ?? []))
  }

  return (
    <>
      <label>
        Category{' '}
        <select
          value={categoryIndex}
          onChange={(e) => open(Number(e.target.value))}
        >
          {categories.map((option, optionIndex) => (
            <option key={option.name} value={optionIndex}>
              {option.name} ({option.needs.length})
            </option>
          ))}
        </select>
      </label>
      <label>
        <button type="button" onClick={() => open(categoryIndex)}>
          Start over
        </button>
      </label>
      <hr />
      {/* Focused the way a modal host focuses it, so Tab starts inside the
          grid rather than in whatever chrome is wrapped round it. */}
      <div ref={bodyRef}>
        <NeedCategorySift state={state} onAction={dispatch} />
      </div>

      {/* What a host would take away — the ways on from here, `Done` and going
          through the words one at a time, are the host's and are shown on the
          Need Picker page rather than invented twice. */}
      <h2>Marked</h2>
      {state.marked.length === 0 ? (
        <p>Nothing marked yet.</p>
      ) : (
        <ul>
          {state.marked.map((word) => (
            <li key={word}>{word}</li>
          ))}
        </ul>
      )}
      <p>
        Every word in the category at once, in the order the source lists them
        and never shuffled — so the word you saw a moment ago is where you left
        it, including on the way back in. Marking is the answer here: nothing
        asks again afterwards.
      </p>
      <p>
        Touch, hover or Tab to a word to read its definition in the strip at the
        bottom. Reading one costs nothing, which is why the strip and not a
        second tap. It holds its height whether or not anything is showing, so
        the grid never shifts under the finger that just tapped it.
      </p>
    </>
  )
}

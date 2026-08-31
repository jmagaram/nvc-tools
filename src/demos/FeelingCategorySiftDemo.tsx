import { useState } from 'react'
import { useNoteShortcut } from '../keyboard.ts'
import FeelingCategorySift from '../components/FeelingCategorySift.tsx'
import { useFocusScreen } from '../focusScreen.ts'
import { categories } from '../data/feelings.ts'
import { init, reduce, screenKey } from '../machines/feelingCategorySift.ts'
import type {
  FeelingCategorySiftAction,
  FeelingCategorySiftState,
} from '../machines/feelingCategorySift.ts'

export default function FeelingCategorySiftDemo() {
  const [categoryIndex, setCategoryIndex] = useState(0)
  const [state, setState] = useState<FeelingCategorySiftState>(() =>
    init(categories[0]),
  )
  // Standing in for whatever the app stores between sessions, so that
  // re-opening a category comes back with the same words marked.
  const [picksByCategory, setPicksByCategory] = useState<
    Record<string, string[]>
  >({})

  const bodyRef = useFocusScreen(screenKey(state))

  const dispatch = (action: FeelingCategorySiftAction) =>
    setState((current) => reduce(current, action))

  /* This page is the host, so it owns the key — see `useNoteShortcut`. There is
     no button row here to lose focus to, but a host that skipped this would
     have a grid whose `n` worked only while the grid itself had focus. */
  useNoteShortcut(true, () => dispatch({ type: 'noteAnchor' }))

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
              {option.name} ({option.feelings.length}, {option.kind})
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
        <FeelingCategorySift state={state} onAction={dispatch} />
      </div>

      {/* What a host would take away — the ways on from here, `Done` and going
          through the words one at a time, are the host's and are shown on the
          Feeling Picker page rather than invented twice. */}
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
        Tab reaches the grid once, not once per word, and the arrow keys move
        inside it — left and right through the words, up and down between the
        rows. The word you land on is the one the strip describes and the one
        the button under it will write about. Resting the pointer on another
        word previews its definition without taking either away, which is what
        lets the button be aimed at at all.
      </p>
      <p>
        The border is solid on a category of feelings that signals needs met and
        dashed on one that signals needs unmet, the same split the cards and
        pills draw. Marking a word puts a pencil over its corner: faint until
        you point at it, solid once something is written. Unmarking hides what
        was written rather than deleting it — mark the word again and it is
        back.
      </p>
    </>
  )
}

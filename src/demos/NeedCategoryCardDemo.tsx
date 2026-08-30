import { Fragment, useState } from 'react'
import NeedCategoryCard from '../components/NeedCategoryCard.tsx'
import { useFocusScreen } from '../focusScreen.ts'
import { categories } from '../data/needs.ts'

/** How many of the category's needs to hand the card. */
const COUNTS = ['all', 3, 0] as const

/** Two cards, so a long category and a short one can be compared at a glance. */
const INITIAL = ['Connection', 'Play'].map((name) =>
  categories.findIndex((category) => category.name === name),
)

function setAt<T>(values: T[], slot: number, value: T): T[] {
  return values.map((v, i) => (i === slot ? value : v))
}

export default function NeedCategoryCardDemo() {
  const [picked, setPicked] = useState(INITIAL)
  const [countIndexes, setCountIndexes] = useState([0, 0])
  const [clicks, setClicks] = useState([0, 0])
  // One card at most, the way a picker uses it — so a slot number, not a
  // checkbox apiece, which could put the mark on both.
  const [resume, setResume] = useState(-1)

  // What `resume` is for, done the way a picker does it: the browse screen
  // coming back into view puts focus on the category just left. Without this
  // the prop marks a button no one looks for and nothing on the page moves.
  const bodyRef = useFocusScreen(`browse:${resume}`)

  return (
    <>
      {picked.map((categoryIndex, slot) => (
        <Fragment key={slot}>
          <label>
            Card {slot + 1} category{' '}
            <select
              value={categoryIndex}
              onChange={(e) =>
                setPicked(setAt(picked, slot, Number(e.target.value)))
              }
            >
              {categories.map((category, index) => (
                <option key={category.name} value={index}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Card {slot + 1} needs shown{' '}
            <select
              value={countIndexes[slot]}
              onChange={(e) =>
                setCountIndexes(
                  setAt(countIndexes, slot, Number(e.target.value)),
                )
              }
            >
              {COUNTS.map((count, index) => (
                <option key={String(count)} value={index}>
                  {count === 'all' ? 'all chosen' : `${count} chosen`}
                </option>
              ))}
            </select>
          </label>
        </Fragment>
      ))}
      <label>
        Resumes at{' '}
        <select
          value={resume}
          onChange={(e) => setResume(Number(e.target.value))}
        >
          <option value={-1}>nothing</option>
          {picked.map((_, slot) => (
            <option key={slot} value={slot}>
              Card {slot + 1}
            </option>
          ))}
        </select>
      </label>
      <hr />
      <p>
        Resuming moves the focus ring, and nothing else: the card marks its
        heading with <code>data-browse</code> and a host's{' '}
        <code>useFocusScreen</code> looks for it. In a picker that is how coming
        back from a category lands on the one just left, rather than on nothing
        with the arrow keys dead.
      </p>
      <div ref={bodyRef}>
        {picked.map((categoryIndex, slot) => {
          const category = categories[categoryIndex]
          /* The second word in each category carries a few words of someone's
             own, so the card shows what it says about one: a pencil, and
             nothing more. */
          const words = category.needs.map((need, at) =>
            at === 1 ? { word: need.word, note: 'only at home' } : { word: need.word },
          )
          const count = COUNTS[countIndexes[slot]]
          return (
            <div key={slot}>
              <NeedCategoryCard
                category={category.name}
                needs={count === 'all' ? words : words.slice(0, count)}
                emptyText="no specific needs chosen"
                resume={slot === resume}
                onClick={() => setClicks(setAt(clicks, slot, clicks[slot] + 1))}
              />
              <p>Clicked {clicks[slot]} times</p>
            </div>
          )
        })}
      </div>
    </>
  )
}

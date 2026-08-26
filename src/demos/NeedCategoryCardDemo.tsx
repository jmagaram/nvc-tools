import { Fragment, useState } from 'react'
import NeedCategoryCard from '../components/NeedCategoryCard.tsx'
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
      <hr />
      {picked.map((categoryIndex, slot) => {
        const category = categories[categoryIndex]
        const words = category.needs.map((need) => need.word)
        const count = COUNTS[countIndexes[slot]]
        return (
          <div key={slot}>
            <NeedCategoryCard
              category={category.name}
              needs={count === 'all' ? words : words.slice(0, count)}
              emptyText="no specific needs chosen"
              onClick={() => setClicks(setAt(clicks, slot, clicks[slot] + 1))}
            />
            <p>Clicked {clicks[slot]} times</p>
          </div>
        )
      })}
    </>
  )
}

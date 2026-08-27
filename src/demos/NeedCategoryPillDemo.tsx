import { useState } from 'react'
import NeedCategoryCard from '../components/NeedCategoryCard.tsx'
import NeedCategoryPill from '../components/NeedCategoryPill.tsx'
import { categories } from '../data/needs.ts'
import styles from './NeedCategoryPillDemo.module.css'

/** Enough for the card to have something to list. */
const PICKED = ['closeness', 'empathy']

export default function NeedCategoryPillDemo() {
  const [category, setCategory] = useState('Connection')
  const [clicks, setClicks] = useState(0)

  return (
    <>
      <label>
        Category{' '}
        <input value={category} onChange={(e) => setCategory(e.target.value)} />
      </label>
      <hr />
      {/* The pill has no picked state of its own to put beside the plain one:
          picking something in a category is what turns it into a card. So the
          two shapes the picker swaps between are what go side by side. */}
      <div className={styles.pair}>
        <NeedCategoryPill
          category={category}
          onClick={() => setClicks(clicks + 1)}
        />
        <NeedCategoryCard
          category={category}
          needs={PICKED}
          emptyText="Nothing picked yet"
          resume={false}
          onClick={() => setClicks(clicks + 1)}
        />
      </div>
      <p>
        A category with nothing picked in it, and the same one once something
        is. Clicked {clicks} times.
      </p>
      <hr />

      {/* The reason the pill exists: every category on screen at once. Display
          only — opening one is what the Need Picker page is for. */}
      <p>Every category at once, which is what the pill is small enough for.</p>
      <div className={styles.row}>
        {categories.map((sample) => (
          <NeedCategoryPill
            key={sample.name}
            category={sample.name}
            onClick={() => {}}
          />
        ))}
      </div>
    </>
  )
}

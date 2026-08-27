import { useState } from 'react'
import NeedCard from '../components/NeedCard.tsx'
import { categories } from '../data/needs.ts'
import styles from './NeedCardDemo.module.css'

const PER_CATEGORY = [1, 2, 3]

export default function NeedCardDemo() {
  const [perCategory, setPerCategory] = useState(1)

  const shown = categories.flatMap((category) =>
    category.needs.slice(0, perCategory).map((need) => ({
      ...need,
      category: category.name,
    })),
  )

  return (
    <>
      <label>
        Needs per category{' '}
        <select
          value={perCategory}
          onChange={(e) => setPerCategory(Number(e.target.value))}
        >
          {PER_CATEGORY.map((count) => (
            <option key={count} value={count}>
              {count}
            </option>
          ))}
        </select>
      </label>
      <hr />
      <div className={styles.grid}>
        {shown.map((need) => (
          <NeedCard
            key={`${need.category}-${need.word}`}
            word={need.word}
            category={need.category}
            definition={need.definition}
          />
        ))}
      </div>
    </>
  )
}

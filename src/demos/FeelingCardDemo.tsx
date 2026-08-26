import { useState } from 'react'
import FeelingCard from '../components/FeelingCard.tsx'
import { categories } from '../data/feelings.ts'
import styles from './FeelingCardDemo.module.css'

type Filter = 'all' | 'met' | 'unmet'

const FILTERS: Filter[] = ['all', 'met', 'unmet']
const PER_CATEGORY = [1, 2, 3]

export default function FeelingCardDemo() {
  const [filter, setFilter] = useState<Filter>('all')
  const [perCategory, setPerCategory] = useState(1)

  const shown = categories
    .filter((category) => filter === 'all' || category.kind === filter)
    .flatMap((category) =>
      category.feelings.slice(0, perCategory).map((feeling) => ({
        ...feeling,
        category: category.name,
        kind: category.kind,
      })),
    )

  return (
    <>
      <label>
        Kind{' '}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as Filter)}
        >
          {FILTERS.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>
      <label>
        Feelings per category{' '}
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
        {shown.map((feeling) => (
          <FeelingCard
            key={`${feeling.category}-${feeling.word}`}
            word={feeling.word}
            category={feeling.category}
            definition={feeling.definition}
            kind={feeling.kind}
          />
        ))}
      </div>
    </>
  )
}

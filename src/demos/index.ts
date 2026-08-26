import type { ReactNode } from 'react'
import DateDisplayDemo from './DateDisplayDemo.tsx'
import NumberDisplayDemo from './NumberDisplayDemo.tsx'

export type Demo = {
  slug: string
  title: string
  Component: () => ReactNode
}

export const demos: Demo[] = [
  { slug: 'date-display', title: 'Date Display', Component: DateDisplayDemo },
  { slug: 'number-display', title: 'Number Display', Component: NumberDisplayDemo },
]

import type { ReactNode } from 'react'
import EmotionCategoryCardDemo from './EmotionCategoryCardDemo.tsx'
import FeelingCardDemo from './FeelingCardDemo.tsx'

export type Demo = {
  slug: string
  title: string
  Component: () => ReactNode
}

export const demos: Demo[] = [
  {
    slug: 'emotion-category-card',
    title: 'Emotion Category Card',
    Component: EmotionCategoryCardDemo,
  },
  { slug: 'feeling-card', title: 'Feeling Card', Component: FeelingCardDemo },
]

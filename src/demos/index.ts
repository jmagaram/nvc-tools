import type { ReactNode } from 'react'
import EmotionCategoryCardDemo from './EmotionCategoryCardDemo.tsx'
import FeelingCardDemo from './FeelingCardDemo.tsx'
import FeelingPromptDemo from './FeelingPromptDemo.tsx'
import NeedsCategoryCardDemo from './NeedsCategoryCardDemo.tsx'
import StepProgressDemo from './StepProgressDemo.tsx'

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
  {
    slug: 'step-progress',
    title: 'Step Progress',
    Component: StepProgressDemo,
  },
  {
    slug: 'needs-category-card',
    title: 'Needs Category Card',
    Component: NeedsCategoryCardDemo,
  },
  {
    slug: 'feeling-prompt',
    title: 'Feeling Prompt',
    Component: FeelingPromptDemo,
  },
]

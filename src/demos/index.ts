import type { ReactNode } from 'react'
import CategoryWalkDemo from './CategoryWalkDemo.tsx'
import FeelingCardDemo from './FeelingCardDemo.tsx'
import FeelingCategoryCardDemo from './FeelingCategoryCardDemo.tsx'
import FeelingCategoryPillDemo from './FeelingCategoryPillDemo.tsx'
import FeelingPickerDemo from './FeelingPickerDemo.tsx'
import FeelingPromptDemo from './FeelingPromptDemo.tsx'
import ModalFrameDemo from './ModalFrameDemo.tsx'
import NeedCategoryCardDemo from './NeedCategoryCardDemo.tsx'
import StepProgressDemo from './StepProgressDemo.tsx'

export type Demo = {
  slug: string
  title: string
  Component: () => ReactNode
}

export const demos: Demo[] = [
  {
    slug: 'feeling-picker',
    title: 'Feeling Picker',
    Component: FeelingPickerDemo,
  },
  { slug: 'modal-frame', title: 'Modal Frame', Component: ModalFrameDemo },
  {
    slug: 'feeling-category-card',
    title: 'Feeling Category Card',
    Component: FeelingCategoryCardDemo,
  },
  {
    slug: 'feeling-category-pill',
    title: 'Feeling Category Pill',
    Component: FeelingCategoryPillDemo,
  },
  { slug: 'feeling-card', title: 'Feeling Card', Component: FeelingCardDemo },
  {
    slug: 'step-progress',
    title: 'Step Progress',
    Component: StepProgressDemo,
  },
  {
    slug: 'need-category-card',
    title: 'Need Category Card',
    Component: NeedCategoryCardDemo,
  },
  {
    slug: 'feeling-prompt',
    title: 'Feeling Prompt',
    Component: FeelingPromptDemo,
  },
  {
    slug: 'category-walk',
    title: 'Category Walk',
    Component: CategoryWalkDemo,
  },
]

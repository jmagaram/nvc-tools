import type { ReactNode } from 'react'
import FeelingCardDemo from './FeelingCardDemo.tsx'
import FeelingCategoryCardDemo from './FeelingCategoryCardDemo.tsx'
import FeelingCategoryPillDemo from './FeelingCategoryPillDemo.tsx'
import FeelingCategoryWalkDemo from './FeelingCategoryWalkDemo.tsx'
import FeelingPickerDemo from './FeelingPickerDemo.tsx'
import FeelingPromptDemo from './FeelingPromptDemo.tsx'
import ModalFrameDemo from './ModalFrameDemo.tsx'
import NeedCardDemo from './NeedCardDemo.tsx'
import NeedCategoryCardDemo from './NeedCategoryCardDemo.tsx'
import NeedCategoryPillDemo from './NeedCategoryPillDemo.tsx'
import NeedCategoryWalkDemo from './NeedCategoryWalkDemo.tsx'
import NeedPickerDemo from './NeedPickerDemo.tsx'
import NeedPromptDemo from './NeedPromptDemo.tsx'
import StepProgressDemo from './StepProgressDemo.tsx'

/**
 * The headings on the home page, in the order they appear. A component belongs
 * to the dataset it renders; the ones that render neither are shared.
 */
export const groups = ['Feelings', 'Needs', 'Shared'] as const

export type Group = (typeof groups)[number]

export type Demo = {
  slug: string
  title: string
  group: Group
  Component: () => ReactNode
}

/*
 * Within a group, widest scope first: the picker walks every category, the walk
 * walks one, the prompt asks about one word, and the cards and pill just show
 * one thing. Feelings and needs run in the same order, so the two lists read as
 * translations of each other.
 */
export const demos: Demo[] = [
  {
    slug: 'feeling-picker',
    title: 'Feeling Picker',
    group: 'Feelings',
    Component: FeelingPickerDemo,
  },
  {
    slug: 'feeling-category-walk',
    title: 'Feeling Category Walk',
    group: 'Feelings',
    Component: FeelingCategoryWalkDemo,
  },
  {
    slug: 'feeling-prompt',
    title: 'Feeling Prompt',
    group: 'Feelings',
    Component: FeelingPromptDemo,
  },
  {
    slug: 'feeling-card',
    title: 'Feeling Card',
    group: 'Feelings',
    Component: FeelingCardDemo,
  },
  {
    slug: 'feeling-category-card',
    title: 'Feeling Category Card',
    group: 'Feelings',
    Component: FeelingCategoryCardDemo,
  },
  {
    slug: 'feeling-category-pill',
    title: 'Feeling Category Pill',
    group: 'Feelings',
    Component: FeelingCategoryPillDemo,
  },

  {
    slug: 'need-picker',
    title: 'Need Picker',
    group: 'Needs',
    Component: NeedPickerDemo,
  },
  {
    slug: 'need-category-walk',
    title: 'Need Category Walk',
    group: 'Needs',
    Component: NeedCategoryWalkDemo,
  },
  {
    slug: 'need-prompt',
    title: 'Need Prompt',
    group: 'Needs',
    Component: NeedPromptDemo,
  },
  {
    slug: 'need-card',
    title: 'Need Card',
    group: 'Needs',
    Component: NeedCardDemo,
  },
  {
    slug: 'need-category-card',
    title: 'Need Category Card',
    group: 'Needs',
    Component: NeedCategoryCardDemo,
  },
  {
    slug: 'need-category-pill',
    title: 'Need Category Pill',
    group: 'Needs',
    Component: NeedCategoryPillDemo,
  },

  {
    slug: 'modal-frame',
    title: 'Modal Frame',
    group: 'Shared',
    Component: ModalFrameDemo,
  },
  {
    slug: 'step-progress',
    title: 'Step Progress',
    group: 'Shared',
    Component: StepProgressDemo,
  },
]

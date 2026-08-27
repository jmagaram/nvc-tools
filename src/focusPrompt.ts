import { useEffect, useRef } from 'react'

/**
 * A walk, as far as this needs to know it: which category, and how many
 * questions have been answered. Both pickers' walk states fit, and so do the
 * single-category walks.
 */
type WalkLike = {
  category: string
  progress: { answered: readonly unknown[] }
}

/**
 * Put focus on the prompt each time a new word comes up.
 *
 * `FeelingPrompt` and `NeedPrompt` answer on the arrow keys, but only while
 * focus is inside them, and a walk opens from a card or a pill that is gone by
 * the time it does — so without this the first question wants a click or a Tab
 * that none of the rest do. Whether to take focus is the host's call, which is
 * why it is a hook here rather than an effect in the component.
 *
 * The prompt marks itself with `data-prompt` for this, so there is nothing to
 * thread a ref through the picker for. Returns the ref to put on the element
 * the prompt is rendered inside — the scrolling body of a modal, or whatever
 * wraps the walk on a demo page.
 */
export function useFocusPrompt(walk: WalkLike | null) {
  const bodyRef = useRef<HTMLDivElement>(null)

  // A new category, or one more answer given, means a different word on screen.
  const question = walk ? `${walk.category}:${walk.progress.answered.length}` : null

  useEffect(() => {
    if (question === null) return
    bodyRef.current?.querySelector<HTMLElement>('[data-prompt]')?.focus()
  }, [question])

  return bodyRef
}

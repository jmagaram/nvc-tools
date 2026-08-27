import { useEffect, useRef } from 'react'

/**
 * A walk, as far as this needs to know it: which category, and how many
 * questions have been answered. Both pickers' walk states fit.
 */
type WalkLike = {
  category: string
  progress: { answered: readonly unknown[] }
}

/**
 * Put focus on the prompt each time a new word comes up.
 *
 * `FeelingPrompt` and `NeedPrompt` answer on the arrow keys but leave it to the
 * host to decide whether they take focus the moment they appear — and in a
 * modal they should, or the first question would want a click that none of the
 * rest do. The prompt is the one `role="group"` in the body, so there is
 * nothing to thread a ref through the picker for.
 *
 * Returns the ref to put on the scrolling body.
 */
export function useFocusPrompt(walk: WalkLike | null) {
  const bodyRef = useRef<HTMLDivElement>(null)

  // A new category, or one more answer given, means a different word on screen.
  const question = walk ? `${walk.category}:${walk.progress.answered.length}` : null

  useEffect(() => {
    if (question === null) return
    bodyRef.current?.querySelector<HTMLElement>('[role="group"]')?.focus()
  }, [question])

  return bodyRef
}

import { useEffect, useRef } from 'react'

/**
 * Put focus on whichever screen is showing, each time it changes.
 *
 * A screen names itself twice over. In the DOM it marks its focusable element
 * with `data-prompt` or `data-browse`, and in the machine `screenKey` returns a
 * string starting with the same word — so this hook needs to know neither
 * picker, only that the two agree. Anything else a machine puts in the key is
 * what counts as a different screen: a new word to answer, the other tab, the
 * category just walked. Change the key and focus moves.
 *
 * Walking, the target is the prompt: `FeelingPrompt` and `NeedPrompt` answer on
 * the arrow keys, but only while focus is inside them, and a walk opens from a
 * card or a pill that is gone by the time it does — so without this the first
 * question wants a click or a Tab that none of the rest do.
 *
 * Browsing, it is the category just walked, or the chosen tab before anything
 * has been. Both matter for the same reason the prompt does: a host's chrome
 * sits outside this subtree — Obsidian focuses the modal element, which is an
 * ancestor, and `Back` and `Skip Rest` are portalled elsewhere — so otherwise
 * there is nothing focused for Tab to carry on from, and the picker's own arrow
 * keys have nowhere to land.
 *
 * Whether to take focus at all is the host's call, which is why it is a hook
 * here rather than an effect in the component. Returns the ref to put on the
 * element the screens are rendered inside: the scrolling body of a modal, or
 * whatever wraps the picker on a demo page.
 */
export function useFocusScreen(screenKey: string) {
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const kind = screenKey.split(':')[0]
    // `preventScroll`, because focusing scrolls the element into view by
    // default and a prompt is taller than a short modal's body — enough for a
    // scrolling host to settle on the bottom of it and leave the top edge, ring
    // and all, above the fold. Every screen here belongs at the top of its box,
    // which is where a host that has just swapped one for the other already is.
    bodyRef.current
      ?.querySelector<HTMLElement>(`[data-${kind}]`)
      ?.focus({ preventScroll: true })
  }, [screenKey])

  return bodyRef
}

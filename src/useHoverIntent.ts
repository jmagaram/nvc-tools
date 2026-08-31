import { useCallback, useEffect, useRef } from 'react'

/**
 * Tell dwelling on a word from travelling across it.
 *
 * The grid is a wrapping cloud of words with one strip underneath saying what
 * the pointed-at word means. Without a delay, crossing the grid to reach
 * anything below it rewrites that strip once per word passed — a flicker on the
 * way to somewhere else, and, when the strip was also what actions applied to,
 * the reason nothing under the grid could be aimed at.
 *
 * So a preview is a thing you ask for by stopping. Fast diagonal travel never
 * retargets it; resting on a word for a beat does.
 *
 * The timer lives in a ref rather than in state: nothing renders differently
 * while it is pending, and the whole point is that the screen does not move
 * until it fires. A hook rather than an effect inside the component, for the
 * same reason `usePressDelay` is one — a component here is props in, JSX out,
 * and a timer is neither.
 *
 * `prefers-reduced-motion` is not consulted. The delay is not an animation and
 * shortening it would not help anyone: it is there to read intent, and someone
 * who has asked for less movement wants *fewer* strips flying past, not more.
 */
export function useHoverIntent(
  onShow: (word: string) => void,
  onClear: () => void,
  delayMs = 150,
) {
  const timer = useRef<number | null>(null)
  // Both callbacks are inline closures at every call site, so they are read
  // through refs rather than named as dependencies: a stale read would show
  // the word the last render was about. Written in an effect, which is where
  // React allows a ref to be written.
  const showRef = useRef(onShow)
  const clearRef = useRef(onClear)
  useEffect(() => {
    showRef.current = onShow
    clearRef.current = onClear
  })

  const cancel = useCallback(() => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current)
      timer.current = null
    }
  }, [])

  // Nothing may be left pending past the life of the grid — a category swapped
  // for another one would otherwise preview a word that is no longer on screen.
  useEffect(() => cancel, [cancel])

  /** The pointer has arrived on `word`. Restarts the wait. */
  const enter = useCallback(
    (word: string) => {
      cancel()
      timer.current = window.setTimeout(() => {
        timer.current = null
        showRef.current(word)
      }, delayMs)
    },
    [cancel, delayMs],
  )

  /**
   * The pointer has left the grid. Drops any wait and puts the strip back to
   * the anchored word at once — leaving is unambiguous in a way that arriving
   * is not, so it is not worth a delay of its own.
   */
  const leave = useCallback(() => {
    cancel()
    clearRef.current()
  }, [cancel])

  return { enter, leave }
}

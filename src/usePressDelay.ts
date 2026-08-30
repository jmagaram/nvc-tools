import { useEffect, useRef, useState } from 'react'

/**
 * Make a press visible before whatever it does next replaces the screen it
 * happened on.
 *
 * A mouse click leaves `:active` painted for as long as the button is held
 * down, which is long enough to see. A keyboard Enter fires its `click` on the
 * same `keydown` that presses the key, so there is no gap for the browser to
 * paint anything before the handler runs — pressing a card or a pill open a
 * category is exactly this: the sift or the walk it opens replaces the button
 * before a frame of its own pressed state ever shows.
 *
 * So the press is held in state rather than in `:active`, and `activate` is
 * called a beat later rather than at once. `pressed` marks the element for
 * whatever CSS draws the press; the delay is the CSS transition's own
 * duration, so it does not run out before the animation finishes.
 *
 * The delay lands on every activation, mouse included — the alternative is
 * two paths that feel different depending on what pressed the button, and the
 * mouse's own gap is already close to this one.
 */
export function usePressDelay(activate: () => void, delayMs = 120) {
  const [pressed, setPressed] = useState(false)
  // `activate` is an inline closure at nearly every call site, so it is read
  // through a ref rather than named in the timeout's dependency — a stale
  // read would call whatever the last screen was, not this one. Written in an
  // effect rather than during render, which React refs must not be read or
  // written in.
  const activateRef = useRef(activate)
  useEffect(() => {
    activateRef.current = activate
  })

  useEffect(() => {
    if (!pressed) return
    // The CSS this pairs with drops its own transition under reduced motion,
    // so there is nothing left to wait for and holding the delay would only
    // slow the button down for no animation anyone sees.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
      .matches
    const timer = window.setTimeout(
      () => activateRef.current(),
      reduced ? 0 : delayMs,
    )
    return () => window.clearTimeout(timer)
  }, [pressed, delayMs])

  const onClick = () => setPressed(true)

  return { pressed, onClick }
}

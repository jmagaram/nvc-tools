import { useEffect } from 'react'

/**
 * Whether this is running where the modifier key is Command rather than
 * Control — the one thing the shortcut's label needs to know. Checked once at
 * import time: the platform a session runs in does not change under it.
 */
const isMac =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

/**
 * What `⌘Enter` reads as on this platform, for printing on the button it
 * shortcuts. Mac spells it in the symbols its own menus use; everywhere else
 * spells it out, because Windows and Linux have no glyph for Ctrl the way Mac
 * has one for the two keys either side of a modal's return.
 */
export const submitShortcutLabel = isMac ? '⌘⏎' : 'Ctrl+Enter'

/**
 * Command/Ctrl+Enter as a second way to press whichever button just committed
 * the whole dialog — `Insert`, `Save`. Plain Enter is left alone everywhere
 * else in a picker: it is what already toggles a pill and opens a category,
 * both real buttons taking the keypress natively, and a global handler for
 * plain Enter would race that or swallow it. The modifier makes this a
 * distinct keystroke that cannot collide with either.
 *
 * `enabled` is the screen the button itself is drawn on — the categories, not
 * a walk or a sift, which have no such button to stand in for. Passing it
 * rather than gating inside the effect keeps one hook doing one thing: a host
 * decides when the shortcut applies by deciding when to turn it on.
 */
export function useSubmitShortcut(enabled: boolean, onSubmit: () => void) {
  useEffect(() => {
    if (!enabled) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Enter') return
      if (!(isMac ? e.metaKey : e.ctrlKey)) return
      e.preventDefault()
      onSubmit()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [enabled, onSubmit])
}

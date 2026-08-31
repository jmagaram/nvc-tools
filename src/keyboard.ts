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

/**
 * `n` as the way to write about the word a grid is showing.
 *
 * On the window rather than on the grid, because the grid is not where the
 * focus necessarily is: the two ways on from a sift — `Ask me about each` and
 * `Done` — live in the modal's button row, which is a sibling of the content
 * and outside every region the picker draws. Tabbing to `Done` and pressing
 * `n` did nothing, which is the sort of dead key nobody reports and everybody
 * notices.
 *
 * Plain `n`, so anything being typed into has to be let through — the note box
 * itself most of all, which is where the letter is most likely to be typed.
 * A modifier means the keystroke belongs to the host, the same rule the grid
 * used when it owned this.
 *
 * `enabled` is the screen this applies to, decided by the host the way
 * `useSubmitShortcut` is: a walk answers `n` inside its own region, having no
 * button row to lose focus to.
 */
export function useNoteShortcut(enabled: boolean, onNote: () => void) {
  useEffect(() => {
    if (!enabled) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'n' && e.key !== 'N') return
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const target = e.target as HTMLElement | null
      if (target?.isContentEditable) return
      const tag = target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      e.preventDefault()
      onNote()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [enabled, onNote])
}

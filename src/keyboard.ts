import { useEffect } from 'react'

/**
 * A chord in the three forms a button needs it in: printed on itself, spoken,
 * and recognised in a keypress. One value rather than three exports, so a host
 * decides the platform once and everything that says the chord agrees.
 */
export type SubmitShortcut = {
  /**
   * What the chord reads as on the button it shortcuts. Mac spells the modifier
   * in the symbol its own menus use; everywhere else spells it out, because
   * Windows and Linux have no glyph for Ctrl the way Mac has one. The return
   * key keeps its glyph on both, because a hint printed on a button is a keycap
   * and not a sentence — spelled out, `Ctrl+Enter` came to more width than the
   * word it was hanging off, and the two platforms drew buttons of quite
   * different shapes.
   */
  label: string
  /**
   * The same chord for `aria-keyshortcuts`, which has a spelling of its own and
   * takes neither the glyphs nor the arrow. The label on screen is `aria-hidden`
   * decoration on the button beside this: read out, it would put 'Ctrl Enter'
   * into the name of every commit button.
   */
  keys: string
  /** Whether a keypress is this chord. */
  pressed: (e: KeyboardEvent) => boolean
}

/**
 * Command/Ctrl+Enter, spelled for the platform the host says it is on.
 *
 * Which platform that is belongs to the host, not to this module. The plugin
 * knows from Obsidian's own `Platform.isMacOS` — the answer the app itself uses
 * to choose between command- and ctrl-based hotkeys, and the one the community
 * scanner asks a plugin to use. The gallery is a web page with no such API and
 * asks the user agent. Deciding it here would put one surface's answer in code
 * the other one ships.
 */
export function submitShortcutFor(isMac: boolean): SubmitShortcut {
  return {
    label: isMac ? '⌘⏎' : 'Ctrl+⏎',
    keys: isMac ? 'Meta+Enter' : 'Control+Enter',
    pressed: (e) => e.key === 'Enter' && (isMac ? e.metaKey : e.ctrlKey),
  }
}

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
export function useSubmitShortcut(
  shortcut: SubmitShortcut,
  enabled: boolean,
  onSubmit: () => void,
) {
  useEffect(() => {
    if (!enabled) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (!shortcut.pressed(e)) return
      e.preventDefault()
      onSubmit()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [shortcut, enabled, onSubmit])
}

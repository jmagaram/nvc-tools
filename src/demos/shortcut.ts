import { submitShortcutFor } from '../keyboard.ts'

/**
 * The commit chord as the gallery says it. There is no Obsidian here to ask, so
 * the user agent answers — and only here: the gallery never ships, which is why
 * the plugin's own answer lives in `obsidian/shortcut.ts` and asks
 * `Platform.isMacOS` instead. Read once at import time, the platform a session
 * runs in not changing under it.
 */
export const submitShortcut = submitShortcutFor(
  typeof navigator !== 'undefined' &&
    /Mac|iPhone|iPad/.test(navigator.userAgent),
)

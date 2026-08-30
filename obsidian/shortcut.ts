import { Platform } from 'obsidian'
import { submitShortcutFor } from '../src/keyboard.ts'

/**
 * The commit chord as the plugin says it. `Platform.isMacOS` is Obsidian's own
 * answer to this question — it is true on iPhone and iPad too, which is what
 * the app means by it: use command-based hotkeys rather than ctrl-based ones.
 * Asking the user agent instead is what `obsidianmd/platform` exists to catch.
 */
export const submitShortcut = submitShortcutFor(Platform.isMacOS)

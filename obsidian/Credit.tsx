/**
 * The CNVC credit, which the gallery carries on its home page and a plugin has
 * to carry somewhere of its own.
 *
 * CNVC gives permission to copy and share the inventory and asks to be credited
 * for it. This sits under the categories rather than in a settings tab, because
 * a tab nobody opens is a weaker way of doing that. Only the words are theirs —
 * the definitions on each card were written for this project.
 */
export default function Credit() {
  return (
    <p className="nvc-credit">
      Feelings and needs from the Feelings and Needs Inventory, © 2023 Center
      for Nonviolent Communication, cnvc.org.
    </p>
  )
}

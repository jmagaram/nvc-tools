/** A screen to stand a modal inside, so a phone can be looked at on a laptop. */
export type Device = {
  label: string
  /** CSS viewport pixels, not hardware pixels. */
  width: number
  height: number
  /** Which shape `ModalFrame` takes on this screen. */
  size: 'phone' | 'desktop'
}

/*
 * Width and shape travel together on purpose: picking them apart would let the
 * demo ask for phone chrome at desktop width, which is not a screen anyone has.
 *
 * These are the whole viewport — the window the modal opens over, not the modal.
 * A phone loses some of it to the status bar and the keyboard, so treat the
 * phone heights as the best case. `ModalFrame` takes the modal's own size from
 * Obsidian's `--dialog-*` defaults.
 */
export const devices: Device[] = [
  { label: 'iPhone SE', width: 375, height: 667, size: 'phone' },
  { label: 'iPhone 16', width: 393, height: 852, size: 'phone' },
  { label: 'iPhone 16 Pro Max', width: 440, height: 956, size: 'phone' },
  { label: 'Desktop', width: 720, height: 760, size: 'desktop' },
]

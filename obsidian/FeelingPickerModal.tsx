import { App, Modal } from 'obsidian'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import type { Visited } from '../src/machines/feelingPicker.ts'
import FeelingPickerHost from './FeelingPickerHost.tsx'

/**
 * Ask about feelings in an Obsidian modal.
 *
 * Obsidian's `Modal` brings the chrome `ModalFrame` stands in for in the
 * gallery — backdrop, focus trap, title bar, close button, Escape — so none of
 * that is rebuilt here and `ModalFrame` itself is never imported. All this
 * class does is own a React root and hand the host the title bar to draw into.
 *
 * Closing is cancelling, by the corner `x` or by Escape alike: both land in
 * `onClose`, which unmounts without submitting. That matches every other modal
 * in Obsidian, and the count on OK makes what is at stake visible first.
 */
export default class FeelingPickerModal extends Modal {
  private root: Root | null = null
  private onSubmit: (entries: Visited[]) => void

  constructor(app: App, onSubmit: (entries: Visited[]) => void) {
    super(app)
    this.onSubmit = onSubmit
  }

  onOpen() {
    this.modalEl.addClass('nvc-modal')
    this.root = createRoot(this.contentEl)
    this.root.render(
      <FeelingPickerHost
        titleEl={this.titleEl}
        onSubmit={(entries) => {
          this.onSubmit(entries)
          this.close()
        }}
        onCancel={() => this.close()}
      />,
    )
  }

  onClose() {
    this.root?.unmount()
    this.root = null
    this.contentEl.empty()
    this.titleEl.empty()
  }
}

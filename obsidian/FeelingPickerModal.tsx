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
 * class does is own a React root and give the host the two elements Obsidian
 * wants its title and buttons in.
 *
 * Closing is cancelling, by the corner `x` or by Escape alike: both land in
 * `onClose`, which unmounts without submitting. That matches every other modal
 * in Obsidian, and the count on OK makes what is at stake visible first.
 */
export default class FeelingPickerModal extends Modal {
  private root: Root | null = null
  private footerEl: HTMLElement | null = null
  private onSubmit: (entries: Visited[]) => void

  constructor(app: App, onSubmit: (entries: Visited[]) => void) {
    super(app)
    this.onSubmit = onSubmit
  }

  onOpen() {
    /* 'mod-scrollable-content' is Obsidian's own three-row modal: a title bar
       and a button row that keep their height, and a body that scrolls between
       them. It is what every scrollable modal in the app uses, and what
       'ModalFrame' previews in the gallery. It only works if the button row is
       a sibling of the content, so the row is made here and handed to the host
       to fill. */
    this.modalEl.addClasses(['nvc-modal', 'mod-scrollable-content'])
    this.footerEl = this.modalEl.createDiv('modal-button-container')

    this.root = createRoot(this.contentEl)
    this.root.render(
      <FeelingPickerHost
        titleEl={this.titleEl}
        footerEl={this.footerEl}
        onSubmit={(entries) => {
          this.onSubmit(entries)
          this.close()
        }}
        onCancel={() => this.close()}
      />,
    )
  }

  onClose() {
    // Unmount before the elements React is portalling into go away.
    this.root?.unmount()
    this.root = null
    this.footerEl?.remove()
    this.footerEl = null
    this.contentEl.empty()
    this.titleEl.empty()
  }
}

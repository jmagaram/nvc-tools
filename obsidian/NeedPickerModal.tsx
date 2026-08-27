import { App, Modal } from 'obsidian'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import type { Visited } from '../src/machines/needPicker.ts'
import NeedPickerHost from './NeedPickerHost.tsx'

/**
 * Ask about needs in an Obsidian modal.
 *
 * The twin of `FeelingPickerModal`, down to the close behaviour: Obsidian
 * brings the chrome, and closing by the corner `x` or by Escape cancels.
 */
export default class NeedPickerModal extends Modal {
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
      <NeedPickerHost
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

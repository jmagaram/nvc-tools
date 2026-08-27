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
  private onSubmit: (entries: Visited[]) => void

  constructor(app: App, onSubmit: (entries: Visited[]) => void) {
    super(app)
    this.onSubmit = onSubmit
  }

  onOpen() {
    this.modalEl.addClass('nvc-modal')
    this.root = createRoot(this.contentEl)
    this.root.render(
      <NeedPickerHost
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

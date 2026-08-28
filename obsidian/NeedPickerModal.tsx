import { App, Modal } from 'obsidian'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import type { Visited } from '../src/machines/needPicker.ts'
import NeedPickerHost from './NeedPickerHost.tsx'

/**
 * Ask about needs in an Obsidian modal.
 *
 * The twin of `FeelingPickerModal`, down to the close behaviour: Obsidian
 * brings the chrome, and closing leaves whatever is on top — the modal from
 * the categories, the walk from a walk.
 */
export default class NeedPickerModal extends Modal {
  private root: Root | null = null
  private footerEl: HTMLElement | null = null
  /** The way off the screen on top, unless it is the categories. See `close`. */
  private leaveTop: (() => void) | null = null
  private onSubmit: (entries: Visited[]) => void
  /** What a block already holds, when this was opened to edit one. */
  private initial: readonly Visited[] | undefined

  constructor(
    app: App,
    onSubmit: (entries: Visited[]) => void,
    initial?: readonly Visited[],
  ) {
    super(app)
    this.onSubmit = onSubmit
    this.initial = initial
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
        initial={this.initial}
        onLeaveTopChange={(leaveTop) => {
          this.leaveTop = leaveTop
        }}
        /* `dismiss` rather than `close`: these two are only ever reachable
           from the categories, where there is nothing above to leave, and
           saying so keeps them right if that ever stops being true. */
        onSubmit={(entries) => {
          this.onSubmit(entries)
          this.dismiss()
        }}
        onCancel={() => this.dismiss()}
      />,
    )
  }

  /**
   * The corner `x` and Escape both arrive here, and inside a category they mean
   * that screen rather than the modal — the one on top is what a dismiss is
   * about. The host leaves the way off it in `leaveTop` whenever there is one,
   * so this needs to know nothing about either picker, or about how many
   * screens deep they go.
   *
   * Going back keeps the picks, exactly as the way back in the title bar does.
   * The two are synonyms on purpose: one of them is labelled and one is where
   * a thumb already goes, and with both meaning the same thing there is
   * nothing inside a category that can throw work away. Losing everything is
   * still one gesture, but only from the categories, where all of it is on
   * screen to lose.
   */
  close() {
    const leaveTop = this.leaveTop
    if (leaveTop) {
      leaveTop()
      return
    }
    this.dismiss()
  }

  /** Close for real, past the guard in `close`. */
  private dismiss() {
    super.close()
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

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
 * Closing leaves whatever is on top. From the categories that is the modal, by
 * the corner `x` or by Escape alike, and it inserts nothing — the count on
 * `Insert` makes what is at stake visible first. From a walk it is the walk
 * that goes,
 * back to the categories with its picks kept, the same as the way back in the
 * title bar beside it. Both gestures arrive as `close`, so the guard is there
 * rather than on either one of them, and nothing on the walk screen can lose a
 * pick.
 */
export default class FeelingPickerModal extends Modal {
  private root: Root | null = null
  private footerEl: HTMLElement | null = null
  /** The way off the screen on top, unless it is the categories. See `close`. */
  private leaveTop: (() => void) | null = null
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

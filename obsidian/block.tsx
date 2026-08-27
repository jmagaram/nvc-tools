import { MarkdownRenderChild, Menu, setIcon } from 'obsidian'
import type { MarkdownPostProcessorContext, Plugin } from 'obsidian'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import PickedEntries from '../src/components/PickedEntries.tsx'
import type { Format } from '../src/components/PickedEntries.tsx'
import { languageFor, languages, parseBlock } from './insert.ts'

/** The layouts on offer, in the order the menu lists them. */
const CHOICES: { format: Format; title: string; icon: string }[] = [
  { format: 'list', title: 'As a list', icon: 'list' },
  { format: 'table', title: 'As a table', icon: 'table' },
  { format: 'inline', title: 'As comma separated', icon: 'text' },
]

/** A fence line for one of our languages, and nothing else. */
const FENCE = /^(\s*(?:`{3,}|~{3,}))nvc(?:-[a-z]+)?\s*$/

/**
 * Teach the plugin to draw its own blocks.
 *
 * One registration per language, because a code block processor is handed the
 * block's body and never the info string — so `nvc-table` is the only way for
 * the layout to be known without reading the note back off disk.
 */
export function registerBlocks(plugin: Plugin) {
  for (const [language, format] of Object.entries(languages)) {
    plugin.registerMarkdownCodeBlockProcessor(language, (source, el, ctx) => {
      render(plugin, source, el, ctx, format)
    })
  }
}

function render(
  plugin: Plugin,
  source: string,
  el: HTMLElement,
  ctx: MarkdownPostProcessorContext,
  format: Format,
) {
  const entries = parseBlock(source)
  if (!entries) {
    /* Someone has typed something we cannot read back. Show it as the code
       block it looks like rather than drawing an empty one — whatever is in
       there is theirs, and losing it would be the worse failure. */
    el.createEl('pre').createEl('code', { text: source })
    return
  }

  el.addClass('nvc-block')
  const root = createRoot(el.createDiv())
  root.render(<PickedEntries entries={entries} format={format} />)
  ctx.addChild(new ReactBlock(el, root))

  /* Right-click is the desktop gesture and the button is everything else:
     there is no right-click on mobile, and a visible control is how anyone
     finds out the layout can be changed at all. */
  const button = el.createEl('button', {
    cls: 'nvc-block-menu',
    attr: { type: 'button', 'aria-label': 'Change layout' },
  })
  setIcon(button, 'more-horizontal')
  button.addEventListener('click', (evt) => {
    evt.preventDefault()
    showMenu(plugin, ctx, el, format, evt)
  })

  el.addEventListener('contextmenu', (evt) => {
    // Nothing to offer where the block has no line in a file — leave Obsidian's
    // own menu alone rather than replacing it with one that cannot do anything.
    if (!ctx.getSectionInfo(el)) return
    evt.preventDefault()
    showMenu(plugin, ctx, el, format, evt)
  })
}

function showMenu(
  plugin: Plugin,
  ctx: MarkdownPostProcessorContext,
  el: HTMLElement,
  current: Format,
  evt: MouseEvent,
) {
  const menu = new Menu()
  for (const choice of CHOICES) {
    menu.addItem((item) =>
      item
        .setTitle(choice.title)
        .setIcon(choice.icon)
        .setChecked(choice.format === current)
        .onClick(() => setFormat(plugin, ctx, el, choice.format)),
    )
  }
  menu.showAtMouseEvent(evt)
}

/**
 * Redraw this block by rewriting its fence line in the note.
 *
 * The choice belongs in the note rather than in a setting so that each block
 * keeps the shape it was left in, on every device.
 */
async function setFormat(
  plugin: Plugin,
  ctx: MarkdownPostProcessorContext,
  el: HTMLElement,
  format: Format,
) {
  /* Null inside a hover popover, an embed, or an export: the block on screen
     has no line of its own to change. */
  const info = ctx.getSectionInfo(el)
  if (!info) return

  const file = plugin.app.vault.getFileByPath(ctx.sourcePath)
  if (!file) return

  // `process` rather than read-then-write, so an edit landing in the same
  // moment is not thrown away.
  await plugin.app.vault.process(file, (data) => {
    const lines = data.split('\n')
    const fence = FENCE.exec(lines[info.lineStart] ?? '')
    // The note may have changed under a block drawn a while ago. Rewrite only a
    // line that is still one of our fences.
    if (!fence) return data
    lines[info.lineStart] = `${fence[1]}${languageFor(format)}`
    return lines.join('\n')
  })
}

/** Ties the React root's life to the rendered block's. */
class ReactBlock extends MarkdownRenderChild {
  private root: Root

  constructor(el: HTMLElement, root: Root) {
    super(el)
    this.root = root
  }

  onunload() {
    this.root.unmount()
  }
}

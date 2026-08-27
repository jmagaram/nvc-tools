import { MarkdownRenderChild, Menu, setIcon } from 'obsidian'
import type {
  Editor,
  MarkdownPostProcessorContext,
  MarkdownSectionInformation,
  MarkdownView,
  Plugin,
} from 'obsidian'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import PickedEntries from '../src/components/PickedEntries.tsx'
import type { Format } from '../src/components/PickedEntries.tsx'
import {
  languageFor,
  languages,
  parseBlock,
  toPlainMarkdown,
} from './insert.ts'

/** The layouts on offer, in the order the menu lists them. */
const CHOICES: { format: Format; title: string; icon: string }[] = [
  { format: 'list', title: 'As a list', icon: 'list' },
  { format: 'table', title: 'As a table', icon: 'table' },
  { format: 'inline', title: 'As comma separated', icon: 'text' },
]

/** A fence line for one of our languages, and nothing else. */
const FENCE = /^(\s*(?:`{3,}|~{3,}))nvc(?:-[a-z]+)?\s*$/

/** The line that closes one. */
const CLOSING = /^\s*(?:`{3,}|~{3,})\s*$/

/**
 * A change to make to the note: `text` replaces lines `from` through `to`.
 * Null when the note no longer looks the way the block was drawn from, which is
 * always a reason to do nothing rather than to guess.
 */
type Change = { text: string; from: number; to: number } | null

type Replace = (
  lines: string[],
  info: MarkdownSectionInformation,
) => Change

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
    attr: { type: 'button', 'aria-label': 'Block options' },
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

  /* The way out. One item rather than three, using the layout on screen: you
     can already see what you are about to get. */
  menu.addSeparator()
  menu.addItem((item) =>
    item
      .setTitle('Convert to Markdown')
      .setIcon('file-text')
      .onClick(() => unwrap(plugin, ctx, el, current)),
  )

  menu.showAtMouseEvent(evt)
}

/**
 * Redraw this block by rewriting its fence line.
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
  await rewrite(plugin, ctx, el, (lines, info) => {
    const fence = fenceAt(lines, info.lineStart)
    if (fence === null) return null
    return {
      text: `${fence}${languageFor(format)}`,
      from: info.lineStart,
      to: info.lineStart,
    }
  })
}

/**
 * Replace the block with the markdown it is drawing, and let go of it.
 *
 * One way on purpose. Past here the text is a table or a list like any other,
 * which is the whole point — Obsidian's table editor can add a column to it, and
 * this plugin has no further claim on it.
 */
async function unwrap(
  plugin: Plugin,
  ctx: MarkdownPostProcessorContext,
  el: HTMLElement,
  format: Format,
) {
  await rewrite(plugin, ctx, el, (lines, info) => {
    if (fenceAt(lines, info.lineStart) === null) return null
    if (!CLOSING.test(lines[info.lineEnd] ?? '')) return null

    // Read the body out of the note rather than trusting what was drawn from —
    // it may have been edited since.
    const body = lines.slice(info.lineStart + 1, info.lineEnd).join('\n')
    const entries = parseBlock(body)
    if (!entries) return null

    const parts = [toPlainMarkdown(entries, format)]
    /* A fence may interrupt a paragraph; a table may not. Text on the line
       above would swallow it and leave a row of literal pipes on screen. */
    if (format === 'table') {
      if (lines[info.lineStart - 1]?.trim()) parts.unshift('')
      if (lines[info.lineEnd + 1]?.trim()) parts.push('')
    }

    return {
      text: parts.join('\n'),
      from: info.lineStart,
      to: info.lineEnd,
    }
  })
}

/** The fence marker opening this line, or null if it is not one of ours. */
function fenceAt(lines: string[], line: number): string | null {
  const match = FENCE.exec(lines[line] ?? '')
  return match ? match[1] : null
}

/**
 * Make a change to the note this block came from.
 *
 * Through the editor whenever the note is open in one, so the change is a
 * single entry on the undo stack — losing a conversion to a stray click would
 * be much worse than losing a layout switch. `vault.process` is the fallback
 * for a block rendered where no editor holds the file (a canvas, an export),
 * and is still the right call there for not clobbering a concurrent write.
 *
 * `replace` runs against whichever copy of the note is about to be written, so
 * it is checking the lines it is actually changing.
 */
async function rewrite(
  plugin: Plugin,
  ctx: MarkdownPostProcessorContext,
  el: HTMLElement,
  replace: Replace,
) {
  /* Null inside a hover popover, an embed, or an export: the block on screen
     has no lines of its own to change. */
  const info = ctx.getSectionInfo(el)
  if (!info) return

  const editor = editorFor(plugin, ctx.sourcePath)
  if (editor) {
    const change = replace(editor.getValue().split('\n'), info)
    if (!change) return
    editor.replaceRange(
      change.text,
      { line: change.from, ch: 0 },
      { line: change.to, ch: editor.getLine(change.to).length },
    )
    return
  }

  const file = plugin.app.vault.getFileByPath(ctx.sourcePath)
  if (!file) return
  await plugin.app.vault.process(file, (data) => {
    const lines = data.split('\n')
    const change = replace(lines, info)
    if (!change) return data
    lines.splice(change.from, change.to - change.from + 1, change.text)
    return lines.join('\n')
  })
}

/** The editor holding this note, if one is open on it. */
function editorFor(plugin: Plugin, path: string): Editor | null {
  for (const leaf of plugin.app.workspace.getLeavesOfType('markdown')) {
    const view = leaf.view as MarkdownView
    if (view.file?.path === path) return view.editor
  }
  return null
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

import { Plugin } from 'obsidian'
import type { Editor } from 'obsidian'
import FeelingPickerModal from './FeelingPickerModal.tsx'
import NeedPickerModal from './NeedPickerModal.tsx'
import { toMarkdown } from './insert.ts'
// The modal's own three rules. Everything else in the shipped styles.css comes
// from the components' CSS modules, which the build folds into the same file.
import './styles.css'

/** A category and what was picked in it, as either picker reports it. */
type Picked = {
  category: string
  words: readonly string[]
}

export default class NvcPlugin extends Plugin {
  onload() {
    /* `editorCallback` rather than `callback`, so neither command offers itself
       when there is no note open — there would be nowhere to put the answer. */
    this.addCommand({
      id: 'insert-feelings',
      name: 'Insert feelings…',
      editorCallback: (editor) => {
        new FeelingPickerModal(this.app, (entries) =>
          insert(editor, entries),
        ).open()
      },
    })

    this.addCommand({
      id: 'insert-needs',
      name: 'Insert needs…',
      editorCallback: (editor) => {
        new NeedPickerModal(this.app, (entries) =>
          insert(editor, entries),
        ).open()
      },
    })
  }
}

/**
 * Put what was picked where the cursor is. Pressing OK having picked nothing
 * writes nothing — an empty line would be a worse answer than none.
 */
function insert(editor: Editor, entries: readonly Picked[]) {
  const text = toMarkdown(entries)
  if (text) editor.replaceSelection(`${text}\n`)
}

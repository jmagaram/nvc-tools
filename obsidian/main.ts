import { Plugin } from 'obsidian'
import type { Editor } from 'obsidian'
import type { Picked } from '../src/components/PickedEntries.tsx'
import { registerBlocks } from './block.tsx'
import FeelingPickerModal from './FeelingPickerModal.tsx'
import NeedPickerModal from './NeedPickerModal.tsx'
import { toBlock } from './insert.ts'
// The plugin's own chrome, for the modal and for a block in a note. Everything
// else in the shipped styles.css comes from the components' CSS modules, which
// the build folds into the same file.
import './styles.css'

export default class NvcPlugin extends Plugin {
  onload() {
    // Blocks first: a note open at load time is drawn before either command
    // can be reached.
    registerBlocks(this)

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
 * Put what was picked where the cursor is, as a block the plugin can redraw.
 * Pressing `Insert` having picked nothing writes nothing — an empty line would
 * be a worse answer than none.
 *
 * It always goes in as a list, the shape it had before there was a choice. Which
 * layout you want is a question about the note you are looking at, and it is
 * one right-click away once the words are actually on the page — so it is not
 * worth stopping the walk to ask.
 */
function insert(editor: Editor, entries: readonly Picked[]) {
  const text = toBlock(entries)
  if (text) editor.replaceSelection(`${text}\n`)
}

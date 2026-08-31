import type { Need, NeedCategory } from '../data/needs.ts'

/**
 * Sifting one category: every word in it at once, with the ones that apply
 * marked. This is the answer, not a shortlist — a walk started from here only
 * ever refines what is marked, and leaving with `Done` commits it as it stands.
 *
 * Which is why the question a host puts at the top has to be *which of these
 * apply* rather than *which might*: nothing here asks again, so nothing may be
 * marked on the understanding that it will be checked later.
 *
 * Kept line for line alongside `feelingCategorySift`, the way the two walks
 * and the two pickers are.
 */
/**
 * A few words of someone's own about one need. Never blank — an emptied box
 * is how a note is deleted — but not necessarily about a word that is still
 * marked: unmarking hides a note rather than destroying it, so that a mis-tap
 * on a phone, where reading a word costs a tap that also marks it, is one tap
 * to undo instead of a sentence to retype. `notesInSourceOrder` keeps the order
 * and drops the blanks; who may *see* one is decided where it is drawn.
 */
export type Note = {
  word: string
  text: string
}

/** The word a note is being written about, and what is in the box. */
export type Noting = {
  word: string
  draft: string
}

export type NeedCategorySiftState = {
  /** The category being sifted, e.g. 'Connection'. */
  category: string
  /**
   * Every need in the category, in the order the source lists them and
   * never shuffled. The walk shuffles so that no word is always first; a grid
   * shows all of them at once, where order counts for much less than being
   * able to find the word you saw a moment ago — including on the way back in.
   */
  words: readonly Need[]
  /** What applies. Held in `words` order, so re-entering looks the same. */
  marked: readonly string[]
  /**
   * The word every action on this screen applies to, and what the gloss strip
   * falls back to showing.
   *
   * Set only on purpose — a click, an arrow key, the pencil, focus arriving —
   * and never by the pointer merely passing over. That is the whole of why it
   * is separate from `preview`. When one field was both, the strip named
   * whichever word the mouse crossed last, so nothing underneath the grid
   * could be aimed at: the pointer retargeted the thing it was travelling
   * towards on its way there. A control can only belong to a word that holds
   * still.
   */
  anchor: string | null
  /**
   * What the pointer is dwelling on, if anything.
   *
   * Overrides what the strip *displays* and nothing else. It decides no action,
   * takes no focus, and is cleared the moment the pointer leaves the grid —
   * reading what a word means must cost nothing and commit to nothing.
   */
  preview: string | null
  /**
   * What has been written, in `words` order. Kept beside `marked` rather than
   * inside it because `marked` is what leaves the picker and is read by
   * everything downstream, and because the two no longer rise and fall
   * together: a note outlives the mark it was written under.
   */
  notes: readonly Note[]
  /** The note being written, or null when the grid is what is on top. */
  noting: Noting | null
}

export type NeedCategorySiftAction =
  /** Mark or unmark a word, and make it the one everything applies to. */
  | { type: 'toggle'; word: string }
  /**
   * Make `word` the one everything applies to, without marking it. A click, an
   * arrow key, or focus arriving on a pill.
   */
  | { type: 'anchor'; word: string }
  /**
   * Show a word's definition without committing to it, or `null` to stop.
   * Dispatched after the pointer has dwelt long enough to mean it, and with
   * `null` when it leaves the grid.
   */
  | { type: 'preview'; word: string | null }
  /**
   * Write a note about a word, or open the one already there. Refused for a
   * word that is not marked: there would be nothing to hang what was written
   * on, and nowhere to show it.
   */
  | { type: 'note'; word: string }
  /**
   * Write about the anchored word, without naming it.
   *
   * The same move as `note`, for a caller that cannot see which word that is.
   * The key belongs to the whole screen — it works with focus on the button
   * row, which is outside the grid — and a host listening that far out knows
   * only that it is looking at a sift. It follows the anchor and never the
   * preview: what a key does must not depend on where the mouse is resting.
   */
  | { type: 'noteAnchor' }
  /** What is in the box now. */
  | { type: 'draft'; text: string }
  /** Keep what is in the box. An emptied box deletes the note there was. */
  | { type: 'keepNote' }
  /** Close the drawer and leave the note as it was found. */
  | { type: 'dropNote' }

/**
 * Put `words` in the order the category lists them, and drop anything not in
 * it. Every write to `marked` goes through here, so the field cannot drift out
 * of order or hold a word this category never had.
 */
function inSourceOrder(
  words: readonly Need[],
  chosen: readonly string[],
): string[] {
  const wanted = new Set(chosen)
  return words
    .filter((need) => wanted.has(need.word))
    .map((need) => need.word)
}

/**
 * Put `notes` in the category's own order and drop the one kind that cannot
 * exist: a blank one, which is how a note is deleted.
 *
 * It deliberately does *not* drop notes on unmarked words. Unmarking hides a
 * note; it does not destroy it, so that unmarking a word by accident costs a
 * tap to undo rather than a sentence to retype — which matters most on a phone,
 * where the tap that reads a word is the same tap that marks it. Everywhere a
 * note is drawn or handed on it is gated on the mark instead: `marks` here,
 * `noted` in the pickers, and the sift screen itself.
 */
function notesInSourceOrder(
  words: readonly Need[],
  notes: readonly Note[],
): Note[] {
  const written = new Map(
    notes
      .filter((note) => note.text !== '')
      .map((note) => [note.word, note.text]),
  )
  return words
    .filter((need) => written.has(need.word))
    .map((need) => ({
      word: need.word,
      text: written.get(need.word)!,
    }))
}

/**
 * Start sifting `category`, with `alreadyPicked` marked. That is what makes
 * re-opening a category an edit rather than a fresh start.
 */
export function init(
  category: NeedCategory,
  alreadyPicked: readonly string[] = [],
  alreadyNoted: readonly Note[] = [],
): NeedCategorySiftState {
  return {
    category: category.name,
    words: category.needs,
    marked: inSourceOrder(category.needs, alreadyPicked),
    anchor: null,
    preview: null,
    notes: notesInSourceOrder(category.needs, alreadyNoted),
    noting: null,
  }
}

/**
 * Replace what is marked, and what is written, both normalised. How a walk
 * folds its answers back in — and the one door every change to either field
 * goes through, so that neither can drift out of the category's own order.
 */
export function withMarked(
  state: NeedCategorySiftState,
  chosen: readonly string[],
  notes: readonly Note[] = state.notes,
): NeedCategorySiftState {
  return {
    ...state,
    marked: inSourceOrder(state.words, chosen),
    notes: notesInSourceOrder(state.words, notes),
  }
}

export function reduce(
  state: NeedCategorySiftState,
  action: NeedCategorySiftAction,
): NeedCategorySiftState {
  switch (action.type) {
    case 'toggle': {
      const next = isMarked(state, action.word)
        ? state.marked.filter((word) => word !== action.word)
        : [...state.marked, action.word]
      // Marking is a deliberate act on a word, so it anchors — and clears the
      // preview, which would otherwise leave the strip describing a different
      // word than the one just tapped.
      return { ...withMarked(state, next), anchor: action.word, preview: null }
    }

    case 'anchor':
      return { ...state, anchor: action.word, preview: null }

    case 'preview':
      return { ...state, preview: action.word }

    case 'note': {
      // Whatever is half-written wins. There are three ways in now — the
      // pencil, the button and the key — and any of them arriving while the
      // drawer is already open would otherwise rebuild the box from what was
      // last saved and throw the draft away.
      if (state.noting) return state
      // Nothing to write on: a note belongs to a picked word, and this is the
      // only place that can be said once rather than in every host.
      if (!isMarked(state, action.word)) return state
      return {
        ...state,
        anchor: action.word,
        // Hover is suspended while the drawer is open, so nothing is left
        // pointed at underneath it.
        preview: null,
        noting: { word: action.word, draft: noteFor(state, action.word) ?? '' },
      }
    }

    case 'noteAnchor': {
      if (state.anchor === null) return state
      return reduce(state, { type: 'note', word: state.anchor })
    }

    case 'draft':
      return state.noting
        ? { ...state, noting: { ...state.noting, draft: action.text } }
        : state

    case 'keepNote': {
      if (!state.noting) return state
      const { word, draft } = state.noting
      // A blank box is the delete. Collapsed rather than only trimmed, and
      // here rather than in a host: a note is one line wherever it is kept, and
      // text pasted in from somewhere else is the way a line break gets in.
      const text = draft.replace(/\s+/g, ' ').trim()
      const rest = state.notes.filter((note) => note.word !== word)
      // The anchor is left alone: opening the drawer anchored this word, so
      // closing it lands focus back on that pill without anything here saying
      // so — `screenKey` flips from `note:` to `sift:` and the anchor it names
      // has not moved. That is the whole of what the old `resume` field was
      // for, and it is why there is no longer one.
      return {
        ...withMarked(state, state.marked, [...rest, { word, text }]),
        noting: null,
      }
    }

    case 'dropNote':
      return state.noting ? { ...state, noting: null } : state
  }
}

/** What is written about `word`, if anything. */
export function noteFor(
  state: NeedCategorySiftState,
  word: string,
): string | null {
  return state.notes.find((note) => note.word === word)?.text ?? null
}

/**
 * What is written about `word` and may be shown: nothing, if the word is not
 * marked. This is where the rule that a note belongs to a picked word is now
 * kept — it used to be kept by deleting the note, which made an unmark on a
 * phone, where the tap that reads a word also marks it, able to destroy a
 * sentence. Everything that draws a note reads this; only the drawer, restoring
 * a draft, reads `noteFor`.
 */
export function visibleNote(
  state: NeedCategorySiftState,
  word: string,
): string | null {
  return isMarked(state, word) ? noteFor(state, word) : null
}

/** Whether the drawer is open over the grid. */
export function isNoting(state: NeedCategorySiftState): boolean {
  return state.noting !== null
}

/**
 * The words with what is written about them, for a card or a summary. Built
 * from `marked`, which is what keeps a note written under a mark that was
 * later dropped from leaving this screen.
 */
export function marks(
  state: NeedCategorySiftState,
): { word: string; note?: string }[] {
  return state.marked.map((word) => {
    const note = noteFor(state, word)
    return note === null ? { word } : { word, note }
  })
}

/** Whether `word` is marked. */
export function isMarked(
  state: NeedCategorySiftState,
  word: string,
): boolean {
  return state.marked.includes(word)
}

/**
 * The need the gloss strip is showing: what the pointer is dwelling on if
 * anything, and the anchored word otherwise. The one place the two fields are
 * read together, because displaying is the only job the preview has.
 */
export function gloss(state: NeedCategorySiftState): Need | null {
  const word = state.preview ?? state.anchor
  return state.words.find((need) => need.word === word) ?? null
}

/**
 * The need everything on this screen applies to — the note button, the `n`
 * key, the arrow keys. Never the previewed word, which is why this is separate
 * from `gloss`: a control that followed the mouse could not be reached by it.
 */
export function anchored(state: NeedCategorySiftState): Need | null {
  return state.words.find((need) => need.word === state.anchor) ?? null
}

/**
 * The word carrying the grid's one tab stop.
 *
 * The anchor once there is one, and the first word before that — a roving
 * tabindex needs somewhere to rove from, and a grid nothing has been anchored
 * in yet must still be reachable by Tab. It is not the same as the anchor:
 * nothing is shown in the strip until a word is chosen on purpose.
 */
export function tabbable(state: NeedCategorySiftState): string | null {
  return state.anchor ?? state.words[0]?.word ?? null
}

/**
 * Which screen a host is looking at, for `useFocusScreen`. The category, the
 * anchored word, and whether a note is being written over it: the drawer is a
 * screen of its own, and opening one has to put focus in the box.
 *
 * The anchor is in the key because moving it *is* moving focus — that is what a
 * roving tabindex means, and it is how the arrow keys carry the focus ring from
 * pill to pill without this component ever calling `.focus()` itself. Closing
 * the drawer lands on the word just written about for the same reason.
 *
 * `preview` is deliberately absent, and so is what is marked. Neither is a
 * move: the pointer resting on a word must not steal the focus ring away from
 * the keyboard, and marking would take focus off whatever was just tapped, on
 * every tap.
 */
export function screenKey(state: NeedCategorySiftState): string {
  if (state.noting) return `note:${state.category}:${state.noting.word}`
  return `sift:${state.category}:${state.anchor ?? ''}`
}

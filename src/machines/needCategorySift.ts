import type { Need, NeedCategory } from '../data/needs.ts'

/**
 * Sifting one category: every word in it at once, with the ones that apply
 * marked. This is the answer, not a shortlist — a walk started from here only
 * ever refines what is marked, and leaving with `Done` commits it as it stands.
 *
 * Which is why the question a host puts at the top has to be *which of these
 * apply* rather than *which might*: nothing here asks again, so nothing may be
 * marked on the understanding that it will be checked later.
 */
/**
 * A few words of someone's own about one need. Never held for a word that is
 * not marked, and never blank: both are states the design says cannot exist —
 * there is nowhere to write a note about a need that was not picked, and an
 * emptied box is how a note is deleted. `notesInSourceOrder` is where that is
 * enforced, the same way `inSourceOrder` enforces it for the marks.
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
   * Every need in the category, in the order the source lists them and never
   * shuffled. The walk shuffles so that no word is always first; a grid shows
   * all of them at once, where order counts for much less than being able to
   * find the word you saw a moment ago — including on the way back in.
   */
  words: readonly Need[]
  /** What applies. Held in `words` order, so re-entering looks the same. */
  marked: readonly string[]
  /** Whose definition the gloss strip is showing, if any. */
  showing: string | null
  /**
   * What has been written about the marked words, in `words` order. Kept
   * beside `marked` rather than inside it because `marked` is what leaves the
   * picker and is read by everything downstream; every write to either goes
   * through `withMarked`, so a note cannot outlive the mark under it.
   */
  notes: readonly Note[]
  /** The note being written, or null when the grid is what is on top. */
  noting: Noting | null
  /**
   * The word the last note was about. Focus goes back to its pill when the
   * drawer closes, rather than to the grid as a whole — see `screenKey`. It
   * stays put afterwards so that reading a definition, which is not a new
   * screen, does not take focus off the word just written about.
   */
  resume: string | null
}

export type NeedCategorySiftAction =
  /** Mark or unmark a word, and show its definition. */
  | { type: 'toggle'; word: string }
  /**
   * Show a word's definition without marking it — hover, or focus arriving on
   * it. Without this, reading a gloss would mean marking a word and unmarking
   * it again, which is a state change to ask for a sentence.
   */
  | { type: 'show'; word: string }
  /**
   * Write a note about a word, or open the one already there. Refused for a
   * word that is not marked: there would be nowhere to keep what was written.
   */
  | { type: 'note'; word: string }
  /**
   * Write about whatever the strip is showing, without naming it.
   *
   * The same move as `note`, for a caller that cannot see which word that is.
   * The key belongs to the whole screen — it works with focus on the button
   * row, which is outside the grid — and a host listening that far out knows
   * only that it is looking at a sift.
   */
  | { type: 'noteShowing' }
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
 *
 * `safety` is listed under both `Connection` and `Physical Wellbeing` upstream,
 * so a word belonging to another category is not a hypothetical.
 */
function inSourceOrder(
  words: readonly Need[],
  chosen: readonly string[],
): string[] {
  const wanted = new Set(chosen)
  return words.filter((need) => wanted.has(need.word)).map((need) => need.word)
}

/**
 * Put `notes` in the category's own order and drop every one the design says
 * cannot exist: a note on a word that is not marked, and a blank one. Every
 * write to `marked` runs this, so unmarking a word takes its note with it
 * without anything having to remember to.
 */
function notesInSourceOrder(
  words: readonly Need[],
  marked: readonly string[],
  notes: readonly Note[],
): Note[] {
  const wanted = new Set(marked)
  const written = new Map(
    notes
      .filter((note) => note.text !== '')
      .map((note) => [note.word, note.text]),
  )
  return words
    .filter((need) => wanted.has(need.word) && written.has(need.word))
    .map((need) => ({ word: need.word, text: written.get(need.word)! }))
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
  const marked = inSourceOrder(category.needs, alreadyPicked)
  return {
    category: category.name,
    words: category.needs,
    marked,
    showing: null,
    notes: notesInSourceOrder(category.needs, marked, alreadyNoted),
    noting: null,
    resume: null,
  }
}

/** Replace what is marked, normalised. How a walk folds its answers back in. */
export function withMarked(
  state: NeedCategorySiftState,
  chosen: readonly string[],
  notes: readonly Note[] = state.notes,
): NeedCategorySiftState {
  const marked = inSourceOrder(state.words, chosen)
  return {
    ...state,
    marked,
    notes: notesInSourceOrder(state.words, marked, notes),
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
      return { ...withMarked(state, next), showing: action.word }
    }

    case 'show':
      return { ...state, showing: action.word }

    case 'note': {
      // Nothing to write on: a note belongs to a picked word, and this is the
      // only place that can be said once rather than in every host.
      if (!isMarked(state, action.word)) return state
      return {
        ...state,
        showing: action.word,
        noting: { word: action.word, draft: noteFor(state, action.word) ?? '' },
      }
    }

    case 'noteShowing': {
      const showing = gloss(state)
      if (showing === null) return state
      return reduce(state, { type: 'note', word: showing.word })
    }

    case 'draft':
      return state.noting
        ? { ...state, noting: { ...state.noting, draft: action.text } }
        : state

    case 'keepNote': {
      if (!state.noting) return state
      const { word, draft } = state.noting
      // A blank box is the delete. Trimmed here rather than in a host, so that
      // a note of nothing but spaces cannot be written down.
      const text = draft.trim()
      const rest = state.notes.filter((note) => note.word !== word)
      return {
        ...withMarked(state, state.marked, [...rest, { word, text }]),
        showing: word,
        noting: null,
        resume: word,
      }
    }

    case 'dropNote':
      return state.noting
        ? { ...state, noting: null, resume: state.noting.word }
        : state
  }
}

/** What is written about `word`, if anything. */
export function noteFor(
  state: NeedCategorySiftState,
  word: string,
): string | null {
  return state.notes.find((note) => note.word === word)?.text ?? null
}

/** Whether the drawer is open over the grid. */
export function isNoting(state: NeedCategorySiftState): boolean {
  return state.noting !== null
}

/** The words with what is written about them, for a card or a summary. */
export function marks(
  state: NeedCategorySiftState,
): { word: string; note?: string }[] {
  return state.marked.map((word) => {
    const note = noteFor(state, word)
    return note === null ? { word } : { word, note }
  })
}

/** Whether `word` is marked. */
export function isMarked(state: NeedCategorySiftState, word: string): boolean {
  return state.marked.includes(word)
}

/** The need the gloss strip is showing, or null before anything is touched. */
export function gloss(state: NeedCategorySiftState): Need | null {
  return state.words.find((need) => need.word === state.showing) ?? null
}

/**
 * Which screen a host is looking at, for `useFocusScreen`. The category, and
 * whether a note is being written over it: the drawer is a screen of its own,
 * and opening one has to put focus in the box.
 *
 * What is marked is deliberately absent — marking a word is not a new screen,
 * and a count here would take focus off whatever was just tapped, on every tap.
 * `resume` is present because closing a drawer *is* a move, and it is sticky so
 * that the hover which follows is not: it names the word whose pill wears
 * `data-sift` until another note is opened.
 */
export function screenKey(state: NeedCategorySiftState): string {
  if (state.noting) return `note:${state.category}:${state.noting.word}`
  return `sift:${state.category}:${state.resume ?? ''}`
}

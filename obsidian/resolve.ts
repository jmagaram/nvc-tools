import type { Picked } from '../src/components/PickedEntries.tsx'
import { categories as feelingCategories } from '../src/data/feelings.ts'
import { categories as needCategories } from '../src/data/needs.ts'
import type { Visited as FeelingVisited } from '../src/machines/feelingPicker.ts'
import type { Visited as NeedVisited } from '../src/machines/needPicker.ts'

/**
 * What a block turned out to hold: which inventory it is drawn from, and its
 * entries in the shape that inventory's picker seeds from.
 *
 * The inventory is worked out from the words rather than written into the
 * fence. Nothing in the note says 'feelings' or 'needs' and nothing should:
 * a marker that can be read is a marker that can disagree with the body it
 * labels, and there is no answer to a block that says `nvc-feelings` over a
 * list of needs. Inference cannot contradict itself, it costs a lookup this
 * module has to do anyway to validate, and it leaves every block already
 * written by hand or by an older build readable.
 *
 * It is also total: no word and no category name appears in both inventories,
 * so a single bullet settles it and no block can resolve against both.
 */
export type Resolved =
  | { inventory: 'feelings'; entries: FeelingVisited[] }
  | { inventory: 'needs'; entries: NeedVisited[] }

/** One category as the index holds it. */
type Indexed<Kind> = {
  /** The name as the source spells it, which is what a resolved entry gets. */
  name: string
  kind: Kind
  /** Every word in it, in source order — what a resolved entry is filtered from. */
  words: readonly string[]
  /** Lookup key to the word as the source spells it. */
  byKey: Map<string, string>
}

/**
 * The form a name is matched in. Case and spacing in a note belong to whoever
 * typed them: `Irate` at the start of a sentence is still `irate`, and a note
 * that has been through a formatter is still the note. Nothing else is
 * forgiven — a word either is in the inventory or is not.
 */
function key(text: string): string {
  return text.normalize('NFC').trim().toLowerCase().replace(/\s+/g, ' ')
}

function index<Kind>(
  categories: readonly { name: string; kind: Kind; words: readonly string[] }[],
): Map<string, Indexed<Kind>> {
  return new Map(
    categories.map((category) => [
      key(category.name),
      { ...category, byKey: new Map(category.words.map((w) => [key(w), w])) },
    ]),
  )
}

const feelings = index(
  feelingCategories.map((c) => ({
    name: c.name,
    kind: c.kind,
    words: c.feelings.map((f) => f.word),
  })),
)

const needs = index(
  needCategories.map((c) => ({
    name: c.name,
    // The CNVC inventory splits feelings into needs met and needs unmet; the
    // needs themselves are one undivided list, and `needPicker.Visited` has no
    // room for a kind. Carried as null here only so one index serves both.
    kind: null,
    words: c.needs.map((n) => n.word),
  })),
)

/**
 * Read `entries` as one inventory's words, or not at all.
 *
 * All or nothing on purpose: a block half of which resolves is a block someone
 * has typed into, and guessing which half they meant is worse than saying it
 * cannot be read. So an unknown word, an unknown category, a word under a
 * category that does not hold it, and the same category on two bullets all
 * come to the same answer.
 */
function against<Kind>(
  inventory: Map<string, Indexed<Kind>>,
  entries: readonly Picked[],
): { category: string; kind: Kind; words: string[]; notes: [] }[] | null {
  const seen = new Set<string>()
  const resolved: { category: string; kind: Kind; words: string[]; notes: [] }[] =
    []

  for (const entry of entries) {
    const category = inventory.get(key(entry.category))
    if (!category) return null
    // Two bullets naming one category leave no single answer to seed the grid
    // with, and merging them would rewrite text nobody asked us to touch.
    if (seen.has(category.name)) return null
    seen.add(category.name)

    const wanted = new Set<string>()
    for (const word of entry.words) {
      const found = category.byKey.get(key(word))
      if (!found) return null
      wanted.add(found)
    }

    resolved.push({
      category: category.name,
      kind: category.kind,
      /* Source order and no duplicates — the same normalising every write to
         a sift's `marked` goes through. Done here so a word written twice
         cannot inflate the count on the button. */
      words: category.words.filter((word) => wanted.has(word)),
      /* Nothing in the note carries a note yet: the fence holds the words and
         only the words, so a block read back is a block with none. What the
         picker writes during a session lives as long as the modal does. */
      notes: [],
    })
  }

  return resolved
}

/**
 * A parsed block read back as picks a modal can be opened on, or null when it
 * cannot be — which is the whole of the validation the `Edit` item needs.
 *
 * Takes `parseBlock`'s result, null and all, so a caller has one thing to
 * check rather than two: a body whose shape is wrong and a body whose words
 * are wrong both mean the same to whoever asked to edit it.
 */
export function resolve(entries: readonly Picked[] | null): Resolved | null {
  if (!entries || entries.length === 0) return null

  const asFeelings = against(feelings, entries)
  if (asFeelings) return { inventory: 'feelings', entries: asFeelings }

  const asNeeds = against(needs, entries)
  if (asNeeds) {
    return {
      inventory: 'needs',
      entries: asNeeds.map(({ category, words, notes }) => ({
        category,
        words,
        notes,
      })),
    }
  }

  return null
}

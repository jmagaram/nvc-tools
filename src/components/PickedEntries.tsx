import styles from './PickedEntries.module.css'

/** A few words of someone's own about one picked word. */
export type Note = {
  word: string
  text: string
}

/**
 * One category's worth of picks, as a block in a note holds them.
 *
 * `kind` is the met/unmet split, and it is optional for two honest reasons:
 * needs are one undivided list and have none, and a block read back whose words
 * did not resolve against the inventory cannot be told which side it is on. A
 * view draws the split when it is there and no headings at all when it is not,
 * which is also how a reader tells a feelings block from a needs one.
 */
export type Picked = {
  category: string
  words: readonly string[]
  notes?: readonly Note[]
  kind?: 'met' | 'unmet' | null
}

/** The five ways the same picks can be laid out. */
export type Format = 'gloss' | 'column' | 'sentence' | 'inline' | 'table'

type Props = {
  /** The categories picked in, in the order they were walked. */
  entries: readonly Picked[]
  /**
   * Which layout to draw. A plain union rather than a union of prop shapes:
   * all five read the same `entries`, so there is no contradiction to rule out.
   */
  format: Format
}

/**
 * Needs-not-met first, then needs-met, and everything else left where it is.
 *
 * This is the whole of how the split is drawn. It was two headings — *When
 * needs are met* over one group and *When needs are not met* over the other —
 * and they were the loudest thing in the block, a full line of chrome each to
 * label something the category names already say: nobody reads *Angry* and
 * wonders which side it is on. Order says it quietly and costs no lines.
 *
 * A word without a kind sorts with the not-met group and so keeps its place —
 * needs have no kind at all, and neither does a block whose words did not
 * resolve, and in both cases the given order is the right one. The sort is
 * stable, so nothing moves inside a group.
 */
function inSplitOrder(entries: readonly Picked[]): Picked[] {
  return [...entries].sort(
    (a, b) => (a.kind === 'met' ? 1 : 0) - (b.kind === 'met' ? 1 : 0),
  )
}

const notesOf = (entry: Picked): readonly Note[] => entry.notes ?? []

/** What a category says about each of its words, looked up by the word. */
const written = (entry: Picked) =>
  new Map(notesOf(entry).map((note) => [note.word, note.text]))

/** Whether anything here knows which side of the split it is on. */
const isSplit = (entries: readonly Picked[]) =>
  entries.some((entry) => entry.kind)

/**
 * A run of words, drawn the same way wherever words appear.
 *
 * `role="list"` is not redundant: Safari drops list semantics from a `ul` whose
 * `list-style` is `none`, which is every list here. The items stay `display:
 * inline` so the words wrap like prose — as flex items a wrapped line stops
 * lining up with the one above it. The comma is drawn by CSS rather than
 * written, so it is not selected when the words are.
 */
function Words({ words }: { words: readonly string[] }) {
  return (
    <ul className={styles.words} role="list">
      {words.map((word) => (
        <li key={word}>{word}</li>
      ))}
    </ul>
  )
}

/**
 * What was picked, drawn one of five ways.
 *
 * The category is kept in four of them because the walk is what gave a word its
 * meaning — 'incensed' on its own has lost the question it answered. `inline`
 * drops it on purpose: that one is for pasting into a sentence you are already
 * writing, where the categories would only get in the way.
 */
export default function PickedEntries({ entries, format }: Props) {
  const anyNoted = entries.some((entry) => notesOf(entry).length > 0)
  const ordered = inSplitOrder(entries)

  if (format === 'inline') {
    /* Real commas, written into the text, where every other view draws them in
       CSS. Generated content is not copied to the clipboard, and being copied
       is the whole of what this layout is for — it would paste as a run of
       words with no punctuation. It looks like an inconsistency and is not. */
    return (
      <p className={styles.inline}>
        {entries.flatMap((entry) => entry.words).join(', ')}
      </p>
    )
  }

  if (format === 'sentence') return <Sentence entries={entries} />

  return (
    <div className={styles.block}>
      {format === 'table' ? (
        /* One table and not one per side. Split in two it needed a heading over
           each to say what each was, and those are the headings this stopped
           drawing — two unlabelled tables in a row read as two unrelated ones. */
        <Table entries={ordered} noted={anyNoted} />
      ) : format === 'column' ? (
        <Column entries={ordered} />
      ) : (
        <Gloss entries={ordered} />
      )}
    </div>
  )
}

/**
 * The default: a category with its words in a run, and each noted word broken
 * out on a row of its own below.
 *
 * A description list rather than a table, because every row genuinely is a name
 * and a value — and the two kinds of row mean different things, a category
 * against its words and a word against what was said about it. A table would
 * need column headings for something that has none, and 'row two, column one'
 * tells a screen reader less than a name and its value.
 *
 * The `div` between the list and its rows is allowed, and it is what gives each
 * row a box of its own to hang a future click target on.
 */
function Gloss({ entries }: { entries: readonly Picked[] }) {
  return (
    <dl className={styles.rows}>
      {entries.map((entry) => (
        <div key={entry.category} className={styles.categoryRow}>
          <dt className={styles.label}>
            <b>{entry.category}</b>
          </dt>
          <dd className={styles.wordsCell}>
            <Words words={entry.words} />
          </dd>
          {notesOf(entry).map((note) => (
            <div key={note.word} className={styles.noteRow}>
              <dt className={styles.label}>{note.word}</dt>
              <dd className={styles.note}>{note.text}</dd>
            </div>
          ))}
        </div>
      ))}
    </dl>
  )
}

/**
 * Every word on a line of its own, whatever it carries, with the notes hanging
 * in a second column.
 *
 * Shows two things no other layout does: how much of a category was taken, in
 * the length of the block, and which words were written about — with no mark at
 * all, because the second column is either occupied or it is not.
 *
 * The category spans both columns rather than sitting in the label one, where
 * it would leave the words under it out of line with each other.
 */
function Column({ entries }: { entries: readonly Picked[] }) {
  return (
    <dl className={`${styles.rows} ${styles.column}`}>
      {entries.map((entry) => {
        const notes = written(entry)
        return (
          <div key={entry.category} className={styles.columnGroup}>
            <dt className={styles.category}>
              <b>{entry.category}</b>
            </dt>
            {entry.words.map((word) => (
              <div key={word} className={styles.wordRow}>
                <dt className={styles.word}>{word}</dt>
                <dd className={styles.note}>{notes.get(word) ?? ''}</dd>
              </div>
            ))}
          </div>
        )
      })}
    </dl>
  )
}

/**
 * A line to read rather than a record to scan.
 *
 * No headings. The category names carry the sense of it, and the split is drawn
 * structurally instead — the words that came of needs *not* met first, each side
 * its own paragraph. Which side is which is deliberately not written: this is
 * the one lossy layout, and it is lossy on purpose.
 *
 * A `div` and not a `p`, because a `ul` may not sit inside a paragraph — the
 * parser would close it early and the words would fall out of the sentence. The
 * space between the two sides is doing the whole job of the split, so it is a
 * real gap rather than the margin two lines of prose would have.
 */
function Sentence({ entries }: { entries: readonly Picked[] }) {
  /* The one layout that still keeps the two sides apart on the page, because a
     paragraph has no other way to group anything — and the gap between them is
     doing that job, not a label. */
  const order = isSplit(entries)
    ? (['unmet', 'met'] as const)
        .map((kind) => entries.filter((entry) => entry.kind === kind))
        .filter((group) => group.length > 0)
    : [entries]

  return (
    <div className={styles.sentence}>
      {order.map((group, index) => {
        const notes = group.reduce((sum, e) => sum + notesOf(e).length, 0)
        return (
          <div key={index} className={styles.side}>
            {group.map((entry) => (
              <span key={entry.category} className={styles.said}>
                <b>{entry.category}</b>: <Words words={entry.words} />
              </span>
            ))}
            {/* The notes cannot ride along in prose, and going unmentioned
                would be worse than counted: a reader has no other sign that
                there is anything more in the block than the words. */}
            {notes > 0 && (
              <span className={styles.count}>
                {notes} {notes === 1 ? 'note' : 'notes'}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

/**
 * A row per word with the category repeated down the first column.
 *
 * The repetition is the point rather than a shortcoming of the conversion: a
 * pipe table has neither a row span nor an indent, and a grid with one thing
 * per row is the one someone can add a column to — an intensity, a date, who it
 * was about — which is most of the reason to convert a block at all.
 *
 * The note column is dropped entirely when nothing in the block has one. Left
 * in, the rules either side of an empty column read as data missing rather than
 * as room.
 */
function Table({
  entries,
  noted,
}: {
  entries: readonly Picked[]
  noted: boolean
}) {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Category</th>
          <th>Word</th>
          {noted && <th>Note</th>}
        </tr>
      </thead>
      <tbody>
        {entries.flatMap((entry) => {
          const notes = written(entry)
          return entry.words.map((word) => (
            <tr key={`${entry.category}:${word}`}>
              <td>{entry.category}</td>
              <td>{word}</td>
              {noted && <td className={styles.note}>{notes.get(word) ?? ''}</td>}
            </tr>
          ))
        })}
      </tbody>
    </table>
  )
}

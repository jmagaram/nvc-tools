import { useId } from 'react'
import type { KeyboardEvent } from 'react'
import {
  gloss,
  isMarked,
  isNoting,
  tabbable,
  visibleNote,
} from '../machines/feelingCategorySift.ts'
import type {
  FeelingCategorySiftAction,
  FeelingCategorySiftState,
} from '../machines/feelingCategorySift.ts'
import { rowNeighbor } from '../rowNeighbor.ts'
import { useHoverIntent } from '../useHoverIntent.ts'
import FeelingPill from './FeelingPill.tsx'
import NoteDrawer from './NoteDrawer.tsx'
import NoteLine from './NoteLine.tsx'
import styles from './FeelingCategorySift.module.css'

type Props = {
  /** The category on screen, and what is marked in it. */
  state: FeelingCategorySiftState
  /** Called with whatever the person just did. */
  onAction: (action: FeelingCategorySiftAction) => void
}

/** Stands in the gloss strip before anything has been touched. */
const HINT = 'Touch a word to see what it means.'

/**
 * One category, every word at once, marked or not.
 *
 * The ways on from here — `Done` and going through the words one at a time —
 * belong to the host, the same as `Cancel` and `Insert` do: they speak for this
 * screen, and a modal keeps that sort of thing in its button row where a long
 * grid cannot scroll it out of reach.
 */
export default function FeelingCategorySift({ state, onAction }: Props) {
  const showing = gloss(state)
  const anchor = state.anchor
  /* Only a marked word can be written about, so the button is offered a word
     only when the anchored one is marked. It is drawn either way — see the
     `.note` reserve — and says which of the two it is. */
  const notable = anchor !== null && isMarked(state, anchor) ? anchor : null
  /* The strip's own id, so the anchored word can be described by it. Only that
     one word claims it: twenty-eight pills all pointing at one sentence would
     have every word described by whichever other word the sentence was about. */
  const glossId = useId()
  /* The listbox is named by the heading above it rather than by a string of its
     own — see the `aria-labelledby` below. */
  const headingId = useId()

  /* Hover shows, and only after the pointer has stayed long enough to mean it.
     Suspended while the drawer is open — what it covers is `inert`, so nothing
     would arrive anyway, but a wait already counting down would land after it
     opened and change the strip underneath. */
  const hover = useHoverIntent(
    (word) => onAction({ type: 'preview', word }),
    () => onAction({ type: 'preview', word: null }),
  )
  const noting = isNoting(state)

  /* The arrow keys, and only those. Everything else this grid answers, it
     answers through the markup: a pill is a real button, so Enter and Space
     press it natively, and handling them here would fire the toggle twice.
     Escape is left to bubble, `n` is heard at the window because the two ways
     off this screen are in the modal's button row outside it, and Tab is what
     the roving stop exists to keep working. */
  const keys = (event: KeyboardEvent<HTMLDivElement>) => {
    // A modifier means the keystroke belongs to the host, the same rule the
    // tabs use.
    if (event.ctrlKey || event.metaKey || event.altKey) return
    const words = state.words
    if (words.length === 0) return
    const at = anchor === null ? -1 : words.findIndex((w) => w.word === anchor)

    const go = (index: number) => {
      event.preventDefault()
      onAction({ type: 'anchor', word: words[index].word })
    }

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowLeft': {
        // Wrapping, because a wrapped row is one run of words the layout
        // happened to break: running off the end of a line continues on the
        // next, and off the end of the last continues at the first.
        const step = event.key === 'ArrowRight' ? 1 : -1
        return go(at < 0 ? 0 : (at + step + words.length) % words.length)
      }
      case 'ArrowDown':
      case 'ArrowUp': {
        if (at < 0) return go(0)
        // The one place anything here measures the page. Which words share a
        // row is decided by the layout and known only once it has happened —
        // see `rowNeighbor`, which is handed the rectangles and stays pure.
        const boxes = [
          ...event.currentTarget.querySelectorAll('[role="option"]'),
        ].map((pill) => pill.getBoundingClientRect())
        const next = rowNeighbor(boxes, at, event.key === 'ArrowDown' ? 1 : -1)
        // Nothing above or below: the arrows stop at the edges rather than
        // wrapping, because up and down are the shape of the paragraph and
        // jumping from the last row to the first would lose your place.
        event.preventDefault()
        return next === null ? undefined : go(next)
      }
      case 'Home':
        return go(0)
      case 'End':
        return go(words.length - 1)
      default:
        return
    }
  }

  return (
    <NoteDrawer
      noting={state.noting}
      onDraft={(text) => onAction({ type: 'draft', text })}
      onKeep={() => onAction({ type: 'keepNote' })}
      onDrop={() => onAction({ type: 'dropNote' })}
    >
      {/* 'data-sift' is how a host finds this screen to focus it — see
          useFocusScreen. It sits here only until a word is anchored, after
          which that word's pill wears it and the arrows carry the focus ring
          from pill to pill without this component ever calling `focus` itself.
          tabIndex -1 because it only ever takes focus that way.

          No `role` and no `aria-label` here, which is the rule every
          `data-*` screen element follows: either would become the accessible
          name of the whole region and be read out on every change inside it.
          The listbox is the row of words below, which is the thing that
          actually is one. */}
      <div
        className={styles.sift}
        tabIndex={-1}
        data-sift={anchor === null ? '' : undefined}
      >
        {/* The inventory over the category, stacked tight enough to read as one
            heading. It names what the words are without spending a line on it,
            and without the chrome above having to hold a second title that says
            the same thing at the same size. */}
        <h3 className={styles.heading} id={headingId}>
          <span className={styles.set}>Feelings</span>
          {state.category}
        </h3>

        {/* On a touch screen there is no hover and the tap does both showing and
            marking, which is why the definition goes in a strip below rather
            than in a tooltip.

            A listbox rather than a run of toggle buttons: twenty-eight words of
            which any number apply is exactly what the role describes, and it is
            what makes the arrow keys the expected way through rather than an
            invention. The label names the category, since the heading above is
            not attached to this. */}
        <div
          className={styles.words}
          role="listbox"
          aria-multiselectable="true"
          /* Named by the heading, not by an `aria-label` of its own. Obsidian
             turns an `aria-label` into a hover tooltip — that is how the plugin
             draws the block menu's own — so one here hung a black box over the
             definition strip whenever the pointer was anywhere in the grid,
             which is most of the time. `aria-labelledby` names the region just
             as well and draws nothing. */
          aria-labelledby={headingId}
          onKeyDown={keys}
          /* Leaving the grid puts the strip back to the anchored word at once.
             Between two words nothing is cleared — that is what keeps a sweep
             across the row from flickering. */
          onPointerLeave={hover.leave}
        >
          {state.words.map((feeling) => (
            <FeelingPill
              key={feeling.word}
              word={feeling.word}
              kind={state.kind}
              marked={isMarked(state, feeling.word)}
              noted={visibleNote(state, feeling.word) !== null}
              tabbable={feeling.word === tabbable(state)}
              anchored={feeling.word === anchor}
              describedBy={glossId}
              onClick={() => onAction({ type: 'toggle', word: feeling.word })}
              onNote={() => onAction({ type: 'note', word: feeling.word })}
              onAnchor={() => onAction({ type: 'anchor', word: feeling.word })}
              onPreview={() => {
                if (!noting) hover.enter(feeling.word)
              }}
            />
          ))}
        </div>

        {/* The definition and the note share one reserve rather than holding
            a separate one each. Apart, a one-line definition left its second
            reserved line empty *between* the two — a band of nothing that read
            as a layout fault — while the note next to it was clamped to a
            single line and ellipsised. Pooled, the same total height goes
            wherever the content is: a short definition lends its spare line to
            a longer note, and what is left over falls below both, where it
            reads as room rather than as a gap.

            The total is what keeps the grid still. The definition changes as
            the pointer dwells, and without a floor the modal's bottom edge —
            and the button row under it — would move each time. */}
        <div className={styles.strip}>
          {/* Last, and at a height that does not change: a strip that grew and
              shrank would shift the grid under the finger that just tapped it. */}
          <p className={styles.gloss} id={glossId}>
            {showing ? (
              <>
                <b>{showing.word}</b> — {showing.definition}
              </>
            ) : (
              <span className={styles.hint}>{HINT}</span>
            )}
          </p>

          {/* Nothing at all until there is a word to write about. A control
              explaining that you must pick something first spends a line
              teaching a rule nobody was going to break, and it would be the
              only text here that lectures rather than naming an action. The
              reserve below holds its height either way, so saying nothing costs
              no movement.

              It names the anchored word and not the one the strip is showing.
              Those differ while the pointer is dwelling somewhere else, and
              that is the point — a control has to belong to a word that holds
              still, or the journey to reach it changes what it does. Both words
              are on screen and both are named. */}
          <div className={styles.note}>
            {notable !== null && (
              <NoteLine
                word={notable}
                note={visibleNote(state, notable)}
                maxLines={3}
                onOpen={() => onAction({ type: 'noteAnchor' })}
              />
            )}
          </div>
        </div>
      </div>
    </NoteDrawer>
  )
}

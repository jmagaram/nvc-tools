import { gloss, isMarked, noteFor } from '../machines/feelingCategorySift.ts'
import type {
  FeelingCategorySiftAction,
  FeelingCategorySiftState,
} from '../machines/feelingCategorySift.ts'
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
  // Only a marked word can be written about, so only a marked word is offered a
  // line — which makes marking the thing that introduces notes, and leaves a
  // sweep across twenty-eight unmarked words offering nothing.
  const offered = showing !== null && isMarked(state, showing.word)

  return (
    <NoteDrawer
      noting={state.noting}
      onDraft={(text) => onAction({ type: 'draft', text })}
      onKeep={() => onAction({ type: 'keepNote' })}
      onDrop={() => onAction({ type: 'dropNote' })}
    >
      {/* 'data-sift' is how a host finds this screen to focus it — see
          useFocusScreen, and `resume` for the one case where a word wears it
          instead. tabIndex -1 because it only ever takes focus that way: as a
          tab stop it would sit in front of the first word for no gain. Not an
          aria attribute, for the reason `FeelingPrompt` gives. The only key it
          takes is `n`: browsing, the arrows move between the tabs, and in a
          walk they answer, but here they would fight the browser's own way
          through a run of buttons. */}
      <div
        className={styles.sift}
        tabIndex={-1}
        data-sift={state.resume === null ? '' : undefined}
      >
        {/* The inventory over the category, stacked tight enough to read as one
            heading. It names what the words are without spending a line on it,
            and without the chrome above having to hold a second title that says
            the same thing at the same size. */}
        <h3 className={styles.heading}>
          <span className={styles.set}>Feelings</span>
          {state.category}
        </h3>

        {/* On a touch screen there is no hover and the tap does both showing and
            marking, which is why the definition goes in a strip below rather
            than in a tooltip. */}
        <div className={styles.words}>
          {state.words.map((feeling) => (
            <FeelingPill
              key={feeling.word}
              word={feeling.word}
              kind={state.kind}
              marked={isMarked(state, feeling.word)}
              noted={noteFor(state, feeling.word) !== null}
              resume={state.resume === feeling.word}
              onClick={() => onAction({ type: 'toggle', word: feeling.word })}
              onShow={() => onAction({ type: 'show', word: feeling.word })}
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

            The total is what keeps the grid still. `showing` changes on every
            pointer crossing, and without a floor the modal's bottom edge — and
            the button row under it — would move on each one. */}
        <div className={styles.strip}>
          {/* Last, and at a height that does not change: a strip that grew and
              shrank would shift the grid under the finger that just tapped it. */}
          <p className={styles.gloss}>
            {showing ? (
              <>
                <b>{showing.word}</b> — {showing.definition}
              </>
            ) : (
              <span className={styles.hint}>{HINT}</span>
            )}
          </p>

          {/* The line under the definition, and the room it takes whether or not
              there is one to draw: a line that appeared as the pointer crossed a
              marked word would move the modal's bottom edge on every pass. */}
          <div className={styles.note}>
            {offered && (
              <NoteLine
                word={showing.word}
                note={noteFor(state, showing.word)}
                clickable={false}
                maxLines={3}
                onOpen={() => onAction({ type: 'note', word: showing.word })}
              />
            )}
          </div>
        </div>
      </div>
    </NoteDrawer>
  )
}

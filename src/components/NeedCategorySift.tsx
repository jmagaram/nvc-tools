import { gloss, isMarked } from '../machines/needCategorySift.ts'
import type {
  NeedCategorySiftAction,
  NeedCategorySiftState,
} from '../machines/needCategorySift.ts'
import NeedPill from './NeedPill.tsx'
import styles from './NeedCategorySift.module.css'

type Props = {
  /** The category on screen, and what is marked in it. */
  state: NeedCategorySiftState
  /** Called with whatever the person just did. */
  onAction: (action: NeedCategorySiftAction) => void
}

/** Stands in the gloss strip before anything has been touched. */
const HINT = 'Touch a word to see what it means.'

/**
 * One category, every word at once, marked or not.
 *
 * The ways on from here — `Done` and going through the words one at a time —
 * belong to the host, the same as `Cancel` and `OK` do: they speak for this
 * screen, and a modal keeps that sort of thing in its button row where a long
 * grid cannot scroll it out of reach.
 */
export default function NeedCategorySift({ state, onAction }: Props) {
  const showing = gloss(state)

  return (
    /* 'data-sift' is how a host finds this screen to focus it — see
       useFocusScreen. tabIndex -1 because it only ever takes focus that way: as
       a tab stop it would sit in front of the first word for no gain. Not an
       aria attribute, for the reason `NeedPrompt` gives. No arrow keys either —
       those answer a prompt, and here they would fight the browser's own way
       through a run of buttons. */
    <div className={styles.sift} tabIndex={-1} data-sift="">
      {/* The inventory over the category, stacked tight enough to read as one
          heading. It names what the words are without spending a line on it,
          and without the chrome above having to hold a second title that says
          the same thing at the same size. */}
      <h3 className={styles.heading}>
        <span className={styles.set}>Needs</span>
        {state.category}
      </h3>

      {/* On a touch screen there is no hover and the tap does both showing and
          marking, which is why the definition goes in a strip below rather
          than in a tooltip. */}
      <div className={styles.words}>
        {state.words.map((need) => (
          <NeedPill
            key={need.word}
            word={need.word}
            marked={isMarked(state, need.word)}
            onClick={() => onAction({ type: 'toggle', word: need.word })}
            onShow={() => onAction({ type: 'show', word: need.word })}
          />
        ))}
      </div>

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
    </div>
  )
}

import { count, gloss, isMarked } from '../machines/feelingCategorySift.ts'
import type {
  FeelingCategorySiftAction,
  FeelingCategorySiftState,
} from '../machines/feelingCategorySift.ts'
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
 * belong to the host, the same as `Cancel` and `OK` do: they speak for this
 * screen, and a modal keeps that sort of thing in its button row where a long
 * grid cannot scroll it out of reach.
 */
export default function FeelingCategorySift({ state, onAction }: Props) {
  const showing = gloss(state)

  return (
    /* 'data-sift' is how a host finds this screen to focus it — see
       useFocusScreen. tabIndex -1 because it only ever takes focus that way: as
       a tab stop it would sit in front of the first word for no gain. Not an
       aria attribute, for the reason `FeelingPrompt` gives. No arrow keys
       either — browsing they move between the tabs and in a walk they answer,
       and here they would fight the browser's own way through a run of
       buttons. */
    <div className={styles.sift} tabIndex={-1} data-sift="">
      <h3 className={styles.heading}>
        {state.category}{' '}
        <span className={styles.count}>
          {count(state)} of {state.words.length}
        </span>
      </h3>

      <div className={styles.words}>
        {state.words.map((feeling) => (
          /* A pressed button rather than a checkbox: the whole word is the
             target, which is what makes marking a run of them quick. */
          <button
            key={feeling.word}
            type="button"
            className={`${styles.word} ${styles[state.kind]}`}
            aria-pressed={isMarked(state, feeling.word)}
            onClick={() => onAction({ type: 'toggle', word: feeling.word })}
            /* Reading a definition must not cost a mark, so hovering and
               tabbing show one too. On a touch screen there is no hover and
               the tap does both, which is why the strip and not a tooltip. */
            onPointerEnter={() =>
              onAction({ type: 'show', word: feeling.word })
            }
            onFocus={() => onAction({ type: 'show', word: feeling.word })}
          >
            {feeling.word}
          </button>
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

/**
 * Which pill is directly above or below this one, worked out from where they
 * landed.
 *
 * A category is a `flex-wrap` row of words, so the pills have different widths
 * and the rows have different counts — there is no column to increment, and
 * nothing in the markup says which words share a line. The only thing that
 * knows is the layout, and it only knows once it has happened. So the rows are
 * read back off the geometry at the moment a key is pressed rather than
 * modelled anywhere.
 *
 * Pure, and taking rectangles rather than elements, so the one place that
 * touches the DOM is the keydown handler that gathers them. Nothing here
 * renders, measures or remembers.
 */

/**
 * Rows differ by whole line boxes, so anything closer together than this is the
 * same row measured twice. A couple of pixels absorbs the subpixel difference
 * between a pill wearing a 2px border and one wearing 1px.
 */
const SAME_ROW = 2

/**
 * The index of the pill nearest `from` in the row above (`-1`) or below (`1`),
 * or null when there is no such row.
 *
 * Nearest is measured between horizontal *centres*, not left edges. With pills
 * of different widths, matching on `left` makes Down and then Up land somewhere
 * you did not start, which reads as the grid losing your place. Centres are not
 * perfectly reversible either — two rows can be packed so that they are not —
 * but they are close enough that it does not show.
 *
 * There is no wrapping. Left and right wrap because the row is a sentence and
 * running off the end of one continues on the next; up and down are the shape
 * of the paragraph, and a Down at the bottom that jumped to the top would lose
 * the one thing this is for, which is knowing where you are.
 */
export function rowNeighbor(
  rects: readonly DOMRect[],
  from: number,
  dir: -1 | 1,
): number | null {
  const here = rects[from]
  if (!here) return null

  // Every distinct row top, in the order they are drawn. Grouped rather than
  // sorted per pill, because 'the next row' has to mean the same thing for
  // every word on this one.
  const tops: number[] = []
  for (const rect of rects) {
    if (!tops.some((top) => Math.abs(top - rect.top) <= SAME_ROW)) {
      tops.push(rect.top)
    }
  }
  tops.sort((a, b) => a - b)

  const row = tops.findIndex((top) => Math.abs(top - here.top) <= SAME_ROW)
  const wanted = tops[row + dir]
  if (wanted === undefined) return null

  const centre = here.left + here.width / 2
  let best: number | null = null
  let bestGap = Infinity
  rects.forEach((rect, index) => {
    if (Math.abs(rect.top - wanted) > SAME_ROW) return
    const gap = Math.abs(rect.left + rect.width / 2 - centre)
    if (gap < bestGap) {
      bestGap = gap
      best = index
    }
  })
  return best
}

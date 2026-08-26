/**
 * Fisher-Yates, on a copy. `rng` is a parameter rather than a call to
 * `Math.random` so that any order built from it can be repeated.
 */
export function shuffle<T>(items: readonly T[], rng: () => number): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

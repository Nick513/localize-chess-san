/** Trailing check / mate / annotation marks used in scoresheets. */
const TRAILING_ANNOTATIONS = /([+#?!]*)$/

export function splitTrailingAnnotations(san: string): {
  core: string
  annotations: string
} {
  const match = TRAILING_ANNOTATIONS.exec(san)
  const annotations = match?.[1] ?? ''
  return {
    core: annotations.length > 0 ? san.slice(0, -annotations.length) : san,
    annotations,
  }
}

/** Escape a string for use in a RegExp source. */
export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

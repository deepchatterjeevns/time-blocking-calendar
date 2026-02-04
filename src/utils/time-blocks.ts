/**
 * Time block: start and end as minutes from midnight (0–1439).
 * e.g. { start: 600, end: 660 } = 10:00–11:00
 */
export type TimeBlock = {
  start: number
  end: number
}

/**
 * Returns true if newBlock overlaps any existing block (conflict).
 * Returns false if the new block can be placed (no conflict).
 * Two segments [aStart, aEnd] and [bStart, bEnd] overlap iff aStart < bEnd && aEnd > bStart.
 */
export function validateOverlap(
  newBlock: TimeBlock,
  existingBlocks: TimeBlock[]
): boolean {
  for (const existing of existingBlocks) {
    if (newBlock.start < existing.end && newBlock.end > existing.start) {
      return true
    }
  }
  return false
}

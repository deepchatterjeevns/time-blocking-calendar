import { describe, it, expect } from 'vitest'
import { validateOverlap, type TimeBlock } from '@/utils/time-blocks'

// Minutes from midnight: 09:00=540, 09:30=570, 10:00=600, 11:00=660, 12:00=720

describe('validateOverlap', () => {
  it('Case A: inserting a block in an empty slot (should pass)', () => {
    const newBlock: TimeBlock = { start: 600, end: 660 } // 10:00–11:00
    const existingBlocks: TimeBlock[] = []
    expect(validateOverlap(newBlock, existingBlocks)).toBe(false)
  })

  it('Case B: inserting a block that overlaps an existing start time (should fail)', () => {
    const existingBlocks: TimeBlock[] = [{ start: 600, end: 660 }] // 10:00–11:00
    const newBlock: TimeBlock = { start: 570, end: 630 } // 09:30–10:30
    expect(validateOverlap(newBlock, existingBlocks)).toBe(true)
  })

  it('Case C: inserting a block that totally encloses an existing block (should fail)', () => {
    const existingBlocks: TimeBlock[] = [{ start: 600, end: 660 }] // 10:00–11:00
    const newBlock: TimeBlock = { start: 540, end: 720 } // 09:00–12:00
    expect(validateOverlap(newBlock, existingBlocks)).toBe(true)
  })
})

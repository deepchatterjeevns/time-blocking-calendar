'use client'

import { useCallback, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { validateOverlap, type TimeBlock } from '@/utils/time-blocks'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { BLOCK_CATEGORIES, getCategory, type CategoryId } from './categories'
import { BlockEditPopover } from './BlockEditPopover'

const ROW_HEIGHT_REM = 2.5
const TOTAL_HEIGHT_REM = 24 * ROW_HEIGHT_REM

export type BlockWithId = TimeBlock & {
  id: string
  label?: string
  category?: CategoryId
}

function formatMinute(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function getCurrentMinutes(): number {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}

export default function DayView() {
  const [blocks, setBlocks] = useState<BlockWithId[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [currentMinutes, setCurrentMinutes] = useState(getCurrentMinutes)

  useEffect(() => {
    const t = setInterval(() => setCurrentMinutes(getCurrentMinutes()), 60000)
    return () => clearInterval(t)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragOver(false)
      const data = e.dataTransfer.getData('application/json')
      if (!data) return
      try {
        const payload = JSON.parse(data) as {
          start: number
          end: number
          label?: string
          category?: CategoryId
        }
        const { start, end, label, category } = payload
        if (
          typeof start !== 'number' ||
          typeof end !== 'number' ||
          start >= end
        )
          return
        const newBlock: TimeBlock = { start, end }
        const existingBlocks: TimeBlock[] = blocks.map((b) => ({
          start: b.start,
          end: b.end,
        }))
        if (validateOverlap(newBlock, existingBlocks)) {
          toast.error('Overlap detected!')
          return
        }
        setBlocks((prev) => [
          ...prev,
          {
            ...newBlock,
            id: crypto.randomUUID(),
            label: label ?? 'Block',
            category: category ?? 'other',
          },
        ])
      } catch {
        // ignore
      }
    },
    [blocks]
  )

  const updateBlock = useCallback((id: string, updates: Partial<BlockWithId>) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    )
  }, [])

  const hours = Array.from({ length: 24 }, (_, i) => i)

  return (
    <div className="w-full max-w-4xl">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-lg">
        <h2 className="mb-4 text-sm font-medium text-zinc-400">
          Day View (00:00 – 24:00)
        </h2>
        <div className="flex gap-4">
          <div className="flex shrink-0 flex-col gap-2 rounded-lg border border-zinc-800 bg-zinc-900/80 p-2">
            <span className="text-xs text-zinc-500">Drag to add</span>
            {[
              { start: 540, end: 600, label: '1h block', category: 'work' as CategoryId },
              { start: 630, end: 660, label: '30m', category: 'health' as CategoryId },
            ].map((payload) => (
              <motion.div
                key={`${payload.start}-${payload.end}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'cursor-grab rounded-md border px-2 py-1.5 text-sm active:cursor-grabbing',
                  getCategory(payload.category).borderClass,
                  getCategory(payload.category).bgClass
                )}
              >
                <div
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData(
                      'application/json',
                      JSON.stringify(payload)
                    )
                    e.dataTransfer.effectAllowed = 'copy'
                  }}
                  className="min-h-[1em]"
                >
                  {payload.label}
                </div>
              </motion.div>
            ))}
          </div>
          <div
            className={cn(
              'relative min-h-[600px] flex-1 overflow-hidden rounded-lg border border-zinc-800 transition-colors',
              isDragOver && 'ring-2 ring-zinc-500'
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <ScrollArea className="h-[600px]">
              <div
                className="grid gap-0"
                style={{
                  gridTemplateColumns: '4rem 1fr',
                  gridTemplateRows: `repeat(24, minmax(${ROW_HEIGHT_REM}rem, ${ROW_HEIGHT_REM}rem))`,
                }}
              >
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="col-start-1 border-b border-zinc-800/50 pr-2 text-right text-xs text-zinc-500"
                    style={{ gridRow: hour + 1 }}
                  >
                    {String(hour).padStart(2, '0')}:00
                  </div>
                ))}
                <div
                  className="relative col-start-2 row-span-24 row-start-1 min-h-0 border-0"
                  style={{
                    gridRow: '1 / span 24',
                    minHeight: `${TOTAL_HEIGHT_REM}rem`,
                  }}
                >
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className="absolute left-0 right-0 rounded-sm border-0 hover:bg-zinc-800/50"
                      style={{
                        top: `${hour * ROW_HEIGHT_REM}rem`,
                        height: `${ROW_HEIGHT_REM}rem`,
                        zIndex: 0,
                      }}
                    />
                  ))}
                  {/* Current time indicator */}
                  <div
                    className="absolute left-0 right-0 z-10 h-0.5 bg-red-500"
                    style={{
                      top: `${(currentMinutes / 60) * ROW_HEIGHT_REM}rem`,
                    }}
                  />
                  {blocks.map((block) => {
                    const cat = getCategory(block.category ?? 'other')
                    const topRem = (block.start / 60) * ROW_HEIGHT_REM
                    const heightRem =
                      ((block.end - block.start) / 60) * ROW_HEIGHT_REM
                    return (
                      <BlockEditPopover
                        key={block.id}
                        block={block}
                        onUpdate={(updates) =>
                          updateBlock(block.id, updates)
                        }
                        trigger={
                          <motion.div
                            drag
                            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                            dragElastic={0}
                            whileDrag={{
                              scale: 1.05,
                              boxShadow:
                                '0 20px 25px -5px rgb(0 0 0 / 0.3)',
                            }}
                            onDragStart={(e) => {
                              const ev = e as unknown as React.DragEvent
                              if (ev.dataTransfer) {
                                ev.dataTransfer.setData(
                                  'application/json',
                                  JSON.stringify({
                                    start: block.start,
                                    end: block.end,
                                    label: block.label,
                                    category: block.category,
                                  })
                                )
                                ev.dataTransfer.effectAllowed = 'move'
                              }
                            }}
                            className={cn(
                              'absolute left-1 right-1 z-10 cursor-grab rounded-md border-l-4 p-1.5 text-sm active:cursor-grabbing hover:opacity-95',
                              cat.borderClass,
                              cat.bgClass
                            )}
                            style={{
                              top: `${topRem}rem`,
                              height: `${heightRem}rem`,
                              minHeight: '1.25rem',
                            }}
                          >
                            {block.label ??
                              `${formatMinute(block.start)} – ${formatMinute(block.end)}`}
                          </motion.div>
                        }
                      />
                    )
                  })}
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  )
}

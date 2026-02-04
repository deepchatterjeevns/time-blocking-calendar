'use client'

import { useCallback, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { validateOverlap, type TimeBlock as LocalTimeBlock } from '@/utils/time-blocks'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { BLOCK_CATEGORIES, getCategory, type CategoryId } from './categories'
import { BlockEditPopover } from './BlockEditPopover'
import { createTimeBlock, fetchTimeBlocks, updateTimeBlock, deleteTimeBlock } from '@/app/actions/time-blocks'
import { dateToMinutes, minutesToDate } from '@/utils/date-converters'

const ROW_HEIGHT_REM = 2.5
const TOTAL_HEIGHT_REM = 24 * ROW_HEIGHT_REM

export type BlockWithId = LocalTimeBlock & {
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
  const [isLoading, setIsLoading] = useState(true)

  const loadBlocks = useCallback(async () => {
    try {
      const serverBlocks = await fetchTimeBlocks(new Date())
      const mappedBlocks: BlockWithId[] = serverBlocks.map(b => ({
        id: b.id,
        start: dateToMinutes(b.start_time),
        end: dateToMinutes(b.end_time),
        label: b.title,
        category: b.category as CategoryId
      }))
      setBlocks(mappedBlocks)
    } catch (error) {
      console.error('Failed to load blocks:', error)
      toast.error('Failed to load schedule')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBlocks()
    const t = setInterval(() => setCurrentMinutes(getCurrentMinutes()), 60000)
    return () => clearInterval(t)
  }, [loadBlocks])

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
    async (e: React.DragEvent<HTMLDivElement>) => {
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

        const newBlockStub = { start, end }
        const existingBlocks = blocks.map((b) => ({
          start: b.start,
          end: b.end,
        }))

        if (validateOverlap(newBlockStub, existingBlocks)) {
          toast.error('Overlap detected!')
          return
        }

        // Optimistic update
        const tempId = crypto.randomUUID()
        const optimisticBlock: BlockWithId = {
          start, end, id: tempId, label: label ?? 'Block', category: category ?? 'other'
        }
        setBlocks(prev => [...prev, optimisticBlock])

        // Server save
        try {
          const savedBlock = await createTimeBlock({
            title: label ?? 'Block',
            category: (category ?? 'work') as any,
            start_time: minutesToDate(start).toISOString(),
            end_time: minutesToDate(end).toISOString()
          })

          // Replace optimistic with real
          setBlocks(prev => prev.map(b => b.id === tempId ? {
            ...b,
            id: savedBlock.id,
            // re-confirm times from server? optional
          } : b))

          toast.success('Block saved')
        } catch (err) {
          console.error(err)
          toast.error('Failed to save block')
          setBlocks(prev => prev.filter(b => b.id !== tempId))
        }

      } catch {
        // ignore
      }
    },
    [blocks]
  )

  const updateBlock = useCallback(async (id: string, updates: Partial<BlockWithId>) => {
    // Optimistic
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    )

    try {
      // Prepare DB updates
      const dbUpdates: any = {}
      if (updates.label !== undefined) dbUpdates.title = updates.label
      if (updates.category !== undefined) dbUpdates.category = updates.category
      if (updates.start !== undefined) dbUpdates.start_time = minutesToDate(updates.start).toISOString()
      if (updates.end !== undefined) dbUpdates.end_time = minutesToDate(updates.end).toISOString()

      await updateTimeBlock(id, dbUpdates)
      // toast.success('Updated') // maybe too noisy
    } catch (err) {
      console.error(err)
      toast.error('Failed to update')
      // Revert? (Complex without previous state, usually fine to just reload or let it be for MVP)
      loadBlocks()
    }
  }, [loadBlocks])

  const handleDelete = useCallback(async (id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id))
    try {
      await deleteTimeBlock(id)
      toast.success('Deleted')
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete')
      loadBlocks()
    }
  }, [loadBlocks])

  const hours = Array.from({ length: 24 }, (_, i) => i)

  return (
    <div className="flex flex-1 h-full flex-col">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800/50 bg-background/50 backdrop-blur-sm z-10">
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
            Today
            {isLoading && <span className="text-xs font-normal text-zinc-400 animate-pulse">Syncing...</span>}
          </h2>
          <div className="flex gap-2">
            <span className="text-xs text-zinc-400 self-center mr-2">Drag to add:</span>
            {[
              { start: 540, end: 600, label: 'Work Block', category: 'work' as CategoryId },
              { start: 630, end: 660, label: 'Deep Work', category: 'work' as CategoryId },
              { start: 720, end: 750, label: 'Break', category: 'health' as CategoryId },
            ].map((payload) => (
              <motion.div
                key={`${payload.start}-${payload.end}-${payload.label}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'cursor-grab rounded-full px-3 py-1.5 text-xs font-medium shadow-sm transition-all active:cursor-grabbing border',
                  // Use solid colors for drag source too
                  getCategory(payload.category).bgClass.replace('/20', '/100').replace('/40', '/80'), // Just a hack to reusing classes or define new ones. 
                  // Let's just use the classes we defined in categories.ts which are solid pastel.
                  getCategory(payload.category).bgClass,
                  'border-transparent'
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
                >
                  {payload.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div
          className={cn(
            'relative flex-1 overflow-hidden bg-background transition-colors',
            isDragOver && 'bg-zinc-50/50 dark:bg-zinc-900/30'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <ScrollArea className="h-full">
            <div
              className="grid gap-0 relative"
              style={{
                gridTemplateColumns: '4rem 1fr',
                gridTemplateRows: `repeat(24, minmax(${ROW_HEIGHT_REM}rem, ${ROW_HEIGHT_REM}rem))`,
              }}
            >
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="col-start-1 -mt-2.5 pr-4 text-right text-xs font-medium text-zinc-400 sticky left-0"
                  style={{ gridRow: hour + 1 }}
                >
                  {String(hour).padStart(2, '0')}:00
                </div>
              ))}

              {/* Horizontal Grid Lines */}
              <div
                className="col-start-2 row-span-24 row-start-1 min-h-0 border-l border-zinc-100 dark:border-zinc-800"
                style={{
                  gridRow: '1 / span 24',
                  minHeight: `${TOTAL_HEIGHT_REM}rem`,
                }}
              >
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="absolute left-0 right-0 border-t border-zinc-100 dark:border-zinc-800/50"
                    style={{
                      top: `${hour * ROW_HEIGHT_REM}rem`,
                      height: `${ROW_HEIGHT_REM}rem`,
                      zIndex: 0,
                    }}
                  />
                ))}

                {/* Current time indicator */}
                <div
                  className="absolute left-0 right-0 z-20 h-px bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                  style={{
                    top: `${(currentMinutes / 60) * ROW_HEIGHT_REM}rem`,
                  }}
                >
                  <div className="absolute -left-1.5 -top-1 h-2.5 w-2.5 rounded-full bg-red-500" />
                </div>

                {blocks.map((block) => {
                  const cat = getCategory(block.category ?? 'other')
                  const topRem = (block.start / 60) * ROW_HEIGHT_REM
                  const heightRem =
                    ((block.end - block.start) / 60) * ROW_HEIGHT_REM
                  return (
                    <BlockEditPopover
                      key={block.id}
                      block={block}
                      // @ts-ignore
                      onDelete={() => handleDelete(block.id)}
                      onUpdate={(updates) =>
                        updateBlock(block.id, updates)
                      }
                      trigger={
                        <motion.div
                          drag
                          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                          dragElastic={0}
                          whileDrag={{
                            scale: 1.02,
                            zIndex: 50,
                            boxShadow: '0 10px 20px -5px rgba(0,0,0,0.2)',
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
                          // Removed border-l-4, added rounded-lg and minimal shadow
                          className={cn(
                            'absolute left-1 right-2 z-10 cursor-grab rounded-lg p-2 text-sm font-medium active:cursor-grabbing hover:brightness-95 transition-all shadow-sm',
                            cat.bgClass,
                            // If using borders, it should be full border 
                            // cat.borderClass // Removing this to rely on solid look
                            'border border-black/5 dark:border-white/5'
                          )}
                          style={{
                            top: `${topRem}rem`,
                            height: `calc(${heightRem}rem - 2px)`, // slight gap
                            minHeight: '1.5rem',
                          }}
                        >
                          <div className="flex flex-col h-full overflow-hidden">
                            <span className="truncate leading-tight">{block.label}</span>
                            {heightRem > 3 && (
                              <span className="text-[10px] opacity-70 truncate mt-0.5">
                                {formatMinute(block.start)} - {formatMinute(block.end)}
                              </span>
                            )}
                          </div>
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
  )
}

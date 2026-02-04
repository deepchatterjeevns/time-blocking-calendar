'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { BLOCK_CATEGORIES, getCategory, type CategoryId } from './categories'
import type { BlockWithId } from './DayView'
import { cn } from '@/lib/utils'

export function BlockEditPopover({
  block,
  onUpdate,
  onDelete,
  trigger,
}: {
  block: BlockWithId
  onUpdate: (updates: Partial<BlockWithId>) => void
  onDelete: () => void
  trigger: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState(block.label ?? '')
  const [category, setCategory] = useState<CategoryId>(
    block.category ?? 'other'
  )

  const handleOpen = (open: boolean) => {
    if (open) {
      setTitle(block.label ?? '')
      setCategory(block.category ?? 'other')
    }
    setOpen(open)
  }

  const handleSave = () => {
    onUpdate({ label: title || undefined, category })
    toast.success('Block updated')
    setOpen(false)
  }

  const handleDelete = () => {
    onDelete()
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-64" align="start">
        <div className="flex flex-col gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Block title"
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Color</label>
            <div className="flex flex-wrap gap-1">
              {BLOCK_CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={cn(
                    'rounded-md border px-2 py-1 text-xs transition-colors',
                    c.borderClass,
                    c.bgClass,
                    category === c.id
                      ? 'ring-2 ring-zinc-400 ring-offset-2 ring-offset-zinc-900'
                      : 'opacity-80 hover:opacity-100'
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 mt-1">
            <Button size="sm" variant="ghost" className="flex-1" onClick={handleSave}>
              Save
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="flex-1 text-red-400 hover:text-red-300 hover:bg-red-950/50"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

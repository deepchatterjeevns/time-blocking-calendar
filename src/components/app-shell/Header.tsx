'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export function Header() {
  const [date, setDate] = useState<Date>(new Date())
  const [open, setOpen] = useState(false)

  const handleSelect = (d: Date | undefined) => {
    if (d) setDate(d)
    setOpen(false)
  }

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-4 backdrop-blur-sm">
      <div className="flex-1" />
      <div className="flex flex-1 items-center justify-center">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                'gap-2 font-normal text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-50'
              )}
            >
              <CalendarIcon className="h-4 w-4" />
              {format(date, 'EEE, MMM d, yyyy')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <CalendarPicker value={date} onSelect={handleSelect} />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-1 items-center justify-end">
        <Avatar className="h-8 w-8 border border-zinc-700">
          <AvatarFallback className="bg-zinc-700 text-xs text-zinc-300">
            U
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}

function CalendarPicker({
  value,
  onSelect,
}: {
  value: Date
  onSelect: (d: Date | undefined) => void
}) {
  const today = new Date()
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - 3 + i)
    return d
  })
  return (
    <div className="flex gap-1 p-2">
      {days.map((d) => (
        <button
          key={d.toISOString()}
          type="button"
          onClick={() => onSelect(d)}
          className={cn(
            'rounded-md px-2 py-1 text-sm transition-colors',
            value.toDateString() === d.toDateString()
              ? 'bg-zinc-700 text-zinc-50'
              : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-50'
          )}
        >
          {format(d, 'EEE d')}
        </button>
      ))}
    </div>
  )
}

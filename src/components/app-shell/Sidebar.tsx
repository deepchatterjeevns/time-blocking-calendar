'use client'

import { Calendar, ListTodo, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const unscheduledMock = ['Review PR', 'Plan sprint', 'Email follow-up']

export function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean
  onToggle: () => void
}) {
  return (
    <aside
      className={cn(
        'flex shrink-0 flex-col border-r border-zinc-800 bg-zinc-900/80 backdrop-blur-md transition-[width] duration-200',
        collapsed ? 'w-14' : 'w-56'
      )}
    >
      <div className="flex h-12 items-center border-b border-zinc-800 px-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="shrink-0 text-zinc-400 hover:text-zinc-50"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className="text-lg font-semibold">{collapsed ? '→' : '←'}</span>
        </Button>
        {!collapsed && (
          <span className="ml-2 truncate text-sm font-medium text-zinc-50">
            Time Block
          </span>
        )}
      </div>
      <nav className="flex flex-col gap-0.5 p-2">
        <a
          href="#"
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-50"
        >
          <Calendar className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Calendar</span>}
        </a>
        <a
          href="#"
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-50"
        >
          <Settings className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </a>
      </nav>
      {!collapsed && (
        <div className="mt-4 flex flex-col gap-1 border-t border-zinc-800 px-2 pt-4">
          <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-zinc-500">
            <ListTodo className="h-3.5 w-3.5" />
            Unscheduled Tasks
          </div>
          <ul className="space-y-0.5">
            {unscheduledMock.map((task) => (
              <li
                key={task}
                className="rounded-md px-2 py-1.5 text-sm text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-300"
              >
                {task}
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  )
}

'use client'

import { Calendar, CheckSquare, Settings, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const NAV_ITEMS = [
  { icon: Calendar, label: 'Calendar', active: true },
  { icon: CheckSquare, label: 'Tasks', active: false },
  { icon: User, label: 'Profile', active: false },
  { icon: Settings, label: 'Settings', active: false },
]

export function Sidebar() {
  return (
    <aside className="flex h-screen w-[70px] flex-col items-center border-r bg-zinc-50/50 py-4 dark:bg-zinc-900/50 backdrop-blur-xl z-20">
      <div className="mb-6">
        <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl shadow-lg shadow-primary/20">
          M
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-3 w-full px-2 items-center">
        {NAV_ITEMS.map((item) => (
          <Button
            key={item.label}
            variant="ghost"
            size="icon"
            className={cn(
              'h-10 w-10 rounded-xl transition-all',
              item.active
                ? 'bg-primary/10 text-primary hover:bg-primary/20'
                : 'text-zinc-500 hover:bg-zinc-200/50 dark:text-zinc-400 dark:hover:bg-zinc-800'
            )}
            title={item.label}
          >
            <item.icon strokeWidth={2} className="h-5 w-5" />
          </Button>
        ))}
      </nav>

      <div className="mt-auto pb-4">
        {/* Footer actions if needed */}
      </div>
    </aside>
  )
}

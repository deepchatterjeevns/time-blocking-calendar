'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { LogOut } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

function getInitials(user: User): string {
  const name = user.user_metadata?.full_name ?? user.user_metadata?.name
  if (name && typeof name === 'string') {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }
  const email = user.email
  if (email) return email.slice(0, 2).toUpperCase()
  return 'U'
}

export function UserNav() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const getInitialUser = async () => {
      const {
        data: { user: u },
      } = await supabase.auth.getUser()
      setUser(u ?? null)
    }
    getInitialUser()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- supabase client is stable
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (!user) {
    return (
      <Avatar className="h-8 w-8 border border-zinc-700">
        <AvatarFallback className="bg-zinc-700 text-xs text-zinc-300">
          —
        </AvatarFallback>
      </Avatar>
    )
  }

  const avatarUrl =
    user.user_metadata?.avatar_url ?? user.user_metadata?.picture

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8 border border-zinc-700">
            {avatarUrl && (
              <AvatarImage src={avatarUrl} alt={user.email ?? 'User'} />
            )}
            <AvatarFallback className="bg-zinc-700 text-xs text-zinc-300">
              {getInitials(user)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

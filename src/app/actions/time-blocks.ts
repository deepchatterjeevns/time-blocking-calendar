'use server'

import { createClient } from '@/lib/supabase/server'
import { TimeBlock } from '@/types/database'
import { revalidatePath } from 'next/cache'

export async function fetchTimeBlocks(date: Date) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User not authenticated')
    }

    // Filter by user_id and maybe date range (for now just get all or filter in query)
    // Ideally we filter by start_time range matching the "Day"
    // For MVP: fetch all for the user and filter in memory or add simple date filter

    const { data, error } = await supabase
        .from('time_blocks')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: true })

    if (error) {
        throw new Error(error.message)
    }

    return data as TimeBlock[]
}

export async function createTimeBlock(block: Omit<TimeBlock, 'id' | 'created_at' | 'user_id'>) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
        .from('time_blocks')
        .insert({
            ...block,
            user_id: user.id
        })
        .select()
        .single()

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/')
    return data as TimeBlock
}

export async function updateTimeBlock(id: string, updates: Partial<TimeBlock>) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
        .from('time_blocks')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/')
    return data as TimeBlock
}

export async function deleteTimeBlock(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User not authenticated')
    }

    const { error } = await supabase
        .from('time_blocks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/')
    return true
}

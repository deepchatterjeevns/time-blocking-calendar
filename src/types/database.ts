export interface TimeBlock {
  id: string
  user_id: string
  title: string
  start_time: string // ISO string
  end_time: string   // ISO string
  category: 'work' | 'personal' | 'health' | 'other'
  created_at: string
}

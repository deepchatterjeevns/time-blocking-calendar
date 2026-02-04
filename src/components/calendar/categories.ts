export const BLOCK_CATEGORIES = [
  {
    id: 'work',
    label: 'Work',
    bgClass: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
    borderClass: 'border-indigo-500' // Kept for compatibility, but intended for "borderless" look
  },
  {
    id: 'personal',
    label: 'Personal',
    bgClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    borderClass: 'border-blue-500'
  },
  {
    id: 'health',
    label: 'Health',
    bgClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    borderClass: 'border-emerald-500'
  },
  {
    id: 'other',
    label: 'Other',
    bgClass: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800/40 dark:text-zinc-300',
    borderClass: 'border-zinc-500'
  },
] as const

export type CategoryId = (typeof BLOCK_CATEGORIES)[number]['id']

export function getCategory(id: CategoryId) {
  return BLOCK_CATEGORIES.find((c) => c.id === id) ?? BLOCK_CATEGORIES[3]
}

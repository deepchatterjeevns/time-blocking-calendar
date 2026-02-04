export const BLOCK_CATEGORIES = [
  { id: 'work', label: 'Work', color: 'blue', borderClass: 'border-l-blue-500', bgClass: 'bg-blue-500/20' },
  { id: 'health', label: 'Health', color: 'green', borderClass: 'border-l-green-500', bgClass: 'bg-green-500/20' },
  { id: 'personal', label: 'Personal', color: 'violet', borderClass: 'border-l-violet-500', bgClass: 'bg-violet-500/20' },
  { id: 'other', label: 'Other', color: 'zinc', borderClass: 'border-l-zinc-500', bgClass: 'bg-zinc-500/20' },
] as const

export type CategoryId = (typeof BLOCK_CATEGORIES)[number]['id']

export function getCategory(id: CategoryId) {
  return BLOCK_CATEGORIES.find((c) => c.id === id) ?? BLOCK_CATEGORIES[3]
}

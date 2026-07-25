const RECENT_SEARCHES_KEY = 'recent_searches_history'
const MAX_RECENT_ITEMS = 10

export function getRecentSearches(): string[] {
  try {
    const data = localStorage.getItem(RECENT_SEARCHES_KEY)
    if (!data) return []
    const parsed = JSON.parse(data)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('Failed to parse recent searches:', error)
    return []
  }
}

export function addRecentSearch(query: string): string[] {
  const trimmed = query ? query.trim() : ''
  if (!trimmed || trimmed.length < 2) return getRecentSearches()

  try {
    const current = getRecentSearches()
    const filtered = current.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())
    const updated = [trimmed, ...filtered].slice(0, MAX_RECENT_ITEMS)
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
    return updated
  } catch (error) {
    console.error('Failed to save recent search:', error)
    return getRecentSearches()
  }
}

export function removeRecentSearch(query: string): string[] {
  try {
    const current = getRecentSearches()
    const updated = current.filter((item) => item.toLowerCase() !== query.toLowerCase())
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
    return updated
  } catch (error) {
    console.error('Failed to remove recent search:', error)
    return getRecentSearches()
  }
}

export function clearRecentSearches(): void {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY)
  } catch (error) {
    console.error('Failed to clear recent searches:', error)
  }
}

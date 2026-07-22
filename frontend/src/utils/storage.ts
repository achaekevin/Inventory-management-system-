// LocalStorage utilities with type safety and error handling

export const storage = {
  // Get item from localStorage
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key)
      if (item === null) return defaultValue ?? null
      return JSON.parse(item) as T
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error)
      return defaultValue ?? null
    }
  },

  // Set item in localStorage
  set: <T>(key: string, value: T): boolean => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error(`Error writing to localStorage (${key}):`, error)
      return false
    }
  },

  // Remove item from localStorage
  remove: (key: string): boolean => {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error)
      return false
    }
  },

  // Clear all localStorage
  clear: (): boolean => {
    try {
      localStorage.clear()
      return true
    } catch (error) {
      console.error('Error clearing localStorage:', error)
      return false
    }
  },

  // Check if key exists
  has: (key: string): boolean => {
    return localStorage.getItem(key) !== null
  },

  // Get all keys
  keys: (): string[] => {
    return Object.keys(localStorage)
  },
}

// SessionStorage utilities
export const sessionStorage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = window.sessionStorage.getItem(key)
      if (item === null) return defaultValue ?? null
      return JSON.parse(item) as T
    } catch (error) {
      console.error(`Error reading from sessionStorage (${key}):`, error)
      return defaultValue ?? null
    }
  },

  set: <T>(key: string, value: T): boolean => {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error(`Error writing to sessionStorage (${key}):`, error)
      return false
    }
  },

  remove: (key: string): boolean => {
    try {
      window.sessionStorage.removeItem(key)
      return true
    } catch (error) {
      console.error(`Error removing from sessionStorage (${key}):`, error)
      return false
    }
  },

  clear: (): boolean => {
    try {
      window.sessionStorage.clear()
      return true
    } catch (error) {
      console.error('Error clearing sessionStorage:', error)
      return false
    }
  },

  has: (key: string): boolean => {
    return window.sessionStorage.getItem(key) !== null
  },
}

// Cookie utilities
export const cookies = {
  get: (name: string): string | null => {
    const matches = document.cookie.match(
      new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)')
    )
    return matches ? decodeURIComponent(matches[1]) : null
  },

  set: (
    name: string,
    value: string,
    options: {
      expires?: number | Date
      path?: string
      domain?: string
      secure?: boolean
      sameSite?: 'strict' | 'lax' | 'none'
    } = {}
  ): void => {
    let updatedCookie = encodeURIComponent(name) + '=' + encodeURIComponent(value)

    if (options.expires) {
      if (typeof options.expires === 'number') {
        const date = new Date()
        date.setTime(date.getTime() + options.expires * 1000)
        options.expires = date
      }
      updatedCookie += '; expires=' + options.expires.toUTCString()
    }

    if (options.path) {
      updatedCookie += '; path=' + options.path
    }

    if (options.domain) {
      updatedCookie += '; domain=' + options.domain
    }

    if (options.secure) {
      updatedCookie += '; secure'
    }

    if (options.sameSite) {
      updatedCookie += '; samesite=' + options.sameSite
    }

    document.cookie = updatedCookie
  },

  remove: (name: string, path: string = '/'): void => {
    cookies.set(name, '', { expires: -1, path })
  },
}

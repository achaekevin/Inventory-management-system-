import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  // Sidebar
  isSidebarOpen: boolean
  isSidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebarOpen: (isOpen: boolean) => void
  toggleSidebarCollapse: () => void
  
  // Theme
  theme: 'light' | 'dark' | 'system'
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  
  // Command Palette
  isCommandPaletteOpen: boolean
  toggleCommandPalette: () => void
  setCommandPaletteOpen: (isOpen: boolean) => void
  
  // Search
  isSearchOpen: boolean
  toggleSearch: () => void
  setSearchOpen: (isOpen: boolean) => void
  
  // Notifications
  isNotificationsPanelOpen: boolean
  toggleNotificationsPanel: () => void
  setNotificationsPanelOpen: (isOpen: boolean) => void
  
  // Selected Warehouse/Company
  selectedWarehouseId: string | null
  selectedCompanyId: string | null
  setSelectedWarehouse: (warehouseId: string | null) => void
  setSelectedCompany: (companyId: string | null) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Sidebar
      isSidebarOpen: true,
      isSidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
      toggleSidebarCollapse: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      
      // Theme
      theme: 'system',
      setTheme: (theme) => {
        set({ theme })
        
        // Apply theme to document
        const root = window.document.documentElement
        root.classList.remove('light', 'dark')
        
        if (theme === 'system') {
          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
          root.classList.add(systemTheme)
        } else {
          root.classList.add(theme)
        }
      },
      
      // Command Palette
      isCommandPaletteOpen: false,
      toggleCommandPalette: () => set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),
      setCommandPaletteOpen: (isOpen) => set({ isCommandPaletteOpen: isOpen }),
      
      // Search
      isSearchOpen: false,
      toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
      setSearchOpen: (isOpen) => set({ isSearchOpen: isOpen }),
      
      // Notifications
      isNotificationsPanelOpen: false,
      toggleNotificationsPanel: () => set((state) => ({ isNotificationsPanelOpen: !state.isNotificationsPanelOpen })),
      setNotificationsPanelOpen: (isOpen) => set({ isNotificationsPanelOpen: isOpen }),
      
      // Selected Warehouse/Company
      selectedWarehouseId: null,
      selectedCompanyId: null,
      setSelectedWarehouse: (warehouseId) => set({ selectedWarehouseId: warehouseId }),
      setSelectedCompany: (companyId) => set({ selectedCompanyId: companyId }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        isSidebarCollapsed: state.isSidebarCollapsed,
        theme: state.theme,
        selectedWarehouseId: state.selectedWarehouseId,
        selectedCompanyId: state.selectedCompanyId,
      }),
    }
  )
)

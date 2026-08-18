import { RouterProvider } from 'react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { LocalizationProvider } from '@/contexts/localization-context'
import { queryClient } from '@/lib/query-client'
import { router } from '@/routes'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LocalizationProvider>
          <RouterProvider router={router} />
          <Toaster position="top-right" richColors />
        </LocalizationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App

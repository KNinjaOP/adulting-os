import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import { ThemeProvider } from './context/ThemeContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,   // data is fresh for 5 minutes
      gcTime: 10 * 60 * 1000,     // keep cache for 10 minutes
      retry: 1,
      refetchOnWindowFocus: false, // don't refetch every time user switches tabs
      refetchOnMount: false,       // don't refetch if data is still fresh
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <NotificationProvider>
              <App />
              <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  fontSize: '0.875rem',
                },
                success: { iconTheme: { primary: '#10b981', secondary: 'transparent' } },
                error: { iconTheme: { primary: '#f43f5e', secondary: 'transparent' } },
              }}
            />
          </NotificationProvider>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)

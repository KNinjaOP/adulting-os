import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

const darkTokens = {
  '--bg-base': '#11111b',
  '--bg-surface': '#1e1e2e',
  '--bg-elevated': '#181825',
  '--bg-card': 'rgba(30, 30, 46, 0.7)',
  '--text-primary': '#cdd6f4',
  '--text-secondary': '#a6adc8',
  '--text-muted': '#6c7086',
  '--text-faint': '#45475a',
  '--border': 'rgba(69, 71, 90, 0.5)',
  '--border-strong': 'rgba(69, 71, 90, 0.8)',
  '--glass-bg': 'rgba(30, 30, 46, 0.7)',
  '--input-bg': 'rgba(17, 17, 27, 0.8)',
  '--scrollbar-track': '#1e1e2e',
  '--scrollbar-thumb': '#45475a',
  '--sidebar-bg': 'rgba(24, 24, 37, 0.95)',
  '--header-bg': 'rgba(17, 17, 27, 0.8)',
}

const lightTokens = {
  '--bg-base': '#f0f0f8',
  '--bg-surface': '#ffffff',
  '--bg-elevated': '#e8e8f5',
  '--bg-card': 'rgba(255, 255, 255, 0.9)',
  '--text-primary': '#1e1e2e',
  '--text-secondary': '#313244',
  '--text-muted': '#585b70',
  '--text-faint': '#7c7f93',
  '--border': 'rgba(99, 102, 241, 0.18)',
  '--border-strong': 'rgba(99, 102, 241, 0.3)',
  '--glass-bg': 'rgba(255, 255, 255, 0.9)',
  '--input-bg': 'rgba(240, 240, 248, 0.9)',
  '--scrollbar-track': '#e8e8f5',
  '--scrollbar-thumb': '#a5b4fc',
  '--sidebar-bg': 'rgba(255, 255, 255, 0.95)',
  '--header-bg': 'rgba(248, 248, 255, 0.9)',
}

const applyTokens = (tokens) => {
  const root = document.documentElement
  Object.entries(tokens).forEach(([key, val]) => root.style.setProperty(key, val))
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')

  useEffect(() => {
    applyTokens(theme === 'dark' ? darkTokens : lightTokens)
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  // Apply on first render
  useEffect(() => {
    applyTokens(theme === 'dark' ? darkTokens : lightTokens)
    document.documentElement.setAttribute('data-theme', theme)
  }, [])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)

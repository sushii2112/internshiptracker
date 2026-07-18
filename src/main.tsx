import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { applyTheme } from './context/ThemeContext'

// Apply the saved theme before first paint to avoid a flash of the wrong theme.
const stored = localStorage.getItem('offerflow-theme')
applyTheme(stored === 'light' || stored === 'dark' ? stored : 'system')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app/App.tsx'
import { ThemeProvider } from './theme/ThemeContext.tsx'
import { defaultAppPalette } from './theme/palettes.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider palette={defaultAppPalette}>
      <App />
    </ThemeProvider>
  </StrictMode>,
)

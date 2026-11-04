import { createRoot } from 'react-dom/client'
import '@fontsource/space-grotesk/latin-400.css'
import '@fontsource/space-grotesk/latin-500.css'
import '@fontsource/space-grotesk/latin-700.css'
import '@fontsource/unbounded/latin-500.css'
import '@fontsource/unbounded/latin-700.css'
import '@fontsource/unbounded/latin-800.css'
import './styles/global.css'
import './styles/sections.css'
import App from './App.jsx'

// Cinematic capture mode: keeps DOM typography at full resolution while
// rendering the WebGL field at a lighter internal resolution for smooth
// screen recording on integrated GPUs.
if (new URLSearchParams(window.location.search).has('capture')) {
  document.documentElement.classList.add('capture-mode')
}

createRoot(document.getElementById('root')).render(<App />)

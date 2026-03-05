import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './app.css'

// Card styles – imported here so Vite tracks them in the module graph (enables HMR)
import './css/global.css'
import './css/cards/base.css'
import './css/cards.css'
import './css/cards/basic.css'
import './css/cards/reverse-holo.css'
import './css/cards/regular-holo.css'
import './css/cards/cosmos-holo.css'
import './css/cards/amazing-rare.css'
import './css/cards/radiant-holo.css'
import './css/cards/v-regular.css'
import './css/cards/v-full-art.css'
import './css/cards/v-max.css'
import './css/cards/v-star.css'
import './css/cards/trainer-full-art.css'
import './css/cards/rainbow-holo.css'
import './css/cards/rainbow-alt.css'
import './css/cards/secret-rare.css'
import './css/cards/trainer-gallery-holo.css'
import './css/cards/trainer-gallery-v-regular.css'
import './css/cards/trainer-gallery-v-max.css'
import './css/cards/trainer-gallery-secret-rare.css'
import './css/cards/shiny-rare.css'
import './css/cards/shiny-v.css'
import './css/cards/shiny-vmax.css'
import './css/cards/swsh-pikachu.css'
// import './css/cards/hsr-holo.css'

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)

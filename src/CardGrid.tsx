import React, { useRef } from 'react'
import { useActiveCard } from './lib/stores/useActiveCard'

interface CardGridProps {
  children: React.ReactNode
}

const CardGrid: React.FC<CardGridProps> = ({ children }) => {
  const gridRef = useRef<HTMLElement>(null)
  const { activeCard } = useActiveCard()

  const isActive = !!(activeCard && gridRef.current?.contains(activeCard))

  return (
    <section
      ref={gridRef}
      className={`card-grid${isActive ? ' active' : ''}`}
    >
      {children}
    </section>
  )
}

export default CardGrid

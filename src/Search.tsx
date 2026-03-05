import React, { useState, useCallback, useRef, useEffect } from 'react'
import pokemon from 'pokemontcgsdk'
import CardGrid from './CardGrid'
import CardProxy from './lib/components/CardProxy'

pokemon.configure({ apiKey: import.meta.env.VITE_API_KEY })

interface PokemonCard {
  id: string
  name: string
  number: string
  set: { id: string } | string
  types?: string[]
  supertype?: string
  subtypes?: string[]
  rarity?: string
  isReverse?: boolean
}

interface SearchProps {
  query: string
  onQueryChange: (q: string) => void
}

function useDebounce<T extends (...args: unknown[]) => unknown>(fn: T, delay: number): T {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  return useCallback(
    ((...args) => {
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => fn(...args), delay)
    }) as T,
    [fn, delay]
  )
}

const Search: React.FC<SearchProps> = ({ query, onQueryChange }) => {
  const [results, setResults]       = useState<PokemonCard[]>([])
  const [loadingQ, setLoadingQ]     = useState(false)
  const [isError, setIsError]       = useState(false)

  const usableQuery = query.length > 2

  const doSearch = useCallback(async (q: string) => {
    if (q.length <= 2) return
    setLoadingQ(true)
    setIsError(false)
    try {
      const result = await (pokemon.card as any).where({
        q:       `( set.id:swsh* AND name:"*${q}*" )`,
        select:  `id,name,number,supertype,subtypes,rarity,images,types,set`,
        orderBy: `-set.releaseDate,-number`,
        pageSize: 36,
      })
      const cards: PokemonCard[] = (result.data ?? []).slice(0, 36).map((card: PokemonCard) => {
        const c = { ...card, set: typeof card.set === 'object' ? (card.set as {id:string}).id : card.set }
        if (c.rarity === 'Common' || c.rarity === 'Uncommon') {
          c.isReverse = !!Math.round(Math.random())
        }
        return c
      })
      setResults(cards)
    } catch {
      setResults([])
      setIsError(true)
    } finally {
      setLoadingQ(false)
    }
  }, [])

  const debouncedSearch = useDebounce(doSearch as (...args: unknown[]) => unknown, 666)

  useEffect(() => {
    debouncedSearch(query)
  }, [query])

  return (
    <>
      <section className="search-area">
        <input
          type="search"
          name="search"
          id="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="eg: Morpeko or Marnie"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="icon icon-tabler icon-tabler-search"
          width="24" height="24" viewBox="0 0 24 24"
          strokeWidth="1.25" stroke="currentColor" fill="none"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
          <path d="M21 21l-6 -6" />
        </svg>
      </section>

      {!query && <h3>Browse cards below, Or search for your favourite!</h3>}
      {usableQuery && loadingQ && <h3>Fetching Cards...</h3>}

      {usableQuery && results.length > 0 && (
        <CardGrid>
          {results.map((card) => (
            <CardProxy
              key={card.id}
              id={card.id}
              name={card.name}
              set={typeof card.set === 'string' ? card.set : (card.set as {id:string}).id}
              number={card.number}
              types={card.types}
              supertype={card.supertype}
              subtypes={card.subtypes}
              rarity={card.rarity}
              isReverse={card.isReverse}
            />
          ))}
        </CardGrid>
      )}

      {(isError || (usableQuery && !loadingQ && results.length === 0)) && (
        <>
          <h3>Error: No cards found with that name.</h3>
          <CardGrid>
            <CardProxy
              id="basep-16"
              name="Computer Error"
              set="basep"
              number="16"
              img="https://images.pokemontcg.io/basep/16_hires.png"
              supertype="Trainer"
              subtypes={['Rocket\'s Secret Machine']}
              rarity="Promo"
              isReverse={false}
            />
          </CardGrid>
        </>
      )}
    </>
  )
}

export default Search

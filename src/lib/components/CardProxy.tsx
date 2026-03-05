import React from 'react'
import Card, { type CardProps } from './Card'
import altArts from './alternate-arts.json'
import promos from './promos.json'

interface PromoEntry {
  style: string
  etch: string
}

interface CardProxyProps extends Omit<CardProps, 'img' | 'foil' | 'mask'> {
  isReverse?: boolean
  img?: string
  foil?: string
  mask?: string
}

const server = import.meta.env.VITE_CDN ?? ''

function isDefined<T>(v: T | undefined | null): v is T {
  return typeof v !== 'undefined' && v !== null
}

function CardProxy(rawProps: CardProxyProps) {
  // ── destructure ─────────────────────────────────────────────────────────
  let {
    id       = '',
    name,
    number   = '',
    set      = '',
    types,
    subtypes,
    supertype,
    rarity   = '',
    isReverse = false,
    img: imgProp,
    back,
    foil: foilProp,
    mask: maskProp,
    showcase = false,
  } = rawProps

  // ── classify ─────────────────────────────────────────────────────────────
  const numLower   = number.toString().toLowerCase()
  const isShiny    = isDefined(number) && numLower.startsWith('sv')
  const isGallery  = isDefined(number) && !!numLower.match(/^[tg]g/i)
  const isAlternate = isDefined(id) && (altArts as string[]).includes(id) && !isShiny && !isGallery
  const isPromo    = isDefined(set) && set === 'swshp'

  // ── mutate rarity ─────────────────────────────────────────────────────────
  if (isReverse) rarity = rarity + ' Reverse Holo'

  if (isGallery) {
    if (isDefined(rarity) && rarity.startsWith('Trainer Gallery')) {
      rarity = rarity.replace(/Trainer Gallery\s*/, '')
    }
    const subArr = Array.isArray(subtypes) ? subtypes : [subtypes ?? '']
    if (isDefined(rarity) && rarity.includes('Rare Holo V') && subArr.includes('VMAX')) {
      rarity = 'Rare Holo VMAX'
    }
    if (isDefined(rarity) && rarity.includes('Rare Holo V') && subArr.includes('VSTAR')) {
      rarity = 'Rare Holo VSTAR'
    }
  }

  if (isPromo) {
    const subArr = Array.isArray(subtypes) ? subtypes : [subtypes ?? '']
    if (id === 'swshp-SWSH076' || id === 'swshp-SWSH077') {
      rarity = 'Rare Secret'
    } else if (subArr.includes('V'))       rarity = 'Rare Holo V'
    else if (subArr.includes('V-UNION'))   rarity = 'Rare Holo VUNION'
    else if (subArr.includes('VMAX'))      rarity = 'Rare Holo VMAX'
    else if (subArr.includes('VSTAR'))     rarity = 'Rare Holo VSTAR'
    else if (subArr.includes('Radiant'))   rarity = 'Radiant Rare'
  }

  // ── image helpers ─────────────────────────────────────────────────────────
  function cardImage(): string {
    if (isDefined(imgProp)) return imgProp
    if (isDefined(set) && isDefined(number)) {
      return `https://images.pokemontcg.io/${set.toLowerCase()}/${number}_hires.png`
    }
    return ''
  }

  function foilMaskImage(prop: string | undefined, type: 'foils' | 'masks'): string {
    if (isDefined(prop)) return prop === '' ? '' : prop

    if (
      !isDefined(rarity) || !isDefined(subtypes) ||
      !isDefined(supertype) || !isDefined(set) || !isDefined(number)
    ) return ''

    const fRarity = rarity.toLowerCase()
    const fNumber = number.toString().toLowerCase().replace('swsh', '').padStart(3, '0')
    const fSet    = set.toString().toLowerCase().replace(/(tg|gg|sv)/, '')
    const subArr  = Array.isArray(subtypes) ? subtypes : [subtypes ?? '']

    let etch  = 'holo'
    let style = 'reverse'
    const ext = 'webp'

    if (fRarity === 'rare holo')        style = 'swholo'
    if (fRarity === 'rare holo cosmos') style = 'cosmos'
    if (fRarity === 'radiant rare')     { etch = 'etched'; style = 'radiantholo' }
    if (fRarity === 'rare holo v' || fRarity === 'rare holo vunion' || fRarity === 'basic v') {
      etch = 'holo'; style = 'sunpillar'
    }
    if (fRarity === 'rare holo vmax' || fRarity === 'rare ultra' || fRarity === 'rare holo vstar') {
      etch = 'etched'; style = 'sunpillar'
    }
    if (fRarity === 'amazing rare' || fRarity === 'rare rainbow' || fRarity === 'rare secret') {
      etch = 'etched'; style = 'swsecret'
    }

    if (isShiny) {
      etch = 'etched'; style = 'sunpillar'
      if (fRarity === 'rare shiny v' || (fRarity === 'rare holo v' && fNumber.startsWith('sv'))) {
        rarity = 'Rare Shiny V'
      }
      if (fRarity === 'rare shiny vmax' || (fRarity === 'rare holo vmax' && fNumber.startsWith('sv'))) {
        style = 'swsecret'; rarity = 'Rare Shiny VMAX'
      }
    }

    if (isGallery) {
      etch = 'holo'; style = 'rainbow'
      if (fRarity.includes('rare holo v') || fRarity.includes('rare ultra')) {
        etch = 'etched'; style = 'sunpillar'
      }
      if (fRarity.includes('rare secret')) {
        etch = 'etched'; style = 'swsecret'
      }
    }

    if (isAlternate) {
      etch = 'etched'
      if (subArr.includes('VMAX')) {
        style = 'swsecret'; rarity = 'Rare Rainbow Alt'
      } else {
        style = 'sunpillar'
      }
    }

    if (isPromo) {
      const promoMap = promos as Record<string, PromoEntry>
      const promoStyle = promoMap[id]
      if (promoStyle) {
        style = promoStyle.style.toLowerCase()
        etch  = promoStyle.etch.toLowerCase()
        if (style === 'swholo')  rarity = 'Rare Holo'
        if (style === 'cosmos')  rarity = 'Rare Holo Cosmos'
      }
    }

    return `${server}/foils/${fSet}/${type}/upscaled/${fNumber}_foil_${etch}_${style}_2x.${ext}`
  }

  const proxy: CardProps = {
    id,
    name,
    number,
    set,
    types,
    subtypes,
    supertype,
    rarity,
    showcase,
    img:  cardImage(),
    back,
    foil: foilMaskImage(foilProp, 'foils'),
    mask: foilMaskImage(maskProp,  'masks'),
  }

  return <Card {...proxy} />
}

export default CardProxy

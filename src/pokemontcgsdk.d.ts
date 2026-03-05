declare module 'pokemontcgsdk' {
  interface CardWhereParams {
    q?: string
    select?: string
    orderBy?: string
    pageSize?: number
  }

  interface CardResult {
    data: any[]
    totalCount?: number
  }

  interface CardApi {
    where(params: CardWhereParams): Promise<CardResult>
    find(id: string): Promise<{ data: any }>
  }

  interface Pokemon {
    card: CardApi
    configure(options: { apiKey: string }): void
  }

  const pokemon: Pokemon
  export default pokemon
}

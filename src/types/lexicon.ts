export interface LexiconEntry {
  strongsId: string
  greek: string
  greekBare: string
  transliteration: string
  pronunciation: string
  shortDef: string
  fullDef: string
  strongsDef: string
  derivation: string
}

export interface SearchResult {
  entry: LexiconEntry
  matchType: 'exact' | 'prefix' | 'fuzzy'
  score?: number
}

import { LexiconEntry } from '@/types/lexicon'
import { initializeSearch } from './search'
import lexiconData from '../../../data/lexicon.json'

let initialized = false

export function getLexicon(): LexiconEntry[] {
  if (!initialized) {
    initializeSearch(lexiconData as LexiconEntry[])
    initialized = true
  }
  return lexiconData as LexiconEntry[]
}

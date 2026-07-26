import Fuse from 'fuse.js'
import { LexiconEntry, SearchResult } from '@/types/lexicon'
import { normalizeTranslit, greekToTranslit, stripDiacritics } from './transliteration'

function isGreekInput(text: string): boolean {
  return /[Ͱ-Ͽἀ-῿]/.test(text)
}

let entries: LexiconEntry[] = []
let bareTranslitMap: Map<LexiconEntry, string> = new Map()
let stemIndex: Map<string, LexiconEntry[]> = new Map()
let fuseIndex: Fuse<LexiconEntry>

// Map of common inflected forms to their lemma's Strong's number
// Covers the most frequently encountered forms in the NT
const INFLECTED_FORMS: Record<string, string[]> = {
  // Article ὁ, ἡ, τό (G3588)
  'ta': ['G3588'], 'to': ['G3588'], 'ton': ['G3588'], 'ten': ['G3588'],
  'tes': ['G3588'], 'tou': ['G3588'], 'te': ['G3588'], 'tois': ['G3588'],
  'tais': ['G3588'], 'tous': ['G3588'], 'tas': ['G3588'],
  'hoi': ['G3588'], 'hai': ['G3588'],
  // αὐτός (G846)
  'auton': ['G846'], 'autou': ['G846'], 'auto': ['G846'], 'aute': ['G846'],
  'autoi': ['G846'], 'autois': ['G846'], 'autas': ['G846'],
  'auten': ['G846'], 'autes': ['G846'],
  // ἐγώ (G1473)
  'emou': ['G1473'], 'mou': ['G1473'], 'emoi': ['G1473'], 'moi': ['G1473'],
  'eme': ['G1473'], 'me': ['G1473'],
  // σύ (G4771)
  'sou': ['G4771'], 'soi': ['G4771'], 'se': ['G4771'],
  // ἡμεῖς (G2249)
  'hemon': ['G2249'], 'hemin': ['G2249'], 'hemas': ['G2249'],
  // οὗτος (G3778)
  'touto': ['G3778'], 'toutou': ['G3778'], 'touten': ['G3778'],
  'toutois': ['G3778'], 'tauta': ['G3778'], 'touton': ['G3778'],
  'haute': ['G3778'], 'hautes': ['G3778'],
  // εἰμί - to be (G1510)
  'estin': ['G1510'], 'eimi': ['G1510'], 'este': ['G1510'],
  'en': ['G1510'], 'esmen': ['G1510'],
  // λέγω - say (G3004)
  'legei': ['G3004'], 'legon': ['G3004'], 'legontes': ['G3004'],
  'lego': ['G3004'], 'legomen': ['G3004'], 'eipe': ['G3004'],
  'eipen': ['G3004'], 'eipon': ['G3004'],
  // ἔχω - have (G2192)
  'echei': ['G2192'], 'echon': ['G2192'], 'echontes': ['G2192'],
  'echo': ['G2192'], 'echomen': ['G2192'],
  // γίνομαι - become (G1096)
  'ginetai': ['G1096'], 'egeneto': ['G1096'], 'gegonen': ['G1096'],
  // Common inflected nouns
  'logon': ['G3056'], 'logou': ['G3056'], 'logo': ['G3056'], 'logoi': ['G3056'],
  'logois': ['G3056'], 'logous': ['G3056'],
  'theou': ['G2316'], 'theo': ['G2316'], 'theon': ['G2316'],
  'theoi': ['G2316'], 'theous': ['G2316'],
  'christou': ['G5547'], 'christo': ['G5547'], 'christon': ['G5547'],
  'iesou': ['G2424'], 'iesoun': ['G2424'],
  'pneumatos': ['G4151'], 'pneumati': ['G4151'], 'pneumata': ['G4151'],
  'pisteos': ['G4102'], 'pistei': ['G4102'], 'pistin': ['G4102'],
  'agapen': ['G26'], 'agapes': ['G26'], 'agape': ['G26'],
  'hamartian': ['G266'], 'hamartias': ['G266'], 'hamartiai': ['G266'],
  'anthropou': ['G444'], 'anthropon': ['G444'], 'anthropo': ['G444'],
  'anthropoi': ['G444'], 'anthropois': ['G444'], 'anthropous': ['G444'],
  'kosmou': ['G2889'], 'kosmo': ['G2889'], 'kosmon': ['G2889'],
  'ouranou': ['G3772'], 'ouranon': ['G3772'], 'ouranois': ['G3772'],
  'basileian': ['G932'], 'basileias': ['G932'], 'basileia': ['G932'],
  'zoen': ['G2222'], 'zoes': ['G2222'],
  'thanatou': ['G2288'], 'thanaton': ['G2288'], 'thanato': ['G2288'],
  'sarki': ['G4561'], 'sarkos': ['G4561'], 'sarka': ['G4561'],
  'haimatos': ['G129'], 'haima': ['G129'],
  'nomou': ['G3551'], 'nomon': ['G3551'], 'nomo': ['G3551'],
}

// Common Greek inflectional endings (transliterated), longest first
// Covers nouns (all declensions), verbs (present/aorist/etc), adjectives
const INFLECTION_SUFFIXES = [
  // Verb endings
  'omenoi', 'omenon', 'omenos', 'omene', 'ontai', 'ousin', 'onton',
  'oumen', 'ontes', 'ousai', 'menos', 'menon', 'menen', 'menoi',
  'omai', 'omen', 'onte', 'ousi', 'ethe', 'amen', 'anto',
  'eis', 'ein', 'ete', 'eto', 'omen', 'osi',
  'on', 'ou', 'oi', 'os', 'en', 'es', 'ei', 'as', 'an',
  'e', 'a', 'i', 'o',
  // Noun/adjective case endings
  'ous', 'ois', 'ais', 'ous', 'oon', 'ion',
  'ou', 'on', 'oi', 'os', 'es', 'as', 'en', 'ai',
]

function getStemCandidates(query: string): string[] {
  const stems: string[] = []
  for (const suffix of INFLECTION_SUFFIXES) {
    if (query.length > suffix.length + 1 && query.endsWith(suffix)) {
      stems.push(query.slice(0, -suffix.length))
    }
  }
  return [...new Set(stems)]
}

let strongsMap: Map<string, LexiconEntry> = new Map()

export function initializeSearch(data: LexiconEntry[]) {
  entries = data
  bareTranslitMap = new Map()
  stemIndex = new Map()
  strongsMap = new Map()

  for (const entry of entries) {
    bareTranslitMap.set(entry, greekToTranslit(entry.greekBare))
    strongsMap.set(entry.strongsId, entry)

    // Index stems for reverse lookup: strip endings from lemmas
    const translit = entry.transliteration
    // Add the full transliteration
    addToStemIndex(translit, entry)
    // Add stems of the lemma itself (so inflected queries can match)
    for (const suffix of INFLECTION_SUFFIXES) {
      if (translit.length > suffix.length + 1 && translit.endsWith(suffix)) {
        addToStemIndex(translit.slice(0, -suffix.length), entry)
      }
    }
  }

  fuseIndex = new Fuse(entries, {
    keys: [
      { name: 'transliteration', weight: 0.6 },
      { name: 'greekBare', weight: 0.1 },
      { name: 'shortDef', weight: 0.3 },
    ],
    threshold: 0.3,
    includeScore: true,
  })
}

function addToStemIndex(stem: string, entry: LexiconEntry) {
  const existing = stemIndex.get(stem)
  if (existing) {
    if (!existing.includes(entry)) existing.push(entry)
  } else {
    stemIndex.set(stem, [entry])
  }
}

function findByStem(query: string): LexiconEntry[] {
  const results = new Set<LexiconEntry>()

  // Try stripping endings from the query to find matching lemmas
  const candidates = getStemCandidates(query)
  for (const stem of candidates) {
    const matches = stemIndex.get(stem)
    if (matches) {
      for (const m of matches) results.add(m)
    }
  }

  // Also check if any lemma's stem matches the query's stem
  // (query "logon" -> stem "log" -> matches lemma "logos" which has stem "log")
  for (const stem of candidates) {
    for (const entry of entries) {
      if (entry.transliteration.startsWith(stem) && entry.transliteration.length <= stem.length + 4) {
        results.add(entry)
      }
    }
  }

  return [...results]
}

export function search(query: string, limit = 20): SearchResult[] {
  const queryTrimmed = query.trim()
  if (!queryTrimmed) return []

  // Greek character input: match against greekBare (diacritics-stripped Greek)
  if (isGreekInput(queryTrimmed)) {
    return searchGreek(queryTrimmed, limit)
  }

  const normalized = normalizeTranslit(queryTrimmed)
  if (!normalized) return []

  // Check for known inflected forms first (these are high-confidence matches)
  const inflectedIds = INFLECTED_FORMS[normalized]
  const inflectedMatches = inflectedIds
    ? inflectedIds.map(id => strongsMap.get(id)).filter((e): e is LexiconEntry => !!e)
    : []

  // Tier 1: exact and prefix match on transliteration
  const prefixMatches = entries
    .filter(e => {
      if (e.transliteration.startsWith(normalized)) return true
      const bare = bareTranslitMap.get(e) || ''
      return bare.startsWith(normalized)
    })
    .sort((a, b) => {
      const aExact = a.transliteration === normalized ? 0 : 1
      const bExact = b.transliteration === normalized ? 0 : 1
      if (aExact !== bExact) return aExact - bExact
      const aBareExact = (bareTranslitMap.get(a) || '') === normalized ? 0 : 1
      const bBareExact = (bareTranslitMap.get(b) || '') === normalized ? 0 : 1
      if (aBareExact !== bBareExact) return aBareExact - bBareExact
      return a.transliteration.length - b.transliteration.length
    })
    .slice(0, limit)

  // Merge: inflected form matches at top, then prefix matches (deduped)
  if (inflectedMatches.length > 0 || prefixMatches.length > 0) {
    const seen = new Set<string>()
    const combined: SearchResult[] = []

    for (const entry of inflectedMatches) {
      seen.add(entry.strongsId)
      combined.push({ entry, matchType: 'exact' })
    }
    for (const entry of prefixMatches) {
      if (!seen.has(entry.strongsId)) {
        seen.add(entry.strongsId)
        combined.push({
          entry,
          matchType: entry.transliteration === normalized ||
            (bareTranslitMap.get(entry) || '') === normalized
            ? 'exact' : 'prefix',
        })
      }
    }

    if (combined.length > 0) {
      return combined.slice(0, limit)
    }
  }

  // Tier 3: stem/inflection matching (strip endings to find root)
  const stemMatches = findByStem(normalized)
  if (stemMatches.length > 0) {
    return stemMatches
      .sort((a, b) => a.transliteration.length - b.transliteration.length)
      .slice(0, limit)
      .map(entry => ({
        entry,
        matchType: 'fuzzy' as const,
        score: 0.15,
      }))
  }

  // Tier 4: fuzzy match via Fuse.js
  const fuseResults = fuseIndex.search(normalized, { limit })
  return fuseResults.map(r => ({
    entry: r.item,
    matchType: 'fuzzy' as const,
    score: r.score,
  }))
}

function searchGreek(query: string, limit: number): SearchResult[] {
  const bare = stripDiacritics(query).toLowerCase()

  // Exact and prefix match on greekBare (diacritics-stripped Greek)
  const matches = entries
    .filter(e => {
      const entryBare = e.greekBare.toLowerCase()
      return entryBare.startsWith(bare) || entryBare === bare
    })
    .sort((a, b) => {
      const aBare = a.greekBare.toLowerCase()
      const bBare = b.greekBare.toLowerCase()
      const aExact = aBare === bare ? 0 : 1
      const bExact = bBare === bare ? 0 : 1
      if (aExact !== bExact) return aExact - bExact
      return a.greekBare.length - b.greekBare.length
    })
    .slice(0, limit)

  if (matches.length > 0) {
    return matches.map(entry => ({
      entry,
      matchType: entry.greekBare.toLowerCase() === bare ? 'exact' : 'prefix',
    }))
  }

  // Fallback: convert Greek input to transliteration and search normally
  const translit = greekToTranslit(bare)
  if (translit) {
    return search(translit, limit)
  }

  return []
}

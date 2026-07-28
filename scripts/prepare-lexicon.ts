import fs from 'node:fs'
import path from 'node:path'

const STRONGS_PATH = path.join(__dirname, '..', 'data', 'raw', 'strongs-greek-dictionary.js')
const DODSON_PATH = path.join(__dirname, '..', 'data', 'raw', 'dodson.csv')
const OUTPUT_PATH = path.join(__dirname, '..', 'data', 'lexicon.json')

function stripDiacritics(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function normalizeTranslit(input: string): string {
  return stripDiacritics(input)
    .toLowerCase()
    .replace(/[^a-z]/g, '')
}

function cleanDefinition(def: string): string {
  return def
    .replace(/^\s*"?\s*/, '')
    .replace(/\s*"?\s*$/, '')
    .trim()
}

// Parse Dodson's lexicon (TSV with quoted fields)
function parseDodson(): Map<string, { brief: string; full: string }> {
  const map = new Map<string, { brief: string; full: string }>()
  const content = fs.readFileSync(DODSON_PATH, 'utf-8')
  const lines = content.split('\n')

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    // Parse tab-separated quoted fields
    const fields = line.split('\t').map(f => f.replace(/^"|"$/g, ''))
    if (fields.length < 5) continue

    const strongsId = `G${parseInt(fields[0], 10)}`
    const brief = fields[3].trim()
    const full = fields[4].trim()

    if (brief) {
      map.set(strongsId, { brief, full: full || brief })
    }
  }

  return map
}

// Parse Strong's dictionary
const rawContent = fs.readFileSync(STRONGS_PATH, 'utf-8')
const jsonMatch = rawContent.match(/var\s+strongsGreekDictionary\s*=\s*(\{[\s\S]*\})\s*;/)
if (!jsonMatch) {
  console.error('Could not parse dictionary JS file')
  process.exit(1)
}

const strongs: Record<string, {
  lemma: string
  translit: string
  strongs_def: string
  kjv_def: string
  derivation: string
}> = JSON.parse(jsonMatch[1])

const dodson = parseDodson()
console.log(`Loaded ${dodson.size} Dodson entries`)

interface LexiconEntry {
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

const entries: LexiconEntry[] = []
let skipped = 0
let dodsonHits = 0

for (const [key, value] of Object.entries(strongs)) {
  if (!value.lemma || !value.translit) {
    skipped++
    continue
  }

  const translitNormalized = normalizeTranslit(value.translit)
  const strongsDef = cleanDefinition(value.strongs_def || '')
  const dodsonEntry = dodson.get(key)

  // Use Dodson as the primary definition source, fall back to Strong's
  const shortDef = dodsonEntry?.brief || strongsDef.split(';')[0].split(',').slice(0, 3).join(',')
  const fullDef = dodsonEntry?.full || strongsDef

  if (dodsonEntry) dodsonHits++

  entries.push({
    strongsId: key,
    greek: value.lemma,
    greekBare: stripDiacritics(value.lemma),
    transliteration: translitNormalized,
    pronunciation: value.translit,
    shortDef,
    fullDef,
    strongsDef,
    derivation: cleanDefinition(value.derivation || ''),
  })
}

entries.sort((a, b) => {
  const numA = parseInt(a.strongsId.replace('G', ''))
  const numB = parseInt(b.strongsId.replace('G', ''))
  return numA - numB
})

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(entries, null, 2))

console.log(`Processed ${entries.length} entries (skipped ${skipped})`)
console.log(`Dodson definitions matched: ${dodsonHits}/${entries.length}`)
console.log(`Output written to ${OUTPUT_PATH}`)

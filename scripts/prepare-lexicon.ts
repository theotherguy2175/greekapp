import fs from 'node:fs'
import path from 'node:path'

const RAW_PATH = path.join(__dirname, '..', 'data', 'raw', 'strongs-greek-dictionary.js')
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

const rawContent = fs.readFileSync(RAW_PATH, 'utf-8')

const jsonMatch = rawContent.match(/var\s+strongsGreekDictionary\s*=\s*(\{[\s\S]*\})\s*;/)
if (!jsonMatch) {
  console.error('Could not parse dictionary JS file')
  process.exit(1)
}

const dict: Record<string, {
  lemma: string
  translit: string
  strongs_def: string
  kjv_def: string
  derivation: string
}> = JSON.parse(jsonMatch[1])

interface LexiconEntry {
  strongsId: string
  greek: string
  greekBare: string
  transliteration: string
  pronunciation: string
  shortDef: string
  fullDef: string
  kjvDef: string
  derivation: string
}

const entries: LexiconEntry[] = []
let skipped = 0

for (const [key, value] of Object.entries(dict)) {
  if (!value.lemma || !value.translit) {
    skipped++
    continue
  }

  const translitNormalized = normalizeTranslit(value.translit)

  const strongsDef = cleanDefinition(value.strongs_def || '')
  const kjvDef = cleanDefinition(value.kjv_def || '')

  let shortDef = strongsDef
  if (shortDef.length > 100) {
    const firstPeriod = shortDef.indexOf('.')
    const firstSemicolon = shortDef.indexOf(';')
    const cutoff = Math.min(
      firstPeriod > 0 ? firstPeriod : Infinity,
      firstSemicolon > 0 ? firstSemicolon : Infinity,
      100
    )
    shortDef = shortDef.substring(0, cutoff)
  }

  entries.push({
    strongsId: key,
    greek: value.lemma,
    greekBare: stripDiacritics(value.lemma),
    transliteration: translitNormalized,
    pronunciation: value.translit,
    shortDef,
    fullDef: strongsDef,
    kjvDef,
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
console.log(`Output written to ${OUTPUT_PATH}`)

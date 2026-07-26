'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { LexiconEntry } from '@/types/lexicon'

interface WordCardProps {
  entry: LexiconEntry
  matchType: 'exact' | 'prefix' | 'fuzzy'
  isBookmarked: boolean
  onToggleBookmark: () => void
}

const CURATED_GLOSSES: Record<string, string> = {
  G3056: 'word, speech, reason',
  G2316: 'God',
  G2962: 'Lord, master',
  G5547: 'Christ, anointed one',
  G2424: 'Jesus',
  G4151: 'spirit, breath, wind',
  G4102: 'faith, belief, trust',
  G26: 'love',
  G266: 'sin',
  G444: 'man, human being',
  G2889: 'world',
  G3772: 'heaven',
  G932: 'kingdom',
  G2222: 'life',
  G2288: 'death',
  G1411: 'power, miracle',
  G1680: 'hope',
  G5485: 'grace, favor',
  G1343: 'righteousness',
  G225: 'truth',
  G1515: 'peace',
  G5457: 'light',
  G4561: 'flesh, body',
  G129: 'blood',
  G4396: 'prophet',
  G652: 'apostle, messenger',
  G3101: 'disciple, student',
  G1577: 'church, assembly',
  G3551: 'law',
  G1242: 'covenant, testament',
  G2041: 'work, deed',
  G4100: 'believe, trust, have faith',
  G25: 'love',
  G1097: 'know, understand',
  G2980: 'speak, say',
  G3004: 'say, tell',
  G1492: 'see, know, perceive',
  G2064: 'come, go',
  G1325: 'give',
  G2983: 'receive, take',
  G4160: 'do, make',
  G1166: 'show',
  G3962: 'father',
  G5207: 'son',
  G40: 'holy, sacred',
  G18: 'good',
  G2570: 'good, beautiful',
  G2556: 'bad, evil',
  G4190: 'evil, wicked',
  G3173: 'great, large',
  G3398: 'small, little',
  G4413: 'first',
  G2078: 'last',
  G3568: 'now',
  G3754: 'that, because',
  G2532: 'and, also, even',
  G3588: 'the',
  G1063: 'for, because',
  G235: 'but, rather',
  G3756: 'not, no',
  G1161: 'but, and, now',
  G2443: 'in order that, so that',
  G3739: 'who, which, that',
  G846: 'he, she, it, self',
  G3778: 'this, these',
  G1565: 'that, those',
  G3956: 'all, every, whole',
  G1520: 'one',
  G1722: 'in, on, among',
  G1537: 'out of, from',
  G1519: 'into, to, for',
  G4314: 'to, toward, with',
  G575: 'from, away from',
  G1909: 'on, upon, over',
  G3326: 'with, after',
  G1223: 'through, by means of',
  G2596: 'down, according to',
  G4012: 'about, concerning',
  G5228: 'above, for, on behalf of',
}

function getSimpleGloss(entry: LexiconEntry): string {
  if (CURATED_GLOSSES[entry.strongsId]) {
    return CURATED_GLOSSES[entry.strongsId]
  }
  const raw = entry.kjvDef || entry.shortDef
  const cleaned = raw
    .replace(/\([^)]*\)/g, '')
    .replace(/\+\s*/g, '')
    .replace(/X\s+/g, '')
    .replace(/-\w+/g, '')
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 1 && s.length < 25 && !/^[^a-zA-Z]*$/.test(s))
    .slice(0, 3)
    .join(', ')
  return cleaned || entry.shortDef.split(';')[0].split(',')[0].trim()
}

export function WordCard({ entry, matchType, isBookmarked, onToggleBookmark }: WordCardProps) {
  const { data: session } = useSession()
  const [expanded, setExpanded] = useState(false)
  const [bookmarking, setBookmarking] = useState(false)

  const handleBookmark = async () => {
    setBookmarking(true)
    try {
      await onToggleBookmark()
    } finally {
      setBookmarking(false)
    }
  }

  const simpleGloss = getSimpleGloss(entry)

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Top: transliteration + quick English */}
          <div className="flex items-baseline gap-2 flex-wrap">
            <h3 className="text-2xl font-bold text-stone-800">
              {entry.transliteration}
            </h3>
            {matchType === 'fuzzy' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                root form
              </span>
            )}
          </div>

          <p className="mt-1 text-xl text-amber-800 font-semibold">
            {simpleGloss}
          </p>

          {/* Divider */}
          <div className="mt-3 pt-3 border-t border-stone-100">
            {/* Greek word + Strong's number */}
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-lg text-stone-600" style={{ fontFamily: "'Noto Serif', serif" }}>
                {entry.greek}
              </span>
              <span className="text-sm text-stone-400">
                ({entry.pronunciation})
              </span>
              <a
                href={`https://www.blueletterbible.org/lexicon/${entry.strongsId.toLowerCase()}/kjv/tr/0-1/`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors"
                onClick={e => e.stopPropagation()}
              >
                {entry.strongsId} ↗
              </a>
            </div>

            {/* Definition */}
            <p className="mt-1.5 text-sm text-stone-600">
              {entry.shortDef}
            </p>

            {entry.kjvDef && (
              <p className="mt-1 text-sm text-stone-400">
                <span className="font-medium">Translated as:</span> {entry.kjvDef}
              </p>
            )}

            {(entry.fullDef !== entry.shortDef || entry.derivation) && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-2 text-sm text-amber-700 hover:text-amber-800 font-medium transition-colors"
              >
                {expanded ? 'Show less' : 'Show more'}
              </button>
            )}

            {expanded && (
              <div className="mt-3 space-y-2 text-sm text-stone-600">
                {entry.fullDef !== entry.shortDef && (
                  <p>
                    <span className="font-medium text-stone-700">Full definition:</span>{' '}
                    {entry.fullDef}
                  </p>
                )}
                {entry.derivation && (
                  <p>
                    <span className="font-medium text-stone-700">Derivation:</span>{' '}
                    {entry.derivation}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {session && (
          <button
            onClick={handleBookmark}
            disabled={bookmarking}
            className="flex-shrink-0 p-2 rounded-lg hover:bg-stone-100 transition-colors disabled:opacity-50"
            title={isBookmarked ? 'Remove from flash cards' : 'Add to flash cards'}
          >
            <svg
              className={`h-6 w-6 transition-colors ${
                isBookmarked ? 'text-amber-500 fill-amber-500' : 'text-stone-400'
              }`}
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              fill={isBookmarked ? 'currentColor' : 'none'}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

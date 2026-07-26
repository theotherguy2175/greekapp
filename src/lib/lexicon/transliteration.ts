const GREEK_TO_LATIN: Record<string, string> = {
  'α': 'a', 'β': 'b', 'γ': 'g', 'δ': 'd', 'ε': 'e',
  'ζ': 'z', 'η': 'e', 'θ': 'th', 'ι': 'i', 'κ': 'k',
  'λ': 'l', 'μ': 'm', 'ν': 'n', 'ξ': 'x', 'ο': 'o',
  'π': 'p', 'ρ': 'r', 'σ': 's', 'ς': 's', 'τ': 't',
  'υ': 'u', 'φ': 'ph', 'χ': 'ch', 'ψ': 'ps', 'ω': 'o',
}

export function stripDiacritics(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '')
}

export function greekToTranslit(greek: string): string {
  const bare = stripDiacritics(greek).toLowerCase()
  let result = ''
  for (let i = 0; i < bare.length; i++) {
    const ch = bare[i]
    if (ch === 'γ' && i + 1 < bare.length) {
      const next = bare[i + 1]
      if (next === 'γ') { result += 'ng'; i++; continue }
      if (next === 'κ') { result += 'nk'; i++; continue }
      if (next === 'ξ') { result += 'nx'; i++; continue }
      if (next === 'χ') { result += 'nch'; i++; continue }
    }
    result += GREEK_TO_LATIN[ch] || ch
  }
  return result
}

export function normalizeTranslit(input: string): string {
  return stripDiacritics(input)
    .toLowerCase()
    .replace(/[^a-z]/g, '')
}

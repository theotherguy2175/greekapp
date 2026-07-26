import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Koiné Lexicon',
    short_name: 'Koiné',
    description: 'Koine Greek dictionary lookup and flash card study tool',
    start_url: '/',
    display: 'standalone',
    background_color: '#fafaf9',
    theme_color: '#a16207',
    orientation: 'portrait-primary',
    categories: ['education', 'reference'],
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}

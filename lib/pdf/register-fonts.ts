import { Font } from '@react-pdf/renderer'

// React PDF relies on pdfkit, which only supports TrueType/OpenType sources.
const GeistRegular = new URL('../../node_modules/geist/dist/fonts/geist-sans/Geist-Regular.ttf', import.meta.url).href
const GeistMedium = new URL('../../node_modules/geist/dist/fonts/geist-sans/Geist-Medium.ttf', import.meta.url).href
const GeistBold = new URL('../../node_modules/geist/dist/fonts/geist-sans/Geist-Bold.ttf', import.meta.url).href
const GeistMonoRegular = new URL('../../node_modules/geist/dist/fonts/geist-mono/GeistMono-Regular.ttf', import.meta.url).href
const GeistMonoMedium = new URL('../../node_modules/geist/dist/fonts/geist-mono/GeistMono-Medium.ttf', import.meta.url).href
const GeistMonoSemiBold = new URL('../../node_modules/geist/dist/fonts/geist-mono/GeistMono-SemiBold.ttf', import.meta.url).href

let fontsRegistered = false

export function ensureCatalogPDFFonts() {
  if (fontsRegistered) return

  Font.register({
    family: 'Geist Sans',
    fonts: [
      { src: GeistRegular, fontWeight: 'normal' },
      { src: GeistMedium, fontWeight: 500 },
      { src: GeistBold, fontWeight: 'bold' },
    ],
  })

  Font.register({
    family: 'Geist Mono',
    fonts: [
      { src: GeistMonoRegular, fontWeight: 'normal' },
      { src: GeistMonoMedium, fontWeight: 500 },
      { src: GeistMonoSemiBold, fontWeight: 600 },
    ],
  })

  fontsRegistered = true
}

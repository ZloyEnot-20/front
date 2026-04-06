/** Прогрев загрузки логотипов чанками, чтобы не открывать десятки TCP-соединений одновременно (nginx rate-limit). */
export function preloadPartnerImages(urls: string[], chunkSize = 5, gapMs = 50): void {
  if (typeof window === 'undefined') return
  const unique = [...new Set(urls.filter(Boolean))]
  let offset = 0
  const step = () => {
    for (let i = 0; i < chunkSize && offset < unique.length; i++, offset++) {
      const src = unique[offset]
      const img = new Image()
      img.decoding = 'async'
      img.src = src
    }
    if (offset < unique.length) {
      window.setTimeout(step, gapMs)
    }
  }
  step()
}

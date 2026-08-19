export const engines = {
  google: 'https://www.google.com/search?q=',
  duckduckgo: 'https://duckduckgo.com/?q=',
}

export function search(engine, query) {
  const url = engines[engine] + encodeURIComponent(query)
  window.open(url, '_blank')
}

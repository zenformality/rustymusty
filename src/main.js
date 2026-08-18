import './style.css'

const form = document.getElementById('search-form')
const queryInput = document.getElementById('query')
const engineSelect = document.getElementById('engine')
const historyEl = document.getElementById('history')

const engines = {
  google: 'https://www.google.com/search?q=',
  duckduckgo: 'https://duckduckgo.com/?q=',
}

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem('rm_history') || '[]')
  } catch { return [] }
}

function saveHistory(term, engine) {
  const history = getHistory()
  history.unshift({ term, engine, time: Date.now() })
  if (history.length > 10) history.pop()
  localStorage.setItem('rm_history', JSON.stringify(history))
  renderHistory()
}

function renderHistory() {
  const history = getHistory()
  if (history.length === 0) {
    historyEl.innerHTML = ''
    return
  }

  let html = '<div class="history-title">recent searches</div>'
  history.forEach(item => {
    html += `
      <div class="history-item">
        <span class="term">${escapeHtml(item.term)}</span>
        <span class="engine">${item.engine}</span>
      </div>
    `
  })
  historyEl.innerHTML = html
}

function escapeHtml(str) {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

function doSearch() {
  const query = queryInput.value.trim()
  if (!query) return

  const engine = engineSelect.value
  saveHistory(query, engine)
  window.open(engines[engine] + encodeURIComponent(query), '_blank')
}

form.addEventListener('submit', e => {
  e.preventDefault()
  doSearch()
})

queryInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') doSearch()
})

renderHistory()

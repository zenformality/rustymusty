const HISTORY_KEY = 'rm_history'
const MAX_ITEMS = 10

export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
  } catch {
    return []
  }
}

export function saveHistory(term, engine) {
  const history = getHistory()
  history.unshift({ term, engine, time: Date.now() })
  if (history.length > MAX_ITEMS) history.pop()
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  return history
}

export function renderHistory(container, onSelect) {
  const items = getHistory()
  if (!items.length) {
    container.innerHTML = ''
    return
  }

  container.innerHTML = `
    <div class="history-title">recent</div>
    ${items.map(item => `
      <div class="history-item" data-term="${escapeHtml(item.term)}" data-engine="${item.engine}">
        <span class="term">${escapeHtml(item.term)}</span>
        <span class="engine">${item.engine}</span>
      </div>
    `).join('')}
  `

  container.querySelectorAll('.history-item').forEach(el => {
    el.addEventListener('click', () => {
      const term = el.dataset.term
      const engine = el.dataset.engine
      onSelect(engine, term)
    })
  })
}

function escapeHtml(str) {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

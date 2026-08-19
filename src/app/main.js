import './../style.css'
import { search } from './search.js'
import { saveHistory, renderHistory } from './history.js'
import { checkAuth } from './auth.js'

class SearchApp {
  constructor() {
    this.form = document.getElementById('search-form')
    this.queryInput = document.getElementById('query')
    this.engineSelect = document.getElementById('engine')
    this.historyContainer = document.getElementById('history')
    this.authContainer = document.getElementById('auth-bar')

    this.init()
  }

  init() {
    this.bindEvents()
    this.renderHistory()
    this.checkAuth()
  }

  bindEvents() {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault()
      this.handleSearch()
    })
  }

  handleSearch() {
    const query = this.queryInput.value.trim()
    if (!query) return

    const engine = this.engineSelect.value
    saveHistory(query, engine)
    search(engine, query)
  }

  renderHistory() {
    renderHistory(this.historyContainer, (engine, term) => {
      this.engineSelect.value = engine
      this.queryInput.value = term
      this.handleSearch()
    })
  }

  checkAuth() {
    checkAuth(this.authContainer)
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new SearchApp()
})

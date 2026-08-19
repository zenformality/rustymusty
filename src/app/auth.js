export async function checkAuth(container) {
  container.innerHTML = '<a href="/api/auth/login">sign in</a>'

  try {
    const res = await fetch('/api/auth/me')
    if (!res.ok) return
    const user = await res.json()
    if (!user) return

    container.innerHTML = `
      <img class="avatar" src="https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png" alt="">
      <span>${user.username}</span>
      <a href="/api/auth/logout">logout</a>
    `
  } catch {
    // local dev, no server
  }
}

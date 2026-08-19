// this is where discord sends the user back after they approve
export default async function handler(req, res) {
  let { code, state } = req.query

  // parse cookies manually bc vercel doesnt give us a nice helper
  let cookies = {}
  ;(req.headers.cookie || '').split('; ').forEach(c => {
    let [k, v] = c.split('=')
    cookies[k] = v
  })

  if (!code || state !== cookies.oauth_state) {
    res.writeHead(302, { Location: '/' })
    return res.end()
  }

  // swap the code for an access token
  let tokRes = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.REDIRECT_URI
    })
  })

  let { access_token } = await tokRes.json()

  // get the user
  let userRes = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${access_token}` }
  })
  let user = await userRes.json()

  // stuff user data into a cookie, base64 so its not totally readable
  let userCookie = Buffer.from(JSON.stringify(user)).toString('base64')

  res.setHeader('Set-Cookie', [
    `rm_user=${userCookie}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`,
    'oauth_state=; Path=/; Max-Age=0'  // clear the state cookie
  ])

  res.writeHead(302, { Location: '/' })
  res.end()
}

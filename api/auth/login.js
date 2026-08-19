import crypto from 'crypto'

export default function handler(req, res) {
  let state = crypto.randomBytes(16).toString('hex')

  // throw state in a cookie so we can check it later
  res.setHeader('Set-Cookie',
    `oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=60`)

  let url = new URL('https://discord.com/api/oauth2/authorize')
  url.searchParams.set('client_id', process.env.DISCORD_CLIENT_ID)
  url.searchParams.set('redirect_uri', process.env.REDIRECT_URI)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', 'identify')
  url.searchParams.set('state', state)

  res.writeHead(302, { Location: url })
  res.end()
}

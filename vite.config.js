import { defineConfig, loadEnv } from 'vite'
import crypto from 'crypto'
import { URL } from 'url'

export default defineConfig(({ mode }) => {
  let env = loadEnv(mode, process.cwd(), '')

  return {
    server: {
      proxy: {}
    },
    plugins: [
      {
        name: 'discord-auth',
        configureServer(server) {
          function parseCookies(header) {
            let cookies = {}
            ;(header || '').split('; ').forEach(c => {
              let idx = c.indexOf('=')
              if (idx > 0) cookies[c.slice(0, idx)] = c.slice(idx + 1)
            })
            return cookies
          }

          function parseQuery(url) {
            let q = {}
            let search = new URL(url, 'http://localhost').search
            if (search) {
              search.slice(1).split('&').forEach(pair => {
                let [k, v] = pair.split('=')
                q[decodeURIComponent(k)] = decodeURIComponent(v || '')
              })
            }
            return q
          }

          server.middlewares.use('/api/auth/login', (req, res) => {
            let state = crypto.randomBytes(16).toString('hex')

            res.setHeader('Set-Cookie',
              `oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=60`)

            let url = new URL('https://discord.com/api/oauth2/authorize')
            url.searchParams.set('client_id', env.DISCORD_CLIENT_ID)
            url.searchParams.set('redirect_uri', env.REDIRECT_URI)
            url.searchParams.set('response_type', 'code')
            url.searchParams.set('scope', 'identify')
            url.searchParams.set('state', state)

            res.writeHead(302, { Location: url })
            res.end()
          })

          server.middlewares.use('/api/auth/callback', async (req, res) => {
            let query = parseQuery(req.url)
            let cookies = parseCookies(req.headers.cookie)
            let code = query.code
            let state = query.state

            if (!code || state !== cookies.oauth_state) {
              res.writeHead(302, { Location: '/' })
              return res.end()
            }

            try {
              let tokRes = await fetch('https://discord.com/api/oauth2/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                  client_id: env.DISCORD_CLIENT_ID,
                  client_secret: env.DISCORD_CLIENT_SECRET,
                  grant_type: 'authorization_code',
                  code,
                  redirect_uri: env.REDIRECT_URI
                })
              })

              let { access_token } = await tokRes.json()

              let userRes = await fetch('https://discord.com/api/users/@me', {
                headers: { Authorization: `Bearer ${access_token}` }
              })
              let user = await userRes.json()

              let userCookie = Buffer.from(JSON.stringify(user)).toString('base64')

              res.setHeader('Set-Cookie', [
                `rm_user=${userCookie}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`,
                'oauth_state=; Path=/; Max-Age=0'
              ])

              res.writeHead(302, { Location: '/' })
              res.end()
            } catch(e) {
              console.error('auth callback failed:', e)
              res.writeHead(302, { Location: '/' })
              res.end()
            }
          })

          server.middlewares.use('/api/auth/logout', (req, res) => {
            res.setHeader('Set-Cookie', 'rm_user=; Path=/; Max-Age=0')
            res.writeHead(302, { Location: '/' })
            res.end()
          })

          server.middlewares.use('/api/auth/me', (req, res) => {
            let cookies = parseCookies(req.headers.cookie)

            if (!cookies.rm_user) {
              res.setHeader('Content-Type', 'application/json')
              res.end('null')
              return
            }

            try {
              let user = JSON.parse(Buffer.from(cookies.rm_user, 'base64').toString())
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({
                username: user.username,
                avatar: user.avatar,
                id: user.id
              }))
            } catch(e) {
              res.setHeader('Content-Type', 'application/json')
              res.end('null')
            }
          })
        }
      }
    ]
  }
})

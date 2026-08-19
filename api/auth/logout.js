// just nuke the cookie and done
export default function handler(req, res) {
  res.setHeader('Set-Cookie', 'rm_user=; Path=/; Max-Age=0')
  res.writeHead(302, { Location: '/' })
  res.end()
}

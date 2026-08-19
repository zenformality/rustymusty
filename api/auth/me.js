// read the cookie, return user info or null
export default function handler(req, res) {
  let cookies = {}
  ;(req.headers.cookie || '').split('; ').forEach(c => {
    let [k, v] = c.split('=')
    cookies[k] = v
  })

  if (!cookies.rm_user) {
    return res.status(200).json(null)
  }

  try {
    let user = JSON.parse(Buffer.from(cookies.rm_user, 'base64').toString())
    // only send what we need, dont leak everything
    res.status(200).json({
      username: user.username,
      avatar: user.avatar,
      id: user.id
    })
  } catch(e) {
    res.status(200).json(null)
  }
}

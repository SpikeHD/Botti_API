import { FastifyInstance } from 'fastify'
import { client } from '../util/mysql'
import { hasRateLimit } from '../util/ratelimit'

export function register(app: FastifyInstance) {
  app.get('/user', async (req, res) => {
    const query = req.query as UserQuery
    let user: User | null = null

    if (!(query.uid || query.username)) {
      res.send({
        success: false,
        message: 'Please provide a `uid` or `username` in your query parameters.'
      })
      return
    }

    if (await hasRateLimit(req.uid, 'profile')) {
      res.send({
        success: false,
        message: 'You are being rate limited. Please wait a moment before making another request...'
      })
      return
    }

    if (query.uid) {
      const result = await client.query(
        'SELECT uid, username, icon, bio, followers, following FROM users WHERE uid=?',
        [query.uid]
      )

      user = Array.isArray(result[0]) ? result[0][0] as User : null
    } else if (query.username) {
      const result = await client.query(
        'SELECT uid, username, icon, bio, followers, following FROM users WHERE username=?',
        [query.username]
      )
      
      user = Array.isArray(result[0]) ? result[0][0] as User : null
    }

    if (!user) return res.send({
      success: false,
      message: 'Error getting user, do they exist?'
    })

    res.send({
      success: true,
      user
    })
  })
}
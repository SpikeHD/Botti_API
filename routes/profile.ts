import { fail } from '../util/response'
import { FastifyInstance } from 'fastify'
import { client } from '../util/mysql'

export function register(app: FastifyInstance) {
  app.get('/user', {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '1 minute'
      }
    }
  }, async (req, res) => {
    const query = req.query as UserQuery
    let user: User | null = null

    if (!(query.uid || query.username)) {
      return fail(res, 'Please provide a `uid` or `username` in your query parameters.')
    }

    if (!isNaN(Number(query.uid))) {
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

    if (!user) return fail(res, 'Error getting user, do they exist?')

    res.send({
      success: true,
      user
    })
  })
}
import { FastifyInstance } from 'fastify'
import { client } from '../util/mysql'
import { fail } from '../util/response'

export function register(app: FastifyInstance) {
  app.get('/followers', {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '1 minute'
      }
    }
  }, async (req, res) => {
    const query = req.query as FollowersQuery
    let followers: User[] = []

    if (!(query.uid || query.username)) {
      return fail(res, 'Please provide a `uid` or `username` in your query parameters.')
    }

    if (!isNaN(Number(query.uid))) {
      const result = await client.query(
        'SELECT u.username, u.email, u.icon, u.bio, u.followers, u.following FROM followers f, users u WHERE f.following=? AND u.uid=f.follower',
        [query.uid]
      )

      // @ts-expect-error shut up
      followers = Array.isArray(result[0]) && result[0][0]
    } else if (query.username) {
      const result = await client.query(
        'SELECT u2.username, u2.email, u2.icon, u2.bio, u2.followers, u2.following FROM followers f, users u, users u2 WHERE f.following = u.uid AND u.username=? AND u2.uid=f.follower',
        [query.username]
      )

      // @ts-expect-error shut up
      followers = Array.isArray(result[0]) && result[0][0]
    }

    res.send({
      success: true,
      followers
    })
  })
}
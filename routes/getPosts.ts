import { FastifyInstance } from 'fastify'
import { client } from '../util/mysql'
import { fail } from '../util/response'

export function register(app: FastifyInstance) {
  app.get('/posts', {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '1 minute'
      }
    }
  }, async (req, res) => {
    const query = req.query as PostsQuery
    const limit = query.limit || 10
    let posts: Post[] = []

    if (!(query.uid || query.username)) {
      return fail(res, 'Please provide a `uid` or `username` in your query parameters.')
    }


    if (!isNaN(Number(query.uid))) {
      const result = await client.query(
        'SELECT author, contents, date_created, likes, comments FROM posts WHERE author=? LIMIT ?',
        [query.uid, limit]
      )

      posts = result[0] as Post[]
    } else if (query.username) {
      const result = await client.query(
        'SELECT author, contents, date_created, likes, comments FROM posts p, users u WHERE p.author = u.uid AND u.username=?',
        [query.username, limit]
      )
      
      posts = result[0] as Post[]
    }

    res.send({
      success: true,
      posts
    })
  })
}
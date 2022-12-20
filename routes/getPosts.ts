import { FastifyInstance } from 'fastify'
import { client } from '../util/mysql'

export function register(app: FastifyInstance) {
  app.get('/posts', async (req, res) => {
    const query = req.query as PostsQuery
    const limit = query.limit || 10
    let posts: Post[] = []

    if (query.uid) {
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

    res.send(posts)
  })
}
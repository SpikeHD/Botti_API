import { FastifyInstance } from 'fastify'
import { client } from '../util/mysql'
import { fail } from '../util/response'

export function register(app: FastifyInstance) {
  app.post('/createPost', {
    config: {
      rateLimit: {
        max: 2,
        timeWindow: '1 minute'
      }
    }
  }, async (req, res) => {
    const body = req.body as PostCreationBody

    if (!body.contents) {
      return fail(res, 'Please provide contents for the post.')
    }

    const date = new Date()

    const result = await client.query(
      'INSERT INTO posts (author, contents, date_created) VALUES(?, ?, ?)',
      [req.uid, body.contents, date],
    ).catch(e => {
      fail(res, 'Something went wrong creating your post. Feel free to try again in a moment!')

      console.log(e)
    })

    if (result) res.send({
      success: true,
      post: {
        author: req.uid,
        contents: body.contents,
        date: date.toUTCString(),
        likes: 0,
        comments: 0,
      }
    })
  })
}
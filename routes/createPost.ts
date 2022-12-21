import { FastifyInstance } from 'fastify'
import { client } from '../util/mysql'
import { hasRateLimit } from '../util/ratelimit'

export function register(app: FastifyInstance) {
  app.post('/createPost', async (req, res) => {
    const body = req.body as PostCreationBody

    if (!body.contents) {
      res.send({
        success: false,
        message: 'Please provide contents for the post.'
      })
      return
    }

    if (await hasRateLimit(req.uid, 'post')) {
      res.send({
        success: false,
        message: 'You are being rate limited. Please wait a moment before making another request...'
      })
      return
    }

    const date = new Date()

    const result = await client.query(
      'INSERT INTO posts (author, contents, date_created) VALUES(?, ?, ?)',
      [req.uid, body.contents, date],
    ).catch(e => {
      res.send({
        success: false,
        message: 'Something went wrong creating your post. Feel free to try again in a moment!'
      })

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
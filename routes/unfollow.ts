import { FastifyInstance } from 'fastify'
import { client } from '../util/mysql'
import { hasRateLimit } from '../util/ratelimit'

export function register(app: FastifyInstance) {
  app.post('/unfollow', async (req, res) => {
    const body = req.body as FollowBody
    let result

    if (!(body?.uid || body?.username)) {
      res.send({
        success: false,
        message: 'Please provide a `uid` or `username` in your post body.'
      })
      return
    }

    if (!isNaN(Number(body.uid))) {
      result = await client.query(
        'DELETE FROM followers WHERE follower=? AND following=?',
        [req.uid, body.uid]
      )
    } else if (body.username) {
      const userResult = (await client.query('SELECT uid FROM users WHERE username=?', [body.username]))[0]
      // @ts-expect-error dont care
      const uid = Array.isArray(userResult) && userResult[0].uid as string

      if (!uid) return res.send({
        success: false,
        message: 'User with username \'' + body.username + '\' not found.'
      })

      result = await client.query(
        'DELETE FROM followers WHERE follower=? AND following=?',
        [req.uid, uid]
      )
    }

    if (!result) res.send({
      success: false,
      message: 'There was an error unfollowing the user.'
    })

    res.send({
      success: true,
      message: 'Successfully unfollowed!'
    })
  })
}
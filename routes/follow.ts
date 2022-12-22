import { FastifyInstance } from 'fastify'
import { client } from '../util/mysql'
import { hasRateLimit } from '../util/ratelimit'
import { fail } from '../util/response'

export function register(app: FastifyInstance) {
  app.post('/follow', async (req, res) => {
    const body = req.body as FollowBody
    let result

    if (await hasRateLimit(req.uid, 'follow')) {
      fail(res, 'You are being rate limited. Please wait a moment before making another request...')
      return
    }

    if (!(body?.uid || body?.username)) {
      fail(res, 'Please provide a `uid` or `username` in your post body.')
      return
    }

    if (!isNaN(Number(body.uid))) {
      result = await client.query(
        'REPLACE INTO followers VALUES (?, ?)',
        [req.uid, body.uid]
      )
    } else if (body.username) {
      const userResult = (await client.query('SELECT uid FROM users WHERE username=?', [body.username]))[0]
      // @ts-expect-error dont care
      const uid = Array.isArray(userResult) && userResult[0].uid as string

      if (!uid) return fail(res, 'User with username \'' + body.username + '\' not found.')

      result = await client.query(
        'REPLACE INTO followers VALUES (?, ?)',
        [req.uid, uid]
      )
    }

    if (!result) return fail(res, 'There was an error following the user.')

    res.send({
      success: true,
      message: 'Successfully followed!'
    })
  })
}
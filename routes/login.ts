import { fail } from '../util/response'
import { FastifyInstance } from 'fastify'
import { client } from '../util/mysql'

export function register(app: FastifyInstance) {
  app.post('/login', {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '1 minute'
      }
    }
  }, async (req, res) => {
    const body = req.body as LoginBody

    if (!(body.email && body.password)) {
      return fail(res, 'Please provide both the email and password associated with the account.')
    }

    const result = await client.query(
      'SELECT u.uid, a.api_key FROM users u, api_keys a WHERE u.email=? AND u.password=SHA2(?, 256) AND a.uid = u.uid',
      [body.email, body.password],
    )

    // @ts-expect-error shut up
    if (Array.isArray(result[0]) && !result[0][0]?.uid) return fail(res, 'Incorrect credentials.')

    res.send({
      success: true,
      // @ts-expect-error shut up
      key: result[0][0]?.api_key
    })
  })
}
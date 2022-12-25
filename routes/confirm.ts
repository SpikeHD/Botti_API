import { fail } from '../util/response'
import { FastifyInstance } from 'fastify'
import { client } from '../util/mysql'
import { sendConfirmationEmail } from '../util/mail'

export function register(app: FastifyInstance) {
  app.post('/confirm', {
    config: {
      rateLimit: {
        max: 3,
        timeWindow: '1 minute'
      }
    }
  }, async (req, res) => {
    const body = req.body as ConfirmBody

    if (!(body.code)) {
      return fail(res, 'Missing confirmation code.')
    }

    const emailResult = await client.query(
      'SELECT email FROM confirmations WHERE code=?',
      [body.code]
    )

    // @ts-expect-error shut up
    if (Array.isArray(emailResult[0]) && !emailResult[0][0]?.email) return fail(res, 'Incorrect confirmation code')

    // @ts-expect-error shut up
    const email = emailResult[0][0]?.email

    // Clear confirmation
    await client.query(
      'DELETE FROM confirmations WHERE code=?',
      [body.code, email],
    )

    // Set user to confirmed
    await client.query('UPDATE users SET confirmed=1 WHERE email=?', [email])

    res.send({
      success: true,
      message: 'Account and email have been confirmed!'
    })
  })
}
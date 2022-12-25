import { fail } from '../util/response'
import { FastifyInstance } from 'fastify'
import { client } from '../util/mysql'
import { sendConfirmationEmail } from '../util/mail'

export function register(app: FastifyInstance) {
  app.post('/register', {
    config: {
      rateLimit: {
        max: 1,
        timeWindow: '10 minutes'
      }
    }
  }, async (req, res) => {
    const body = req.body as RegisterBody

    if (!(body.email && body.password && body.username)) {
      return fail(res, 'Please provide an email, username and password to be associated with the account.')
    }

    // Check if a user with the email or username already exists
    const result = await client.query(
      'SELECT username, email FROM users WHERE email=? OR username=?',
      [body.email, body.username],
    )

    // @ts-expect-error shut up
    if (Array.isArray(result[0]) && result[0][0]?.username === body.username) return fail(res, `User with the username ${body.username} already exists!`)
    // @ts-expect-error shut up
    if (Array.isArray(result[0]) && result[0][0]?.email === body.email) return fail(res, 'That email is already in use!')

    sendConfirmationEmail(body.email)

    // Create the user, make sure they are unconfirmed
    client.query(
      'INSERT INTO users (username, email, password, bio, icon, confirmed) VALUES (?, ?, SHA2(?, 256), "", "default", 0)',
      [body.username, body.email, body.password],
    )

    res.send({
      success: true,
      message: 'Check your email for confirmation!'
    })
  })
}
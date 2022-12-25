
import dotenv from 'dotenv'
dotenv.config()

import fs from 'fs'
import Fastify from 'fastify'
import { authenticateKey } from './util/keys'

const keyless = ['/register', '/login', '/confirm']

const app = Fastify({
  logger: true
})

;(async () => {
  await app.register(import('@fastify/rate-limit'), {
    global: false,
    max: 10,
    timeWindow: '30 seconds'
  })
  
  // message for rate limits
  app.setErrorHandler(function (err, req, res) {
    if (res.statusCode === 429) {
      err.message = 'That\'s a lot of requests! You\'re gonna have to slow down.'
    }

    res.send(err)
  })

  // preValidation hook to ensure authentication
  app.addHook('preValidation', async (req, res) => {
    const body = req.body as BaseReq
    const querystring = req.query as BaseReq
    
    // Do not require API if the user is logging in or registering, obviously
    if (keyless.includes(req.routerPath)) return

    const auth = await authenticateKey(body?.key || querystring?.key)

    if (isNaN(auth)) {
      res.send({
        success: false,
        message: 'Welcome to the Botti API! You are not authenticated. Please sign up in order to get an API key :)'
      })
      return
    }

    req.uid = auth

    // JSON-ify body just in case
    req.body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  })

  // Go through each route and register it
  fs.readdirSync(__dirname + '/routes').forEach(async (file) => {
    const props = await import(__dirname + '/routes/' + file)
    props.register(app)

    console.log('Resgistered route: ', file.split('.')[0])
  })

  // Listen!
  app.listen({ port: 4000 }, (e) => {
    if (e) return console.error(e)

    console.log('Server up and running!')
  })
})()

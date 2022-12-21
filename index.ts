
import dotenv from 'dotenv'
dotenv.config()

import fs from 'fs'
import Fastify from 'fastify'
import { authenticateKey } from './util/keys'

const app = Fastify({
  logger: true
})

// preValidation hook to ensure authentication
app.addHook('preValidation', async (req, res) => {
  const body = req.body as BaseReq
  const querystring = req.query as BaseReq
  const auth = await authenticateKey(body?.key || querystring?.key)

  if (isNaN(auth)) {
    res.send('Welcome to the Botti API! You are not authenticated. Please sign up in order to get an API key :)')
    return
  }

  req.uid = auth
})

// Go through each route and register it
fs.readdirSync(__dirname + '/routes').forEach(async (file) => {
  const props = await import(__dirname + '/routes/' + file)
  props.register(app)

  console.log('Resgistered route: ', file.split('.')[0])
})

// Listen!
app.listen({ port: 3000 }, () => {
  console.log('Server up and running!')
})

import dotenv from 'dotenv'
dotenv.config()

import Fastify from 'fastify'
import { authenticateKey, generateAPIKey } from './util/keys'

interface BaseReq {
  key: string
}

const app = Fastify({
  logger: true
})

app.post('/', async (req, res) => {
  const body = req.body as BaseReq

  if (await authenticateKey(body.key)) {
    res.send('Welcome to the Botti API! You are authenticated!')
  }

  res.send('Welcome to the Botti API! You are not authenticated. Please sign up in order to get an API key :)')
})

app.listen({ port: 3000 }, () => {
  console.log('Server up and running!')
})
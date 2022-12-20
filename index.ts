import Fastify from 'fastify'

const app = Fastify({
  logger: true
})

app.get('/', (req, res) => {
  

  res.send('Welcome to the Botti API! You are not authenticated. Please sign up in order to get an API key :)')
})

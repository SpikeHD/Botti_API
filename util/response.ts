import { FastifyReply } from 'fastify'

export function fail(res: FastifyReply, message: string) {
  res.send({
    success: false,
    message: message
  })
}

export function ratelimit(res: FastifyReply) {
  res.send({
    success: false,
    message: 'You are being rate limited. Please wait a moment before making another request...'
  })
}
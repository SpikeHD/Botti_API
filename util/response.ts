import { FastifyReply } from 'fastify'

export function fail(res: FastifyReply, message: string) {
  res.send({
    success: false,
    message: message
  })
}
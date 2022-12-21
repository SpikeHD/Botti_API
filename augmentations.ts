import 'fastify'

declare module 'fastify' {
  export interface FastifyRequest {
    uid: number
  }
}

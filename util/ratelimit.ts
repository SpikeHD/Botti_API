import { client } from './mysql'

const limits = {
  post: process.env.POST_LIMIT || 60_000,
  get_posts: process.env.POST_GET_LIMIT || 5_000,
}

export async function hasRateLimit(uid: number, type: string) {
  const result = await client.query(
    'SELECT last_query FROM ratelimits WHERE uid=? AND type=?',
    [uid, type]
  )

  const ratelimit = Array.isArray(result[0]) && (result[0][0] as RatelimitQueryResults).last_query
  const rlDate = Date(ratelimit)

  console.log(ratelimit)
}

export async function setRateLimit(uid: number, type: string) {

}
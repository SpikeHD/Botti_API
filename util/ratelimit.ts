import { client } from './mysql'

const limits = {
  post: Number(process.env.POST_LIMIT) || 5000,
  get_posts: Number(process.env.POST_GET_LIMIT) || 5000,
}

const whitelist = [0]

export async function hasRateLimit(uid: number, type: keyof typeof limits) {
  const hasLimit = await checkRateLimit(uid, type)

  if (!hasLimit) {
    // Set the rate limit before returning to finish whatever query they were doing
    await setRateLimit(uid, type)
    return false
  }

  return true
}

export async function checkRateLimit(uid: number, type: keyof typeof limits) {
  // if (whitelist.includes(uid)) return false

  const result = await client.query(
    'SELECT last_query FROM ratelimits WHERE uid=? AND type=?',
    [uid, type]
  )

  // No result - no ratelimit
  if (!Array.isArray(result[0]) || !result[0][0]) return false

  const ratelimit = Array.isArray(result[0]) && (result[0][0] as RatelimitQueryResults).last_query

  if (!ratelimit) return false

  const rlDate = new Date(ratelimit).getTime()

  // Clear the ratelimit and allow the request if it has passed
  if (rlDate + limits[type] < Date.now()) {
    await client.query('DELETE FROM ratelimits WHERE uid=? AND type=?', [uid, type])
    return false
  }

  return true
}

export async function setRateLimit(uid: number, type: string) {
  // if (whitelist.includes(uid)) return false
  const now = new Date()
  
  return client.query(
    'REPLACE INTO ratelimits VALUES (?, ?, ?)',
    [uid, now, type]
  )
}
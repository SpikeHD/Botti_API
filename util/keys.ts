import { client } from './mysql'
import bcrypt from 'bcrypt'

/**
 * Generate a 40 character long API key
 * 
 * https://blog.logrocket.com/understanding-api-key-authentication-node-js/
 */
export function generateAPIKey() {
  return [...Array(40)]
    .map((_) => ((Math.random() * 36) | 0).toString(36))
    .join('')
}

/**
 * Check if a given key is in our database. If it is, they are authenticated!
 * 
 * @param key
 */
export async function authenticateKey(key: string) {
  // If the key exists in the table, that's enough for us!
  const rows = await client.query('SELECT * FROM api_keys WHERE api_key=SHA2(?, 256)', key)
  
  return Array.isArray(rows[0]) && rows[0].length === 1
}
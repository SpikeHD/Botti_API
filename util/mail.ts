import fs from 'fs'
import nodemailer from 'nodemailer'
import { client } from './mysql'

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
})

export async function createConfirmCode(email: string) {
  const code = [...Array(60)]
    .map((_) => ((Math.random() * 36) | 0).toString(36))
    .join('')

  // TODO store code
  await client.query(
    'DELETE FROM confirmations WHERE email=?;',
    [email]
  )

  client.query('INSERT INTO confirmations VALUES (?, ?)', [email, code])

  return code
}

export async function sendConfirmationEmail(email: string) {
  const code = await createConfirmCode(email)
  const template = fs.readFileSync('./util/email_template.html').toString()

  transporter.sendMail({
    from: 'no-reply@botti.com',
    to: email,
    subject: 'Your Botti Confirmation',
    html: template.replace(/{{ LINK }}/g, `${process.env.SITE_URL}/confirm?code=${code}`)
  })
}
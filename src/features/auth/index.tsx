import { Hono } from 'hono'
import { AuthPage } from '../components/auth_page'
import * as v from 'valibot'
import { sValidator } from '@hono/standard-validator'
import { setCookie } from 'hono/cookie'
import { client } from '../../lib/client'

const schema = v.object({
  name: v.string(),
  age: v.number(),
})

const app = new Hono()
.get('/login', (c) => c.render(<AuthPage />))
.post('/stubLogin', sValidator(
    'form',
    v.object({
      userId: v.string(),
      role: v.string(),
      redirectUrl: v.string(),
    })),
    (c) => {
      const data = c.req.valid('form')
      console.log(data)
        
      setCookie(c, 'user_id', data.userId);

      return c.redirect(data.redirectUrl, 302)
    })

export default app;
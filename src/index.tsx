import { Hono } from 'hono'
import { renderer } from './lib/renderer'
import home from './features/home'
import auth from './features/auth'
import dashboard from './features/dashboard'

const app = new Hono()
.use(renderer)
.route('/', home)
.route('/auth', auth)
.route('/dashboard', dashboard)

export default app

export type AppType = typeof app
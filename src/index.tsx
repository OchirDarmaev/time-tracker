import { Hono } from 'hono'
import { renderer } from './lib/renderer'
import home from './features/home'

const app = new Hono()

app.use(renderer)

app.route('/', home)

export default app

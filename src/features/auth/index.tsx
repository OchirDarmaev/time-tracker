import { Hono } from 'hono'
import { AuthPage } from '../components/auth_page'

const app = new Hono()
.get('/login', (c) => c.render(<AuthPage />))

export default app;
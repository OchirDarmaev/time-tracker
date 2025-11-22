import { Hono } from 'hono'
import { DashboardPage } from './components/dashboard_page'

const app = new Hono()
.get('/', (c) => c.render(<DashboardPage />))

export default app


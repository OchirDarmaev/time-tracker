import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { initializeDatabase } from './config/database.js';
import { authStubMiddleware } from './middleware/auth_stub.js';
import { router } from './handlers/index.js';
import { apiContract } from './contracts/api.js';
import { createExpressEndpoints } from '@ts-rest/express';
import type { Request, RequestHandler, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database
try {
  initializeDatabase();
  console.log('Database initialized successfully');
} catch (error) {
  console.error('Error initializing database:', error);
}

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
// @ts-expect-error - Express session middleware type issue
app.use(session({
  secret: 'timetrack-secret-key-change-in-production',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(authStubMiddleware);

// Middleware to handle ts-rest responses
app.use((req: Request, res: Response, next) => {
  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);
  
  // Overriding res.json to handle custom response formats (redirects and HTML)
  res.json = function(body: any): Response {
    // Handle HTML responses with nested body structure
    if (body && typeof body === 'object' && 'body' in body && typeof body.body === 'string') {
      return originalSend(body.body);
    }
    
    return originalJson(body);
  };
  
  next();
});

// Create ts-rest endpoints
// @ts-expect-error - ts-rest type inference issue with Express app
createExpressEndpoints(apiContract, router, app, {
  responseValidation: false,
  jsonQuery: true,
  onError: (err: any, req: Request, res: Response) => {
    console.error('ts-rest error:', err);
    res.status(500).json({ error: 'Internal server error' });
  },
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


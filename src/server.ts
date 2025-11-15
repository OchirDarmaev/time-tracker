import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { initializeDatabase } from './config/database.js';
import { authStubMiddleware, AuthStubRequest } from './middleware/auth_stub.js';
import { userModel } from './models/user.js';

import workerTimeRoutes from './routes/worker/time.js';
import managerReportsRoutes from './routes/manager/reports.js';
import adminProjectsRoutes from './routes/admin/projects.js';
import adminUsersProjectsRoutes from './routes/admin/users_projects.js';
import adminSystemReportsRoutes from './routes/admin/system_reports.js';

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
app.use(session({
  secret: 'timetrack-secret-key-change-in-production',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Auth stub routes (for DATA panel)
app.post('/auth-stub/set-user', (req: AuthStubRequest, res) => {
  const userId = parseInt(req.body.user_id);
  if (userId) {
    req.session!.userId = userId;
    const user = userModel.getById(userId);
    if (user) {
      req.session!.userRole = user.role;
    }
  }
  const referer = req.get('Referer') || '/';
  res.redirect(referer);
});

app.post('/auth-stub/set-role', (req: AuthStubRequest, res) => {
  const role = req.body.role;
  if (role && ['worker', 'office-manager', 'admin'].includes(role)) {
    req.session!.userRole = role;
    // Update user to match role if needed
    const userId = req.session!.userId as number | undefined;
    if (userId) {
      const user = userModel.getById(userId);
      if (user && user.role !== role) {
        // Find a user with the selected role
        const users = userModel.getAll();
        const userWithRole = users.find(u => u.role === role);
        if (userWithRole) {
          req.session!.userId = userWithRole.id;
        }
      }
    }
  }
  const referer = req.get('Referer') || '/';
  res.redirect(referer);
});

// Apply auth stub middleware
app.use(authStubMiddleware);

// Routes
app.use('/worker/time', workerTimeRoutes);
app.use('/manager/reports', managerReportsRoutes);
app.use('/admin/projects', adminProjectsRoutes);
app.use('/admin/users-projects', adminUsersProjectsRoutes);
app.use('/admin/system-reports', adminSystemReportsRoutes);

// Root redirect
app.get('/', (req: AuthStubRequest, res) => {
  const currentUser = req.currentUser;
  if (currentUser) {
    if (currentUser.role === 'worker') {
      return res.redirect('/worker/time');
    } else if (currentUser.role === 'office-manager' || currentUser.role === 'admin') {
      return res.redirect('/manager/reports');
    }
  }
  res.redirect('/worker/time');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


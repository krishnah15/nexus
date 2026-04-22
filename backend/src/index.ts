import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import { env } from './config/env';
import { errorHandler } from './middleware/error-handler';
import { apiLimiter } from './middleware/rate-limit';
import logger from './utils/logger';

// Route imports
import authRoutes from './modules/auth/auth.routes';
import jobsRoutes from './modules/jobs/jobs.routes';
import learningRoutes from './modules/learning/learning.routes';
import dsaRoutes from './modules/dsa/dsa.routes';
import countriesRoutes from './modules/countries/countries.routes';
import documentsRoutes from './modules/documents/documents.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import atsRoutes from './modules/ats/ats.routes';
import jobMatchingRoutes from './modules/job-matching/job-matching.routes';

const app = express();

app.set('trust proxy', 1);
// Global middleware
app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use('/api', apiLimiter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/jobs', jobsRoutes);
app.use('/api/v1/learning', learningRoutes);
app.use('/api/v1/dsa', dsaRoutes);
app.use('/api/v1/countries', countriesRoutes);
app.use('/api/v1/documents', documentsRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/ats', atsRoutes);
app.use('/api/v1/job-matching', jobMatchingRoutes);

// Error handler (must be last)
app.use(errorHandler);

const PORT = parseInt(env.PORT);
app.listen(PORT, () => {
  logger.info(`NEXUS API running on port ${PORT}`);
});

export default app;

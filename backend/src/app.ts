import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
// @ts-ignore
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import logger from './config/logger';
import { errorHandler } from './common/middleware/errorHandler';
import { notFoundHandler } from './common/middleware/notFoundHandler';

// Import routes
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import roleRoutes from './modules/roles/role.routes';
import categoryRoutes from './modules/categories/category.routes';
import brandRoutes from './modules/brands/brand.routes';
import unitRoutes from './modules/units/unit.routes';
import productRoutes from './modules/products/product.routes';
import warehouseRoutes from './modules/warehouses/warehouse.routes';
import inventoryRoutes from './modules/inventory/inventory.routes';
import supplierRoutes from './modules/suppliers/supplier.routes';
import customerRoutes from './modules/customers/customer.routes';
import purchaseRoutes from './modules/purchases/purchase.routes';
import saleRoutes from './modules/sales/sale.routes';
import paymentRoutes from './modules/payments/payment.routes';
import reportRoutes from './modules/reports/report.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import reorderRoutes from './modules/reorder/reorder.routes';
import workflowRoutes from './modules/workflow/workflow.routes';
import creditRoutes from './modules/credit/credit.routes';
import automationRoutes from './modules/automation/automation.routes';
import documentsRoutes from './modules/documents/documents.routes';
import searchRoutes from './modules/search/search.routes';
import localizationRoutes from './modules/localization/localization.routes';
import securityRoutes from './modules/security/security.routes';
import activityRoutes from './modules/activity/activity.routes';
import externalApiRoutes from './modules/external-api/external-api.routes';

const app: Application = express();

// Trust proxy - important for rate limiting and IP detection behind reverse proxies
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
const allowedOrigins = (config.CORS_ORIGIN || 'http://localhost:3000,http://localhost:3003')
  .split(',')
  .map((o) => o.trim());

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests or any localhost origin during development
    if (!origin || config.NODE_ENV === 'development' || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging middleware
if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message: string) => logger.info(message.trim()),
    },
  }));
}

// Global Rate Limiter - applies to all endpoints
const globalLimiter = rateLimit({
  windowMs: Number(config.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: Number(config.RATE_LIMIT_MAX_REQUESTS) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    message: 'Too many requests from this IP, please try again later.',
  },
});
app.use(globalLimiter);

// Strict Rate Limiter for Authentication routes - Maximum 5 attempts per 3 minutes
const authLimiter = rateLimit({
  windowMs: 3 * 60 * 1000, // 3 minutes
  max: 5, // Maximum 5 attempts per 3 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    message: 'Too many authentication attempts. Please try again after 3 minutes.',
  },
});

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.NODE_ENV,
  });
});

// API routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/products', productRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reorder', reorderRoutes);
app.use('/api/workflow', workflowRoutes);
app.use('/api/credit', creditRoutes);
app.use('/api/automation', automationRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/localization', localizationRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/v1/external', externalApiRoutes);

// Serve uploaded files as static assets
app.use('/uploads', express.static('uploads'));

// Welcome route
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Welcome to Inventory Management System API',
    version: '1.0.0',
    documentation: '/api/docs',
  });
});

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);

export default app;

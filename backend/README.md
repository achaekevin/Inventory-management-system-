# Enterprise Inventory Management System - Backend

A production-ready, enterprise-grade backend API built with Node.js, TypeScript, Express, Prisma ORM, and MySQL.

## 🎯 Features

- **Clean Architecture** with Domain-Driven Design (DDD)
- **Complete RBAC** (Role-Based Access Control)
- **JWT Authentication** with refresh tokens
- **Comprehensive Business Logic** for all modules
- **Transaction Management** for data consistency
- **Audit Logging** for all operations
- **Activity Tracking** for security
- **Rate Limiting** and security hardening
- **Input Validation** with Zod
- **Structured Logging** with Winston
- **API Documentation** with Swagger/OpenAPI
- **Automated Testing** with Vitest
- **Production-Ready** with Docker support

## 📁 Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Database migrations
│   └── seed.ts               # Database seeders
├── src/
│   ├── config/               # Configuration files
│   │   ├── database.ts       # Prisma client
│   │   ├── logger.ts         # Winston logger
│   │   └── env.ts            # Environment variables
│   ├── common/               # Shared utilities
│   │   ├── constants/        # Constants
│   │   ├── errors/           # Custom error classes
│   │   ├── middleware/       # Express middleware
│   │   ├── validators/       # Zod validators
│   │   ├── utilities/        # Helper functions
│   │   └── types/            # TypeScript types
│   ├── modules/              # Feature modules
│   │   ├── auth/            # Authentication & Authorization
│   │   ├── users/           # User management
│   │   ├── roles/           # Role management
│   │   ├── products/        # Product management
│   │   ├── categories/      # Category management
│   │   ├── brands/          # Brand management
│   │   ├── units/           # Unit management
│   │   ├── warehouses/      # Warehouse management
│   │   ├── inventory/       # Inventory management
│   │   ├── suppliers/       # Supplier management
│   │   ├── customers/       # Customer management
│   │   ├── purchases/       # Purchase orders
│   │   ├── sales/           # Sales & POS
│   │   ├── payments/        # Payment processing
│   │   ├── reports/         # Reporting engine
│   │   ├── notifications/   # Notification system
│   │   ├── dashboard/       # Dashboard analytics
│   │   └── settings/        # System settings
│   ├── routes/              # API routes
│   ├── jobs/                # Scheduled jobs
│   └── server.ts            # Application entry point
├── logs/                    # Application logs
├── uploads/                 # File uploads
├── tests/                   # Test files
├── .env                     # Environment variables
├── .env.example            # Environment template
├── tsconfig.json           # TypeScript configuration
├── package.json            # Dependencies
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ LTS
- MySQL 8+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up database**
   ```bash
   # Generate Prisma client
   npm run prisma:generate

   # Run migrations
   npm run prisma:migrate

   # Seed database (optional)
   npm run prisma:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:5000`

## 📊 Database Schema

### Core Tables

- **users** - User accounts
- **roles** - User roles
- **permissions** - System permissions
- **user_roles** - User-role mapping
- **role_permissions** - Role-permission mapping

### Product Management

- **products** - Product catalog
- **product_images** - Product images
- **product_variants** - Product variants
- **categories** - Product categories
- **brands** - Product brands
- **units** - Measurement units
- **price_history** - Price change tracking

### Inventory Management

- **warehouses** - Warehouse locations
- **warehouse_zones** - Warehouse zones
- **inventory_items** - Stock levels
- **stock_movements** - Stock transactions
- **stock_transfers** - Inter-warehouse transfers

### Sales & Purchases

- **suppliers** - Supplier directory
- **supplier_contacts** - Supplier contacts
- **customers** - Customer directory
- **customer_addresses** - Customer addresses
- **purchases** - Purchase orders
- **purchase_items** - Purchase order items
- **sales** - Sales transactions
- **sale_items** - Sale line items
- **payments** - Payment records

### System

- **sessions** - Active sessions
- **refresh_tokens** - JWT refresh tokens
- **notifications** - User notifications
- **audit_logs** - Audit trail
- **activity_logs** - User activity
- **settings** - System configuration

## 🔐 Authentication

### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "rememberMe": false
}
```

### Response
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "roles": ["admin"],
      "permissions": ["products.create", "products.read"]
    },
    "tokens": {
      "accessToken": "jwt-token",
      "refreshToken": "jwt-refresh-token"
    }
  }
}
```

## 🛡️ Authorization

The system uses RBAC with the following default roles:

- **Super Admin** - Full system access
- **Admin** - Administrative access
- **Manager** - Management operations
- **User** - Basic user access

### Permission Format

Permissions follow the format: `module.action`

Examples:
- `products.create`
- `products.read`
- `products.update`
- `products.delete`
- `sales.create`
- `reports.export`

## 📝 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password
- `PUT /api/v1/auth/change-password` - Change password

### Products
- `GET /api/v1/products` - List products
- `GET /api/v1/products/:id` - Get product details
- `POST /api/v1/products` - Create product
- `PUT /api/v1/products/:id` - Update product
- `DELETE /api/v1/products/:id` - Delete product

### Categories
- `GET /api/v1/categories` - List categories
- `POST /api/v1/categories` - Create category
- `PUT /api/v1/categories/:id` - Update category
- `DELETE /api/v1/categories/:id` - Delete category

### Inventory
- `GET /api/v1/inventory` - Get inventory levels
- `GET /api/v1/inventory/movements` - Get stock movements
- `POST /api/v1/inventory/adjust` - Adjust stock
- `POST /api/v1/inventory/transfer` - Transfer stock

### Sales
- `GET /api/v1/sales` - List sales
- `GET /api/v1/sales/:id` - Get sale details
- `POST /api/v1/sales` - Create sale (POS)
- `POST /api/v1/sales/:id/return` - Process return

### Purchases
- `GET /api/v1/purchases` - List purchase orders
- `GET /api/v1/purchases/:id` - Get PO details
- `POST /api/v1/purchases` - Create purchase order
- `PUT /api/v1/purchases/:id/approve` - Approve PO
- `PUT /api/v1/purchases/:id/receive` - Receive goods

### Reports
- `GET /api/v1/reports/sales` - Sales report
- `GET /api/v1/reports/inventory` - Inventory report
- `GET /api/v1/reports/profit-loss` - P&L report
- `POST /api/v1/reports/export` - Export report

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## 🔧 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio
- `npm run prisma:seed` - Seed database
- `npm test` - Run tests

## 📦 Deployment

### Using Docker

```bash
# Build image
docker build -t inventory-api .

# Run container
docker run -p 5000:5000 --env-file .env inventory-api
```

### Manual Deployment

1. Build the application
   ```bash
   npm run build
   ```

2. Set environment variables

3. Run migrations
   ```bash
   npm run prisma:migrate
   ```

4. Start the server
   ```bash
   npm start
   ```

## 🔒 Security Features

- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Request throttling
- **Input Validation** - Zod schemas
- **SQL Injection Prevention** - Prisma ORM
- **XSS Protection** - Input sanitization
- **JWT Authentication** - Secure tokens
- **Password Hashing** - bcrypt
- **Account Locking** - Brute force protection
- **Audit Logging** - Complete audit trail

## 📈 Performance

- **Database Indexing** - Optimized queries
- **Connection Pooling** - Prisma connection pool
- **Query Optimization** - Efficient database queries
- **Pagination** - Cursor and offset pagination
- **Caching Ready** - Redis integration ready
- **Background Jobs** - BullMQ for async processing

## 🤝 Contributing

This is an enterprise-grade system. Follow these guidelines:

1. Follow Clean Architecture principles
2. Write comprehensive tests
3. Document all APIs
4. Use TypeScript strictly
5. Follow naming conventions
6. Add audit logging for sensitive operations

## 📄 License

MIT License

## 👨‍💻 Author

Enterprise Backend Development Team

## 🆘 Support

For support, email support@inventory.com or create an issue.

---

**Built with ❤️ for Enterprise Scale**

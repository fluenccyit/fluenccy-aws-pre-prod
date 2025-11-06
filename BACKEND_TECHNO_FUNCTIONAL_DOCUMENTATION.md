# Fluenccy Backend - Techno-Functional Documentation

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Core Architectural Patterns](#core-architectural-patterns)
6. [Domain Layer Architecture](#domain-layer-architecture)
7. [Database Layer](#database-layer)
8. [API Layer (GraphQL & REST)](#api-layer-graphql--rest)
9. [Xero Integration](#xero-integration)
10. [Background Jobs & Workers](#background-jobs--workers)
11. [Common Services](#common-services)
12. [Authentication & Authorization](#authentication--authorization)
13. [Error Handling](#error-handling)
14. [Logging & Monitoring](#logging--monitoring)
15. [Development Workflow](#development-workflow)
16. [Common Patterns & Conventions](#common-patterns--conventions)
17. [Troubleshooting Guide](#troubleshooting-guide)

---

## Executive Summary

**Fluenccy** is a fintech application that helps businesses save money on cross-currency payments by providing currency hedging solutions. The application integrates with **Xero** (a leading accounting software in Australia) to automatically import invoices and payments, analyze currency exposure, and provide hedging recommendations.

### Key Business Functions
- **Cross-Currency Payment Management**: Track and analyze foreign currency transactions
- **Currency Risk Assessment**: Calculate currency exposure and risk scores
- **Hedging Recommendations**: Provide automated hedging strategies
- **Xero Integration**: Seamless sync of invoices and payments from Xero
- **Real-time Rate Monitoring**: Track exchange rates and forward points
- **Multi-tenant Support**: Support for multiple organizations and users

### Technical Highlights
- **GraphQL API** for flexible data querying
- **REST API** for specific integrations (Xero OAuth, file uploads)
- **Background Job Processing** using Bull queues with Redis
- **PostgreSQL** for persistent data storage
- **Firebase Authentication** for user management
- **Modular Domain-Driven Design** architecture

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                            │
│                    (React SPA - Frontend)                      │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/GraphQL
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Application Server                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ GraphQL API  │  │  REST API   │  │   Express    │          │
│  │ (Apollo)     │  │  (Modules)  │  │   Server    │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                  │
│         └─────────────────┼─────────────────┘                  │
│                           │                                     │
│         ┌─────────────────▼─────────────────┐                  │
│         │      Domain Layer (Business Logic) │                  │
│         │  ┌──────────┐  ┌──────────┐       │                  │
│         │  │Resource │  │ Service  │       │                  │
│         │  │  Layer  │  │  Layer   │       │                  │
│         │  └────┬────┘  └────┬─────┘       │                  │
│         │       │             │            │                  │
│         │       └──────┬──────┘            │                  │
│         │              │                    │                  │
│         │       ┌──────▼──────┐             │                  │
│         │       │   DB Layer  │             │                  │
│         │       │ (Creators/  │             │                  │
│         │       │  Getters/   │             │                  │
│         │       │  Updaters/  │             │                  │
│         │       │  Deleters)  │             │                  │
│         │       └─────────────┘             │                  │
│         └───────────────────────────────────┘                  │
└─────────────────────────┬─────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  PostgreSQL  │  │    Redis     │  │   External   │
│   Database   │  │   (Queues)   │  │     APIs     │
│              │  │              │  │  (Xero, FX)  │
└──────────────┘  └──────────────┘  └──────────────┘
        │
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Background Workers                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ Xero Sync    │  │ Currency     │  │ Rate Sync    │        │
│  │   Worker     │  │ Score Worker │  │  Scheduler   │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

1. **Application Server** (`src/server/app.server.ts`)
   - Initializes Express server
   - Sets up Apollo GraphQL server
   - Configures middleware (CORS, cookies, static files)
   - Registers REST API routes
   - Initializes background job queues
   - Handles database migrations on startup

2. **Domain Layer** (`src/server/domain/`)
   - Contains business logic organized by domain
   - Each domain follows a consistent pattern (Resource → Service → DB Layer)

3. **Database Layer**
   - Uses Knex.js for query building
   - Follows CRUD pattern: Creators, Getters, Updaters, Deleters
   - Type-safe database operations

4. **Background Workers**
   - Process async jobs (Xero sync, currency score calculation)
   - Use Bull queues with Redis for job management

---

## Technology Stack

### Runtime & Framework
- **Node.js 14.21.3**: JavaScript runtime
- **Express 4.17.1**: Web application framework
- **TypeScript 4.1.3**: Type-safe JavaScript

### API & Data
- **Apollo Server Express 2.19.2**: GraphQL server
- **GraphQL 15.4.0**: Query language
- **Knex.js 0.21.16**: SQL query builder and migrations
- **PostgreSQL 8.5.1**: Primary database (via `pg` driver)

### Background Processing
- **Bull 4.10.2**: Redis-based job queue
- **Redis**: Job queue backend

### Authentication & Security
- **Firebase Admin 9.4.2**: User authentication
- **JWT**: Token-based authentication
- **Crypto-js 4.1.1**: Encryption utilities

### External Integrations
- **xero-node 4.9.1**: Xero API client
- **axios 0.23.0**: HTTP client for external APIs
- **cross-fetch 3.0.6**: Fetch API for Node.js

### Utilities
- **Lodash 4.17.20**: Utility functions
- **date-fns 2.23.0**: Date manipulation
- **Winston 3.3.3**: Logging
- **Numeral 2.0.6**: Number formatting

### Development Tools
- **Babel**: TypeScript/JavaScript transpilation
- **ESLint**: Code linting
- **Jest**: Testing framework

---

## Project Structure

### Backend Directory Structure

```
src/server/
├── index.ts                    # Entry point (loads env, starts server)
├── app.server.ts              # Server initialization & configuration
├── app.schema.ts              # GraphQL schema composition
│
├── domain/                    # Business logic domains
│   ├── account/              # Account management
│   │   ├── account.model.ts          # TypeScript interfaces
│   │   ├── account.type-def.ts       # GraphQL type definitions
│   │   ├── account.resolver.ts       # GraphQL resolvers
│   │   ├── account.resource.ts       # Business logic layer
│   │   ├── account.service.ts        # Domain services (if needed)
│   │   ├── account.db-creators.ts    # Database insert operations
│   │   ├── account.db-getters.ts     # Database select operations
│   │   ├── account.db-updaters.ts    # Database update operations
│   │   ├── account.db-deleters.ts    # Database delete operations
│   │   └── index.ts                  # Public exports
│   │
│   ├── user/                 # User management
│   ├── organisation/         # Organization management
│   ├── invoice/              # Invoice processing
│   ├── payment/              # Payment processing
│   ├── rate/                 # Exchange rate management
│   ├── xero/                 # Xero integration
│   ├── currency-score/       # Currency scoring
│   ├── upload-csv/          # CSV processing
│   ├── tenant/               # Multi-tenant support
│   ├── admin/                # Admin functionality
│   │
│   └── common/               # Shared utilities
│       ├── constants/        # Application constants
│       ├── models/           # Base models (BaseDbo)
│       ├── services/         # Common services
│       │   ├── db.service.ts         # Database connection
│       │   ├── auth.service.ts       # Firebase authentication
│       │   ├── logger.service.ts     # Logging
│       │   ├── queue.service.ts      # Queue management
│       │   ├── error.service.ts      # Error handling
│       │   ├── email.service.ts      # Email sending
│       │   ├── env.service.ts        # Environment detection
│       │   └── ...
│       └── common.type-def.ts        # Common GraphQL types
│
├── modules/                  # REST API routes (non-GraphQL)
│   ├── routes.ts             # Route registration
│   ├── import-files/         # File upload endpoints
│   ├── hedge-invoice/        # Hedge invoice endpoints
│   ├── org-entitlements/     # Organization entitlements
│   ├── financial-products/   # Financial products
│   ├── profile/              # User profile
│   ├── authentication-code/  # Auth code generation
│   ├── cms/                  # Content management
│   ├── quote-invoice/        # Quote invoice management
│   └── sendemail/            # Email sending
│
└── test/                     # Test utilities
    ├── index.ts
    └── test.service.ts
```

### Supporting Directories

```
src/
├── scheduler/                # Scheduled background jobs
│   ├── rate-sync/          # Rate synchronization scheduler
│   └── xero-sync/          # Xero sync scheduler
│
├── worker/                  # Background job workers
│   ├── xero-sync/          # Xero sync worker
│   └── currency-score/     # Currency score worker
│
└── shared/                  # Shared code (client & server)
    ├── common/             # Common utilities
    ├── rate/               # Rate-related types
    ├── payment/            # Payment types
    └── xero/               # Xero types
```

---

## Core Architectural Patterns

### 1. Domain-Driven Design (DDD)

The backend follows a **Domain-Driven Design** approach where business logic is organized by domain (user, organisation, invoice, payment, etc.). Each domain is self-contained with its own models, services, and database operations.

**Benefits:**
- Clear separation of concerns
- Easy to locate and modify business logic
- Scalable architecture
- Testable components

### 2. Layered Architecture

Each domain follows a **layered architecture**:

```
┌─────────────────────────────────────┐
│   GraphQL Resolver Layer           │  ← API Interface
│   (Type-safe GraphQL operations)   │
└──────────────┬─────────────────────┘
               │
┌──────────────▼─────────────────────┐
│   Resource Layer                  │  ← Business Logic
│   (Orchestrates domain operations) │
└──────────────┬─────────────────────┘
               │
┌──────────────▼─────────────────────┐
│   Service Layer (Optional)         │  ← Domain Services
│   (Complex business calculations)  │
└──────────────┬─────────────────────┘
               │
┌──────────────▼─────────────────────┐
│   Database Layer                   │  ← Data Access
│   (Creators/Getters/Updaters/      │
│    Deleters)                       │
└────────────────────────────────────┘
```

### 3. Repository Pattern

The database layer uses a **Repository Pattern** with separate classes for each operation type:

- **Creators**: Handle `INSERT` operations
- **Getters**: Handle `SELECT` operations
- **Updaters**: Handle `UPDATE` operations
- **Deleters**: Handle `DELETE` operations

**Example Structure:**
```typescript
// user.db-getters.ts
class UserDbGetters {
  async getUserById(id: string): Promise<UserDbo | null>
  async getUserByFirebaseUid(firebaseUid: string): Promise<UserDbo | null>
  async queryUser(): Promise<UserDbo[]>
}

// user.db-creators.ts
class UserDbCreators {
  async createUser(user: UserDbo): Promise<void>
}

// user.db-updaters.ts
class UserDbUpdaters {
  async updateUser(user: UserDbo): Promise<void>
}
```

### 4. Resource Pattern

The **Resource Layer** acts as a facade that:
- Orchestrates multiple database operations
- Applies business rules
- Converts between DBO (Database Object) and Model/GraphQL types
- Handles nullability and error cases
- Provides a clean API for resolvers

**Example:**
```typescript
// user.resource.ts
class UserResource {
  async getUserByToken(token: string): Promise<GqlUser> {
    // 1. Verify token
    const { uid } = await authService.verifyToken(token);
    
    // 2. Get user from database
    const userDbo = await userDbGetters.getUserByFirebaseUid(uid);
    
    // 3. Convert DBO to GraphQL type
    return userService.convertDbo(userDbo);
  }
}
```

### 5. Service Pattern

**Service classes** handle complex business logic that doesn't fit in resources:

- **Payment Service**: Calculates payment costs, converts between currencies
- **Rate Service**: Processes rate data, calculates forward points
- **Xero Service**: Handles Xero API interactions, token management

---

## Domain Layer Architecture

### Domain Module Structure

Each domain module follows this structure:

```
domain-name/
├── {domain}.model.ts          # TypeScript interfaces (DBO types)
├── {domain}.type-def.ts       # GraphQL type definitions
├── {domain}.resolver.ts       # GraphQL resolvers (Query/Mutation)
├── {domain}.resource.ts       # Business logic orchestration
├── {domain}.service.ts        # Complex business logic (optional)
├── {domain}.db-creators.ts     # INSERT operations
├── {domain}.db-getters.ts      # SELECT operations
├── {domain}.db-updaters.ts     # UPDATE operations
├── {domain}.db-deleters.ts     # DELETE operations
├── {domain}.constant.ts        # Domain constants (optional)
├── __tests__/                 # Unit tests
└── index.ts                   # Public exports
```

### Key Domains

#### 1. User Domain (`src/server/domain/user/`)

**Purpose**: Manages user accounts and authentication

**Key Files:**
- `user.model.ts`: `UserDbo` interface
- `user.resolver.ts`: GraphQL queries (`user`)
- `user.resource.ts`: Business logic for user operations
- `user.service.ts`: Converts DBO to GraphQL types

**Key Operations:**
- Get user by Firebase UID
- Get user by token
- Update user (including Xero token set)

#### 2. Organisation Domain (`src/server/domain/organisation/`)

**Purpose**: Manages business organizations and their settings

**Key Operations:**
- Create/update organizations
- Manage organization users
- Track sync status
- Store currency preferences

**Important Fields:**
- `currency`: Base currency for the organization
- `syncStatus`: Status of Xero sync (`calculatingTransactionDetails`, `calculatingTransactionDetailsComplete`, etc.)
- `tenantId`: Xero tenant ID
- `tokenUserId`: User ID that owns the Xero token

#### 3. Invoice Domain (`src/server/domain/invoice/`)

**Purpose**: Manages invoices imported from Xero

**Key Operations:**
- Store invoices from Xero
- Query invoices by organization
- Calculate invoice costs

**Data Model:**
- `invoiceId`: Xero invoice ID
- `tenantId`: Xero tenant ID
- `currencyCode`: Invoice currency
- `total`, `amountDue`, `amountPaid`: Financial amounts

#### 4. Payment Domain (`src/server/domain/payment/`)

**Purpose**: Manages payment records and calculates payment costs

**Key Operations:**
- Store payments from Xero
- Calculate payment costs (min/max/actual)
- Query payments by date range

**Payment Cost Calculation:**
The `payment.service.ts` calculates:
- `minRate`/`maxRate`: Best/worst rates during payment period
- `minCost`/`maxCost`: Cost in base currency
- `actualCost`: Actual cost paid

#### 5. Rate Domain (`src/server/domain/rate/`)

**Purpose**: Manages exchange rates and forward points

**Key Operations:**
- Fetch rates from external API (FX Market API)
- Store historical rates
- Query rates by currency pair and date range
- Calculate forward points

**Rate Synchronization:**
- Scheduler runs periodically to fetch new rates
- Stores rates for supported currency pairs (AUD/USD, EUR/USD, etc.)

#### 6. Xero Domain (`src/server/domain/xero/`)

**Purpose**: Handles Xero integration

**Key Components:**
- `xero.service.ts`: Xero API client management, token refresh, invoice/payment sync
- `xero.controller.ts`: REST endpoints for OAuth flow
- `xero.resource.ts`: Xero API query methods
- `xero.queue.ts`: Background job queue for sync operations

**OAuth Flow:**
1. User initiates connection → `/api/xero/connect`
2. Redirects to Xero OAuth
3. Callback → `/api/xero/connect/callback`
4. Stores token set in user record
5. Queues sync job

#### 7. Currency Score Domain (`src/server/domain/currency-score/`)

**Purpose**: Calculates currency risk scores

**Key Operations:**
- Background job to calculate scores
- Stores scores in organization record

#### 8. Upload CSV Domain (`src/server/domain/upload-csv/`)

**Purpose**: Processes CSV file uploads

**Key Operations:**
- Upload CSV files
- Parse and validate CSV data
- Queue processing jobs

---

## Database Layer

### Database Service (`db.service.ts`)

The `dbService` provides:
- Database connection management (Knex instance)
- Migration execution
- Table access methods
- Health checks

**Key Methods:**
```typescript
dbService.init()              // Initialize connection
dbService.runMigrations()      // Run pending migrations
dbService.table('user')        // Get Knex query builder for table
dbService.healthCheck()        // Check database connectivity
```

### Database Operation Patterns

#### Creators Pattern
```typescript
// user.db-creators.ts
class UserDbCreators {
  async createUser(user: UserDbo) {
    await dbService.table('user').insert({
      ...user,
      id: user.id || sharedUtilService.generateUid()
    });
  }
}
```

#### Getters Pattern
```typescript
// user.db-getters.ts
class UserDbGetters {
  async getUserById(id: string): Promise<UserDbo | null> {
    const [user]: UserDbo[] = await dbService
      .table('user')
      .select()
      .where({ id });
    
    return user || null;
  }
}
```

#### Updaters Pattern
```typescript
// user.db-updaters.ts
class UserDbUpdaters {
  async updateUser(user: UserDbo) {
    await dbService
      .table('user')
      .where({ id: user.id })
      .update(user);
  }
}
```

### Database Models (DBO)

All database models extend `BaseDbo`:
```typescript
type BaseDbo = {
  created_at?: Date;
  updated_at?: Date;
};

type UserDbo = BaseDbo & {
  id: string;
  firebaseUid: string;
  email: string;
  tokenSet?: TokenSet | null;
  // ... other fields
};
```

### Database Tables

**Core Tables:**
- `user`: System users
- `account`: Account types (SME, Accountant, etc.)
- `organisation`: Business organizations
- `organisation_user`: Many-to-many user-organization relationship
- `tenant`: Xero tenants
- `invoice`: Invoices from Xero
- `payment`: Payment records
- `rate`: Historical exchange rates
- `forward_point`: Forward rate points

**Hedging Tables:**
- `hedge_invoice`: Invoices selected for hedging
- `hedge_payment`: Hedged payment records
- `hedge_invoice_basket`: Grouped invoices
- `buying_schedule`: Automated buying schedules
- `recurring_plan`: Recurring hedging plans

**System Tables:**
- `config`: System configuration
- `xero_token_set`: Xero OAuth tokens
- `financial_products`: Available products
- `import_logs`: Import process logs

### Migrations

Migrations are managed with Knex.js:
- Location: `migrations/`
- Run migrations: `yarn db:migrate:latest`
- Create migration: `yarn db:migrate:make <name>`
- Rollback: `yarn db:migrate:rollback`

**Migration File Structure:**
```javascript
exports.up = function(knex) {
  return knex.schema.createTable('user', (table) => {
    table.string('id').primary();
    table.string('firebaseUid').notNullable();
    // ... other columns
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('user');
};
```

---

## API Layer (GraphQL & REST)

### GraphQL API

**Endpoint**: `/graphql`

**Schema Composition** (`app.schema.ts`):
```typescript
const typeDefs = [
  accountTypeDef,
  adminTypeDef,
  organisationTypeDef,
  invoiceTypeDef,
  paymentTypeDef,
  rateTypeDef,
  userTypeDef,
  // ...
];

const resolvers = {
  Query: {
    ...accountResolvers.Query,
    ...organisationResolvers.Query,
    ...invoiceResolvers.Query,
    // ...
  },
  Mutation: {
    ...accountResolvers.Mutation,
    ...adminResolvers.Mutation,
    // ...
  },
};
```

**Resolver Pattern:**
```typescript
// user.resolver.ts
const Query: IResolverObject = {
  async user(rt, args, { token }: GqlContext) {
    return await userResource.getUserByToken(token);
  },
};

export const userResolvers = { Query };
```

**Context:**
- GraphQL context includes `token` from `Authorization` header
- Token is verified in resolvers using `authService.verifyToken()`

### REST API

**Base Path**: `/api/`

**Routes** (`src/server/modules/routes.ts`):
- `/api/import` - File upload endpoints
- `/api/hedge` - Hedge invoice management
- `/api/sendemail` - Email sending
- `/api/orgEntitlement` - Organization entitlements
- `/api/financialProducts` - Financial products
- `/api/profile` - User profile
- `/api/auth` - Authentication codes
- `/api/cms` - Content management
- `/api/quotes` - Quote invoice management

**Xero OAuth Routes** (`xero.controller.ts`):
- `/api/xero/connect` - Initiate Xero connection
- `/api/xero/connect/callback` - OAuth callback
- `/api/xero/signup/connect` - Signup flow connection

**Route Pattern:**
```typescript
// Example: import-files.route.ts
router.post('/upload', upload.single('file'), importFilesController.upload);
router.get('/files', importFilesController.getFiles);
```

**Controller Pattern:**
```typescript
// Example: import-files.controller.ts
class ImportFilesController {
  upload = async (req: Request, res: Response) => {
    // Handle file upload
    // Process file
    // Queue background job
    res.json({ success: true });
  };
}
```

---

## Xero Integration

### Overview

The Xero integration allows organizations to:
1. Connect their Xero account via OAuth
2. Automatically sync invoices and payments
3. Calculate currency exposure
4. Generate hedging recommendations

### OAuth Flow

**1. Initiate Connection** (`/api/xero/connect`)
```typescript
// User clicks "Connect Xero"
// Redirects to Xero OAuth URL
const xeroClient = xeroService.getClient();
const consentUrl = await xeroClient.buildConsentUrl();
response.redirect(consentUrl);
```

**2. OAuth Callback** (`/api/xero/connect/callback`)
```typescript
// Xero redirects back with authorization code
const tokenSet = await xeroService.getTokenFromUrl(xeroClient, request.url);
await userDbUpdaters.updateUser({ ...user, tokenSet });

// Get Xero tenants
const tenants = await xeroClient.updateTenants();
// Create/update tenant records
// Queue sync job
```

### Token Management

**Token Storage:**
- Tokens stored in `user.tokenSet` (JSON field)
- Includes `access_token`, `refresh_token`, `expires_at`

**Token Refresh:**
```typescript
// xero.service.ts
async getRefreshedTokenSet(xeroClient, oldTokenSet) {
  const { refresh_token } = oldTokenSet;
  return await xeroClient.refreshWithRefreshToken(
    XERO_CLIENT_ID,
    XERO_CLIENT_SECRET,
    refresh_token
  );
}
```

**Token Expiration Check:**
```typescript
isTokenExpired(tokenSet) {
  const tokenSet = new TokenSet(tokenSetToCheck);
  return tokenSet.expired();
}
```

### Data Synchronization

**Sync Process** (`xero.service.ts`):
```typescript
async syncInvoicesAndPayments({ orgId, tenantId, lastSynced, orgCurrency, xeroClient }) {
  // 1. Query invoices from Xero (last 36 months or since lastSync)
  const invoices = await xeroResource.queryAllInvoices({
    xeroClient,
    tenantId,
    date: invoiceSyncDate,
    modifiedSince: lastSynced
  });

  // 2. Query payments from Xero (last 24 months or since lastSync)
  const payments = await xeroResource.queryAllPayments({
    xeroClient,
    tenantId,
    date: paymentSyncDate,
    modifiedSince: lastSynced
  });

  // 3. Process and store
  await this.processAndStoreInvoicesAndPayments({
    tenantId,
    orgCurrency,
    payments,
    invoices
  });
}
```

**Invoice/Payment Processing:**
- Filters invoices/payments by:
  - Status (AUTHORISED, PAID)
  - Currency (must be foreign currency)
  - Required fields present
- Calculates payment costs
- Stores in database

**Pagination:**
- Xero API uses pagination (page size: 100)
- `queryAll` method handles pagination automatically
- Stops when reaching sync date or last page

### Background Sync

**Queue Setup** (`xero.queue.ts`):
```typescript
class XeroQueue {
  init() {
    this._queue = queueService.getQueue('xero-sync');
  }

  add(organisation, isCalculateCurrencyScoreEnabled = false) {
    // Check for existing job
    // Add new job if not exists
    await this._queue.add({ orgId, isCalculateCurrencyScoreEnabled });
  }
}
```

**Worker** (`src/worker/xero-sync/xero-sync.worker.ts`):
```typescript
xeroSyncQueue.process(MAX_JOBS_PER_WORKER, async (job) => {
  // 1. Get organization and user
  // 2. Refresh Xero token
  // 3. Verify tenant access
  // 4. Sync invoices and payments
  // 5. Calculate currency score (if enabled)
});
```

**Scheduler** (`src/scheduler/xero-sync/xero-sync.scheduler.ts`):
- Periodically queues sync jobs for all organizations
- Runs on a schedule (cron-like)

---

## Background Jobs & Workers

### Queue System

**Technology**: Bull (Redis-based)

**Queue Service** (`queue.service.ts`):
```typescript
class QueueService {
  getQueue(queueName: 'xero-sync' | 'currency-score') {
    return new Queue(queueName, REDIS_URL, {
      redis: {
        tls: { rejectUnauthorized: false },
        enableTLSForSentinelMode: false
      }
    });
  }
}
```

### Available Queues

#### 1. Xero Sync Queue (`xero-sync`)

**Purpose**: Sync invoices and payments from Xero

**Job Data:**
```typescript
type XeroSyncJobDataType = {
  orgId: string;
  isCalculateCurrencyScoreEnabled: boolean;
};
```

**Process:**
1. Get organization and Xero token user
2. Refresh Xero OAuth token
3. Verify tenant access
4. Sync invoices (36 months) and payments (24 months)
5. Calculate currency score (optional)
6. Update organization sync status

**Worker**: `src/worker/xero-sync/xero-sync.worker.ts`

#### 2. Currency Score Queue (`currency-score`)

**Purpose**: Calculate currency risk scores for organizations

**Job Data:**
```typescript
type CurrencyScoreJobDataType = {
  orgId: string;
};
```

**Process:**
1. Get organization payment history
2. Analyze currency exposure
3. Calculate risk score
4. Update organization record

**Worker**: `src/worker/currency-score/currency-score.worker.ts`

### Schedulers

#### Rate Sync Scheduler (`src/scheduler/rate-sync/rate-sync.scheduler.ts`)

**Purpose**: Fetch and store exchange rates

**Process:**
1. For each supported currency pair:
   - Get latest rate from database
   - Fetch new rates from FX Market API (from latest date to today)
   - Store new rates
2. Handles weekend dates (skips weekends)

**Supported Currency Pairs:**
- AUD/USD, EUR/USD, GBP/USD, NZD/USD
- USD/CAD, USD/JPY
- And more (defined in `rate.constant.ts`)

**Runs**: On server startup and on schedule

#### Xero Sync Scheduler (`src/scheduler/xero-sync/xero-sync.scheduler.ts`)

**Purpose**: Periodically queue Xero sync jobs

**Process:**
1. Get all organizations with Xero connections
2. Queue sync job for each organization

---

## Common Services

### Database Service (`db.service.ts`)

**Purpose**: Manages database connection and operations

**Key Methods:**
```typescript
init(config?)                    // Initialize Knex connection
runMigrations()                  // Run pending migrations
table(tableName)                 // Get query builder for table
healthCheck()                    // Check database connectivity
checkAndSeedDatabase()          // Seed database if empty
```

**Usage:**
```typescript
await dbService.init();
const users = await dbService.table('user').select();
```

### Authentication Service (`auth.service.ts`)

**Purpose**: Firebase authentication management

**Key Methods:**
```typescript
init()                           // Initialize Firebase Admin
verifyToken(token)               // Verify JWT token
createUser({ email, password })  // Create Firebase user
getFirebaseUserByUid(uid)       // Get user by UID
getFirebaseUserEmail(email)     // Get user by email
```

**Usage:**
```typescript
authService.init();
const { uid } = await authService.verifyToken(token);
```

### Logger Service (`logger.service.ts`)

**Purpose**: Centralized logging (Winston)

**Key Methods:**
```typescript
info(message, metadata?)         // Info log
error(message, metadata?)        // Error log
warn(message, metadata?)        // Warning log
debug(message, metadata?)        // Debug log
```

**Usage:**
```typescript
loggerService.info('Processing payment', { paymentId, orgId });
loggerService.error('Failed to sync', { error: error.message, stackTrace });
```

### Queue Service (`queue.service.ts`)

**Purpose**: Bull queue management

**Key Methods:**
```typescript
getQueue(queueName)              // Get or create queue
```

**Usage:**
```typescript
const queue = queueService.getQueue('xero-sync');
await queue.add({ orgId });
```

### Error Service (`error.service.ts`)

**Purpose**: Standardized error handling

**Key Methods:**
```typescript
handleDbError(method, error)    // Handle database errors
```

**Usage:**
```typescript
try {
  await dbService.table('user').insert(user);
} catch (error) {
  throw errorService.handleDbError('createUser', error);
}
```

### Environment Service (`env.service.ts`)

**Purpose**: Environment detection

**Key Methods:**
```typescript
get()                            // Get current environment
isLocal()                        // Check if local
isStaging()                      // Check if staging
isProduction()                   // Check if production
isPreProd()                      // Check if pre-prod
```

**Usage:**
```typescript
if (envService.isLocal()) {
  // Local-specific logic
}
```

### Email Service (`email.service.ts`)

**Purpose**: Send emails via SendGrid

**Key Methods:**
```typescript
sendEmail({ to, subject, html }) // Send email
```

### Encryption Service (`encryption.service.ts`)

**Purpose**: Encrypt/decrypt sensitive data

**Key Methods:**
```typescript
encrypt(text)                    // Encrypt string
decrypt(encryptedText)           // Decrypt string
```

### Date Service (`date.service.ts`)

**Purpose**: Date formatting and parsing

**Key Methods:**
```typescript
parseDate(date, format)          // Parse date string
formatDate(date, format)         // Format date
```

### Utility Service (`util.service.ts`)

**Purpose**: General utilities

**Key Methods:**
```typescript
handleAllowNull({ allowNull, error }) // Handle null cases
patchObject(obj, key, value, allowNull) // Patch object properties
```

---

## Authentication & Authorization

### Authentication Flow

**1. User Login (Frontend)**
- User authenticates with Firebase
- Receives Firebase JWT token
- Token stored in cookies/localStorage

**2. API Request**
- Frontend sends token in `Authorization` header
- GraphQL context extracts token: `context: ({ req }) => ({ token: req.headers.authorization })`

**3. Token Verification (Resolver)**
```typescript
async user(rt, args, { token }: GqlContext) {
  // Token verified in resource layer
  return await userResource.getUserByToken(token);
}

// In user.resource.ts
async getUserByToken(token: string) {
  const { uid } = await authService.verifyToken(token);
  const userDbo = await userDbGetters.getUserByFirebaseUid(uid);
  return userService.convertDbo(userDbo);
}
```

### Authorization

**Organization-Level Access:**
- Users are linked to organizations via `organisation_user` table
- Resolvers check user's organization membership

**Role-Based Access:**
- User roles stored in `account.type`
- Roles: `accountowner`, `superuser`, `superdealer`

**Permission Service** (`permission.service.ts`):
- Checks user permissions for operations
- Used in resolvers and resources

---

## Error Handling

### Error Service Pattern

**Database Errors:**
```typescript
// error.service.ts
handleDbError(method: string, error: unknown) {
  loggerService.error(`Database error in ${method}`, { error });
  throw new ApolloError(ERROR_MESSAGE.databaseError);
}
```

**Usage:**
```typescript
try {
  await dbService.table('user').insert(user);
} catch (error) {
  throw errorService.handleDbError('createUser', error);
}
```

### GraphQL Errors

**Error Types:**
- `ApolloError`: General application errors
- `AuthenticationError`: Authentication failures
- `UserInputError`: Invalid user input

**Error Codes:**
- Defined in `ERROR_CODE` constant
- Used in error extensions

### Error Messages

**Constants** (`error-message.constant.ts`):
```typescript
export const ERROR_MESSAGE = {
  noUser: 'User not found',
  noOrganisation: 'Organisation not found',
  databaseError: 'Database error occurred',
  // ...
};
```

---

## Logging & Monitoring

### Logging Service

**Technology**: Winston

**Log Levels:**
- `info`: General information
- `error`: Errors and exceptions
- `warn`: Warnings
- `debug`: Debug information

**Log Format:**
```typescript
loggerService.info('Processing payment', {
  service: 'PaymentService',
  method: 'processPayment',
  paymentId: '123',
  orgId: '456'
});
```

**Best Practices:**
- Include context (service, method, IDs)
- Log at appropriate levels
- Include stack traces for errors
- Use structured logging (objects, not strings)

### Monitoring

**New Relic** (commented out in code):
- APM monitoring
- Performance tracking
- Error tracking

**Health Checks:**
- `/api/health` endpoint
- Checks database and Firebase connectivity

---

## Development Workflow

### Local Development Setup

**1. Prerequisites:**
```bash
# Install Node.js 14.21.3
# Install Yarn
# Install Docker Desktop
```

**2. Environment Setup:**
```bash
# Copy environment file
cp .env.local .env

# Install dependencies
yarn install
```

**3. Start Services:**
```bash
# Terminal 1: Start database (Docker)
yarn dev:db

# Terminal 2: Start server
yarn dev:server

# Terminal 3: Start client (if needed)
yarn dev:client
```

**4. Database Setup:**
```bash
# Run migrations
yarn db:migrate:latest

# Seed database (if needed)
yarn db:seed:run
```

### Environment Variables

**Required Variables:**
```bash
# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DATABASE=fluenccy
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password

# Redis
REDIS_URL=redis://localhost:6379

# Firebase
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_ADMIN_PRIVATE_KEY=your_private_key
FIREBASE_ADMIN_CLIENT_EMAIL=your_client_email
# ... other Firebase vars

# Xero
XERO_CLIENT_ID=your_client_id
XERO_CLIENT_SECRET=your_client_secret
XERO_CONNECT_OAUTH_REDIRECT_URI=http://localhost:3001/api/xero/connect/callback
XERO_SIGN_UP_OAUTH_REDIRECT_URI=http://localhost:3001/api/xero/signup/connect/callback

# External APIs
FX_MARKET_API_KEY=your_api_key

# Application
PORT=3001
ENVIRONMENT=local
DOMAIN=http://localhost:3001
```

### Common Development Tasks

#### Adding a New Domain

**1. Create Domain Structure:**
```bash
mkdir -p src/server/domain/my-domain
cd src/server/domain/my-domain
```

**2. Create Files:**
- `my-domain.model.ts` - DBO interface
- `my-domain.type-def.ts` - GraphQL types
- `my-domain.resolver.ts` - GraphQL resolvers
- `my-domain.resource.ts` - Business logic
- `my-domain.db-creators.ts` - INSERT operations
- `my-domain.db-getters.ts` - SELECT operations
- `my-domain.db-updaters.ts` - UPDATE operations
- `my-domain.db-deleters.ts` - DELETE operations
- `index.ts` - Exports

**3. Register in Schema:**
```typescript
// app.schema.ts
import { myDomainTypeDef, myDomainResolvers } from '@server/my-domain';

const typeDefs = [
  // ... existing
  myDomainTypeDef,
];

const resolvers = {
  Query: {
    // ... existing
    ...myDomainResolvers.Query,
  },
  Mutation: {
    // ... existing
    ...myDomainResolvers.Mutation,
  },
};
```

#### Adding a Database Table

**1. Create Migration:**
```bash
yarn db:migrate:make add_my_table
```

**2. Write Migration:**
```javascript
// migrations/XXXXXX_add_my_table.js
exports.up = function(knex) {
  return knex.schema.createTable('my_table', (table) => {
    table.string('id').primary();
    table.string('name').notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('my_table');
};
```

**3. Run Migration:**
```bash
yarn db:migrate:latest
```

**4. Update DB Service:**
```typescript
// db.service.ts
type Table =
  | 'user'
  | 'my_table'  // Add here
  | // ...
```

#### Adding a REST Endpoint

**1. Create Controller:**
```typescript
// src/server/modules/my-module/my-module.controller.ts
class MyModuleController {
  init = (app: express.Application) => {
    app.get('/api/my-module/endpoint', this.myEndpoint);
  };

  myEndpoint = async (req: Request, res: Response) => {
    // Handle request
    res.json({ success: true });
  };
}
```

**2. Register Route:**
```typescript
// src/server/modules/routes.ts
import routerMyModule from './my-module/my-module.route';

router.use('/my-module', routerMyModule);
```

#### Adding a Background Job

**1. Create Queue:**
```typescript
// src/server/domain/my-domain/my-domain.queue.ts
class MyDomainQueue {
  private _queue: Queue<MyJobDataType> | undefined;

  init() {
    this._queue = queueService.getQueue('my-queue');
  }

  add(data: MyJobDataType) {
    await this._queue.add(data);
  }
}
```

**2. Create Worker:**
```typescript
// src/worker/my-worker/my-worker.worker.ts
const queue = queueService.getQueue('my-queue');

queue.process(1, async (job) => {
  // Process job
});
```

**3. Initialize:**
```typescript
// app.server.ts
import { myDomainQueue } from '@server/my-domain';
myDomainQueue.init();
```

### Testing

**Unit Tests:**
```bash
# Run all tests
yarn test

# Run server tests
yarn test:server

# Run with coverage
yarn test:server:coverage
```

**Test Structure:**
```
src/server/domain/user/__tests__/
├── user.db-getters.test.ts
├── user.resolver.test.ts
└── user.mocks.ts
```

---

## Common Patterns & Conventions

### Naming Conventions

**Files:**
- Domain files: `{domain}.{type}.ts` (e.g., `user.resolver.ts`)
- Test files: `{domain}.{type}.test.ts`
- Constants: `{domain}.constant.ts`

**Classes:**
- Resources: `{Domain}Resource` (e.g., `UserResource`)
- Services: `{Domain}Service` (e.g., `PaymentService`)
- DB Operations: `{Domain}Db{Getters|Creators|Updaters|Deleters}`

**Variables:**
- DBO types: `{Domain}Dbo` (e.g., `UserDbo`)
- GraphQL types: `Gql{Domain}` (e.g., `GqlUser`)

### Code Organization

**1. Imports Order:**
```typescript
// 1. External libraries
import express from 'express';
import { map } from 'lodash';

// 2. GraphQL types
import { GqlUser } from '@graphql';

// 3. Server domain imports
import { userDbGetters } from '@server/user';
import { dbService } from '@server/common';

// 4. Shared imports
import { sharedUtilService } from '@shared/common';
```

**2. Export Pattern:**
```typescript
// index.ts
export { userResource } from './user.resource';
export { userService } from './user.service';
export type { UserDbo } from './user.model';
```

**3. Error Handling Pattern:**
```typescript
try {
  // Operation
} catch (error) {
  throw errorService.handleDbError('methodName', error);
}
```

**4. Logging Pattern:**
```typescript
const logParam = { service: 'ServiceName', method: 'methodName', id };
loggerService.info('Operation started', logParam);
```

### Type Safety

**1. Use TypeScript Interfaces:**
```typescript
type GetUserParam = {
  userId: string;
  allowNull?: boolean;
};
```

**2. Null Handling:**
```typescript
async getUserById(id: string, allowNull?: false): Promise<UserDbo>;
async getUserById(id: string, allowNull: true): Promise<UserDbo | null>;
async getUserById(id: string, allowNull = false) {
  // Implementation
}
```

**3. GraphQL Types:**
- Use `@graphql` import for generated types
- Convert DBO to GraphQL types in service layer

### Database Patterns

**1. Always Use Transactions for Multi-Step Operations:**
```typescript
await dbService.transaction(async (trx) => {
  await trx('user').insert(user);
  await trx('organisation').insert(org);
});
```

**2. Use Parameterized Queries:**
```typescript
// Good
await dbService.table('user').where({ id: userId }).select();

// Bad (SQL injection risk)
await dbService.raw(`SELECT * FROM user WHERE id = '${userId}'`);
```

**3. Handle Null Cases:**
```typescript
const [user] = await dbService.table('user').where({ id }).select();
if (!user) {
  return null; // or throw error
}
```

### GraphQL Patterns

**1. Resolver Structure:**
```typescript
const Query: IResolverObject = {
  async myQuery(rt, args, { token }: GqlContext) {
    // Verify auth if needed
    // Call resource
    return await myResource.getMyData(args);
  },
};
```

**2. Type Definitions:**
```typescript
export const myDomainTypeDef = gql`
  type MyType {
    id: ID!
    name: String!
  }

  type Query {
    myQuery(input: MyInput!): MyType!
  }
`;
```

---

## Troubleshooting Guide

### Common Issues

#### 1. Database Connection Errors

**Symptoms:**
- `Connection refused` errors
- `Database not initialized` errors

**Solutions:**
```bash
# Check Docker is running
docker ps

# Check database is up
docker-compose ps db

# Restart database
docker-compose restart db

# Check connection string in .env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
```

#### 2. Redis Connection Errors

**Symptoms:**
- Queue initialization fails
- Background jobs not processing

**Solutions:**
```bash
# Check Redis is running
docker-compose ps redis

# Test Redis connection
redis-cli -h localhost -p 6379 ping

# Check REDIS_URL in .env
REDIS_URL=redis://localhost:6379
```

#### 3. Xero OAuth Errors

**Symptoms:**
- OAuth callback fails
- Token refresh fails

**Solutions:**
- Check Xero app credentials in .env
- Verify redirect URIs match Xero app settings
- Check token expiration
- Review Xero API rate limits

#### 4. GraphQL Schema Errors

**Symptoms:**
- Schema generation fails
- Type errors

**Solutions:**
```bash
# Regenerate GraphQL types
yarn gql

# Check for circular dependencies
# Verify type definitions are correct
```

#### 5. Migration Errors

**Symptoms:**
- Migrations fail to run
- Database schema out of sync

**Solutions:**
```bash
# Check migration status
yarn db:migrate:list

# Rollback last migration
yarn db:migrate:rollback

# Run migrations
yarn db:migrate:latest

# Check for migration conflicts
```

#### 6. Background Job Issues

**Symptoms:**
- Jobs not processing
- Jobs stuck in queue

**Solutions:**
- Check Redis connection
- Verify worker is running
- Check job data format
- Review queue logs

### Debugging Tips

**1. Enable Debug Logging:**
```typescript
loggerService.info('Debug info', { data });
```

**2. Check Database Queries:**
```typescript
// Enable Knex query logging
const knex = Knex({
  // ... config
  debug: true
});
```

**3. Inspect GraphQL Queries:**
- Use GraphQL Playground (if enabled)
- Check Apollo Server logs

**4. Monitor Background Jobs:**
```typescript
// Add job logging
queue.process(async (job) => {
  loggerService.info('Processing job', { jobId: job.id, data: job.data });
  // ...
});
```

### Performance Optimization

**1. Database Indexes:**
- Add indexes on frequently queried columns
- Review query performance

**2. Query Optimization:**
- Use `select()` to limit columns
- Add `where()` clauses early
- Use joins instead of multiple queries

**3. Caching:**
- Cache frequently accessed data
- Use Redis for session data

**4. Background Jobs:**
- Process heavy operations asynchronously
- Use job queues for long-running tasks

---

## Additional Resources

### Documentation Files
- `README.md` - Project overview
- `DEVELOPER_DOCUMENTATION.md` - General developer guide
- `DEPLOYMENT.md` - Deployment instructions
- `AUTHENTICATION_DOCUMENTATION.md` - Auth details
- `CURRENCY_MANAGEMENT_TECHNICAL_DOCUMENTATION.md` - Currency features

### External Documentation
- [Apollo Server Docs](https://www.apollographql.com/docs/apollo-server/)
- [Knex.js Docs](https://knexjs.org/)
- [Bull Queue Docs](https://github.com/OptimalBits/bull)
- [Xero API Docs](https://developer.xero.com/documentation/)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

### Key Files to Review
- `src/server/app.server.ts` - Server initialization
- `src/server/app.schema.ts` - GraphQL schema
- `src/server/domain/common/services/db.service.ts` - Database service
- `src/server/domain/xero/xero.service.ts` - Xero integration
- `src/server/domain/payment/payment.service.ts` - Payment calculations

---

## Conclusion

This document provides a comprehensive overview of the Fluenccy backend architecture. Key takeaways:

1. **Modular Architecture**: Domain-driven design with clear separation of concerns
2. **Type Safety**: TypeScript throughout with GraphQL type generation
3. **Background Processing**: Bull queues for async operations
4. **External Integration**: Xero OAuth and API integration
5. **Database Patterns**: Consistent CRUD patterns across domains

For specific implementation details, refer to the source code and inline comments. When adding features or fixing bugs, follow the established patterns to maintain code consistency.

---

**Last Updated**: 2025-01-27
**Version**: 1.0


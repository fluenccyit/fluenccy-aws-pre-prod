# Fluenccy Developer Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Database Schema](#database-schema)
6. [Core Business Logic](#core-business-logic)
7. [Authentication & Authorization](#authentication--authorization)
8. [API & GraphQL](#api--graphql)
9. [Client-Side Architecture](#client-side-architecture)
10. [Development Setup](#development-setup)
11. [Deployment](#deployment)
12. [Testing](#testing)
13. [Common Tasks](#common-tasks)
14. [Troubleshooting](#troubleshooting)

## Project Overview

**Fluenccy** is a comprehensive financial technology platform designed for currency hedging and risk management. The application helps businesses manage foreign exchange exposure through automated hedging strategies, real-time rate monitoring, and financial data integration.

### Key Features
- **Currency Risk Management**: Automated hedging strategies based on business needs
- **Real-time Rate Monitoring**: Live foreign exchange rate tracking and analysis
- **Financial Data Integration**: Seamless integration with accounting systems (Xero)
- **Multi-tenant Architecture**: Support for multiple organizations and users
- **Advanced Analytics**: Currency scoring and performance analysis
- **Self-service Portal**: Client-facing interface for managing hedging activities

### Business Domain
The application serves:
- **SMEs (Small and Medium Enterprises)**: Basic currency hedging needs
- **Accountants**: Managing multiple client portfolios
- **Super Dealers**: Advanced trading and risk management
- **Super Users**: Platform administration and oversight

## Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client App    │    │   Server API    │    │   Database      │
│   (React SPA)   │◄──►│  (Node.js/GraphQL)│◄──►│  (PostgreSQL)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Static Assets │    │   Redis Cache   │    │   File Storage  │
│   (Webpack)     │    │   (Bull Queue)  │    │   (Uploads)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Component Architecture
- **Frontend**: React SPA with TypeScript, Tailwind CSS, Apollo Client
- **Backend**: Node.js with Express, Apollo Server, GraphQL
- **Database**: PostgreSQL with Knex.js for migrations
- **Cache**: Redis for session management and background jobs
- **Queue**: Bull for background processing (rate sync, Xero sync)
- **Storage**: Local file system for uploads and static assets

## Technology Stack

### Frontend
- **React 17**: Component-based UI framework
- **TypeScript**: Type-safe JavaScript
- **Apollo Client**: GraphQL client with caching
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **Victory**: Data visualization
- **React Beautiful DnD**: Drag and drop functionality

### Backend
- **Node.js 14.21.3**: JavaScript runtime
- **Express**: Web application framework
- **Apollo Server**: GraphQL server
- **Knex.js**: SQL query builder and migrations
- **Bull**: Redis-based job queue
- **Winston**: Logging framework
- **Firebase Admin**: Authentication and user management

### Database & Storage
- **PostgreSQL 13**: Primary database
- **Redis 6.2**: Caching and job queue
- **File System**: Local storage for uploads

### Development Tools
- **Webpack**: Module bundler
- **Babel**: JavaScript transpiler
- **ESLint**: Code linting
- **Jest**: Testing framework
- **Cypress**: End-to-end testing
- **Storybook**: Component development

### Deployment
- **Docker**: Containerization
- **AWS ECS Fargate**: Container orchestration
- **AWS RDS**: Managed PostgreSQL
- **AWS ElastiCache**: Managed Redis
- **AWS ECR**: Container registry
- **CloudFormation**: Infrastructure as Code

## Project Structure

```
fluenccy-aws-pre-prod/
├── src/
│   ├── client/                 # Frontend React application
│   │   ├── app.tsx            # Main app component
│   │   ├── client.tsx         # Client entry point
│   │   ├── domain/            # Feature-based modules
│   │   │   ├── account/       # Account management
│   │   │   ├── admin/         # Admin interface
│   │   │   ├── auth/          # Authentication
│   │   │   ├── chart/         # Data visualization
│   │   │   ├── dashboard/     # Main dashboard
│   │   │   ├── organisation/  # Organization management
│   │   │   ├── plan/          # Hedging plans
│   │   │   ├── quote/         # Quote management
│   │   │   └── upload-csv/    # CSV upload functionality
│   │   ├── assets/            # Static assets
│   │   └── styles/           # CSS styles
│   ├── server/                # Backend Node.js application
│   │   ├── app.server.ts      # Server entry point
│   │   ├── app.schema.ts      # GraphQL schema
│   │   ├── domain/            # Business logic modules
│   │   │   ├── account/       # Account domain
│   │   │   ├── admin/         # Admin domain
│   │   │   ├── auth/          # Authentication domain
│   │   │   ├── common/        # Shared utilities
│   │   │   ├── organisation/  # Organization domain
│   │   │   ├── invoice/       # Invoice management
│   │   │   ├── payment/       # Payment processing
│   │   │   ├── rate/         # Exchange rate management
│   │   │   ├── user/         # User management
│   │   │   └── upload-csv/   # CSV processing
│   │   └── modules/          # API routes
│   ├── shared/               # Shared code between client and server
│   ├── scheduler/            # Background job schedulers
│   └── worker/               # Background job workers
├── migrations/               # Database migrations
├── seeds/                    # Database seed data
├── webpack/                 # Webpack configurations
├── cypress/                 # E2E tests
├── data/                    # Sample data files
├── web/                     # Built static assets
└── dist/                    # Compiled server code
```

## Database Schema

### Core Tables

#### Users and Organizations
- **`user`**: System users with Firebase authentication
- **`account`**: Account entities (SME, Accountant)
- **`organisation`**: Business organizations with hedging needs
- **`organisation_user`**: Many-to-many relationship between users and organizations

#### Financial Data
- **`invoice`**: Invoices from external systems (Xero)
- **`payment`**: Payment records with currency details
- **`rate`**: Historical exchange rates
- **`forward_point`**: Forward rate points for currency pairs

#### Hedging Management
- **`hedge_invoice`**: Invoices selected for hedging
- **`hedge_payment`**: Payment records for hedged transactions
- **`hedge_invoice_basket`**: Grouped invoices for hedging
- **`buying_schedule`**: Automated buying schedules
- **`recurring_plan`**: Recurring hedging plans

#### CRM and Analytics
- **`crm_entitlements`**: Client entitlements and limits
- **`crm_entries`**: CRM data entries
- **`crm_feedback`**: Client feedback
- **`crm_import_logs`**: Import process logs

#### System Configuration
- **`config`**: System configuration parameters
- **`tenant`**: External system tenants (Xero)
- **`xero_token_set`**: Xero API tokens
- **`financial_products`**: Available financial products

### Key Relationships
```
User (1) ──► (M) Organisation
Account (1) ──► (M) Organisation
Organisation (1) ──► (M) Invoice
Organisation (1) ──► (M) Payment
Organisation (1) ──► (M) HedgeInvoice
```

## Core Business Logic

### Currency Hedging Workflow
1. **Data Import**: Import invoices and payments from Xero
2. **Risk Assessment**: Calculate currency exposure and risk scores
3. **Hedge Planning**: Create hedging strategies based on business needs
4. **Execution**: Execute hedging transactions
5. **Monitoring**: Track performance and adjust strategies

### Currency Scoring Algorithm
The system calculates currency scores based on:
- **Historical volatility**: Past price movements
- **Volume analysis**: Trading volume patterns
- **Market conditions**: Current market sentiment
- **Business impact**: Organization-specific risk factors

### Rate Synchronization
- **Real-time updates**: Live rate feeds from external providers
- **Historical data**: Backfill missing rate data
- **Forward points**: Calculate forward rates for different maturities
- **Cross-currency**: Support for multiple currency pairs

## Authentication & Authorization

### Authentication Flow
1. **Firebase Authentication**: Primary authentication provider
2. **JWT Tokens**: Secure API access tokens
3. **Two-Factor Authentication**: Additional security layer
4. **Session Management**: Redis-based session storage

### User Roles
- **`accountowner`**: Account owner with full access
- **`superuser`**: Platform administrator
- **`superdealer`**: Advanced trading capabilities

### Authorization Levels
- **Organization-level**: Access to organization data
- **Feature-level**: Role-based feature access
- **Data-level**: Row-level security for sensitive data

## API & GraphQL

### GraphQL Schema Structure
```graphql
type Query {
  # User queries
  user: User!
  organisations: [Organisation!]!
  
  # Organization queries
  organisationById(input: ByIdInput!): Organisation!
  
  # Rate queries
  rates(input: RateInput!): [Rate!]!
  
  # Invoice queries
  invoices(input: InvoiceInput!): [Invoice!]!
}

type Mutation {
  # User mutations
  signUp(input: SignUpInput!): User!
  
  # Organization mutations
  updateOrganisation(input: UpdateOrganisationInput!): Organisation!
  
  # Admin mutations
  # ... admin-specific mutations
}
```

### Key Resolvers
- **User Resolvers**: Authentication and user management
- **Organization Resolvers**: Business logic for organizations
- **Rate Resolvers**: Exchange rate data and calculations
- **Invoice Resolvers**: Invoice processing and management
- **Admin Resolvers**: Administrative functions

### API Endpoints
- **GraphQL**: `/graphql` - Main API endpoint
- **Health Check**: `/api/health` - System health monitoring
- **File Upload**: `/api/upload` - File upload handling
- **Xero Integration**: `/api/xero/*` - Xero API integration

## Client-Side Architecture

### Routing Structure
```
/ (AppRoute)
├── /auth (AuthRoute)
│   ├── /login
│   ├── /signup
│   ├── /forgot-password
│   └── /two-factor
├── /admin (AdminRoute)
│   └── /dashboard
├── /onboarding (OnboardingRoute)
│   └── /setup
└── /app (AppRoute)
    ├── /dashboard
    ├── /charts
    ├── /plans
    ├── /organisation
    ├── /quotes
    └── /upload-csv
```

### State Management
- **Apollo Client Cache**: GraphQL data caching
- **React Context**: Global state management
- **Local Storage**: Client-side persistence
- **URL State**: Route-based state

### Component Architecture
- **Layout Components**: Page structure and navigation
- **Feature Components**: Business logic components
- **UI Components**: Reusable interface elements
- **Form Components**: Data input and validation

## Development Setup

### Prerequisites
- Node.js 14.21.3
- Yarn package manager
- Docker Desktop
- Git

### Local Development
```bash
# Install dependencies
yarn install

# Start database
yarn dev:db

# Start server (Terminal 1)
yarn dev:server

# Start client (Terminal 2)
yarn dev:client
```

### Environment Configuration
```bash
# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DATABASE=fluenccy
POSTGRES_USER=postgres
POSTGRES_PASSWORD=6290

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=secret

# Application
NODE_ENV=development
PORT=3001
```

### Database Setup
```bash
# Run migrations
yarn db:migrate:latest

# Seed database
yarn db:seed:run
```

## Deployment

### AWS Infrastructure
- **ECS Fargate**: Container orchestration
- **RDS PostgreSQL**: Managed database
- **ElastiCache Redis**: Managed cache
- **Application Load Balancer**: Traffic distribution
- **CloudWatch**: Monitoring and logging

### Deployment Process
1. **Build Application**: Compile TypeScript and bundle assets
2. **Docker Image**: Create containerized application
3. **Push to ECR**: Upload to AWS container registry
4. **Deploy Infrastructure**: CloudFormation stack deployment
5. **Update Service**: Deploy new ECS service version

### Environment-Specific Configurations
- **Development**: Local Docker Compose setup
- **Staging**: AWS ECS with minimal resources
- **Production**: AWS ECS with high availability

## Testing

### Test Structure
- **Unit Tests**: Jest for individual components
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Cypress for user workflows
- **Component Tests**: Storybook for UI components

### Running Tests
```bash
# Unit tests
yarn test

# Client tests
yarn test:client

# Server tests
yarn test:server

# E2E tests
yarn test:cypress
```

### Test Coverage
- **Client**: React components and hooks
- **Server**: API resolvers and business logic
- **Shared**: Utility functions and types

## Common Tasks

### Adding New Features
1. **Create Domain Module**: Add business logic in `src/server/domain/`
2. **Define GraphQL Schema**: Add types and resolvers
3. **Create Client Components**: Add UI components in `src/client/domain/`
4. **Add Routes**: Update routing configuration
5. **Write Tests**: Add unit and integration tests

### Database Changes
1. **Create Migration**: `yarn db:migrate:make <name>`
2. **Update Schema**: Modify database structure
3. **Update Models**: Modify TypeScript interfaces
4. **Run Migration**: `yarn db:migrate:latest`

### API Development
1. **Define Types**: Add GraphQL type definitions
2. **Create Resolvers**: Implement business logic
3. **Add Queries/Mutations**: Update schema
4. **Test Endpoints**: Verify API functionality

### Client Development
1. **Create Components**: Add React components
2. **Add Routes**: Update routing configuration
3. **Implement State**: Add state management
4. **Style Components**: Add Tailwind CSS classes

## Troubleshooting

### Common Issues

#### Database Connection
```bash
# Check database status
docker-compose ps

# View database logs
docker-compose logs db

# Restart database
docker-compose restart db
```

#### Redis Connection
```bash
# Check Redis status
docker-compose ps redis

# Test Redis connection
redis-cli -h localhost -p 6379 ping
```

#### Build Issues
```bash
# Clean build artifacts
yarn build:clean

# Reinstall dependencies
rm -rf node_modules yarn.lock
yarn install
```

#### GraphQL Issues
- Check Apollo Client cache
- Verify schema definitions
- Review resolver implementations
- Check authentication tokens

### Debug Commands
```bash
# Server logs
yarn dev:server

# Client logs
yarn dev:client

# Database logs
docker-compose logs db

# Redis logs
docker-compose logs redis
```

### Performance Issues
- **Database**: Check query performance and indexes
- **Redis**: Monitor cache hit rates
- **Client**: Check bundle size and loading times
- **Server**: Monitor CPU and memory usage

## Additional Resources

### Documentation
- [React Documentation](https://reactjs.org/docs)
- [Apollo Client Documentation](https://www.apollographql.com/docs/react/)
- [GraphQL Documentation](https://graphql.org/learn/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### AWS Services
- [ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [RDS Documentation](https://docs.aws.amazon.com/rds/)
- [ElastiCache Documentation](https://docs.aws.amazon.com/elasticache/)

### Development Tools
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Cypress Documentation](https://docs.cypress.io/)

---

This documentation provides a comprehensive overview of the Fluenccy application. For specific implementation details, refer to the source code and inline comments. For deployment and infrastructure details, see the deployment guides in the project root.

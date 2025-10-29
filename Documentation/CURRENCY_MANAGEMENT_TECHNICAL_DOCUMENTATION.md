# Currency Management Module - Technical Developer Documentation

## Overview
This document provides a comprehensive technical overview of the Currency Management module navigation flow, covering all steps from frontend user interaction to backend processing and data persistence.

## Table of Contents
1. [Module Architecture](#module-architecture)
2. [Navigation Flow](#navigation-flow)
3. [Frontend Components](#frontend-components)
4. [Backend API Endpoints](#backend-api-endpoints)
5. [Database Operations](#database-operations)
6. [Data Flow Diagrams](#data-flow-diagrams)
7. [Key Features](#key-features)
8. [Troubleshooting](#troubleshooting)

## Module Architecture

### Frontend Structure
```
src/client/domain/currency-management/
├── cm.routes.tsx                    # Route definitions
├── cm.layout.tsx                    # Layout wrapper with routing
├── pages/
│   └── cm.container.tsx             # Main container component
└── components/
    ├── header.component.tsx         # Tab navigation
    ├── currency-reserves.component.tsx # Currency selection
    ├── dashboard.component.tsx      # Dashboard view
    ├── unmanaged.component.tsx      # Unmanaged entries
    ├── managed.component.tsx        # Managed entries
    ├── dashboard-chart.component.tsx # Chart visualization
    └── pricing/                     # Pricing components
```

### Backend Structure
```
src/server/modules/cms/
├── cms.controller.ts                # Main controller
├── cms.route.ts                     # API routes
├── cms.db-getters.ts                # Database read operations
└── cms.db-updaters.ts               # Database write operations
```

## Navigation Flow

### 1. User Navigation to Currency Management

#### Step 1: Header Navigation Click
- **Location**: `src/client/domain/common/components/the-header-nav-links/the-header-nav-links.component.tsx`
- **Action**: User clicks "Currency Management" link
- **Route**: `/currency-management` (defined in `CURRENY_MANAGEMENT_ROUTES.root`)

```tsx
<HeaderNavLink className="ml-12 group" to={CURRENY_MANAGEMENT_ROUTES.root}>
  Currency Management
</HeaderNavLink>
```

#### Step 2: Route Resolution
- **Location**: `src/client/domain/currency-management/cm.layout.tsx`
- **Process**: React Router resolves the route and renders `CMPageContainer`

```tsx
<Route path={CURRENY_MANAGEMENT_ROUTES.root} component={CMPageContainer} exact />
```

### 2. Frontend Initialization

#### Step 3: Container Component Mount
- **Location**: `src/client/domain/currency-management/pages/cm.container.tsx`
- **Process**: `CMPageContainer` component mounts and initializes state

**Key State Variables:**
```tsx
const [list, setList] = useState([]);                    // Unmanaged entries
const [managedList, setManagedList] = useState([]);      // Managed entries
const [currency, setCurrency] = useState();             // Selected currency
const [selectedTab, setSelectedTab] = useState({ id: 'dashboard' });
const [entitlements, setEntitlements] = useState([]);   // Organization entitlements
const [liveData, setLiveData] = useState({});          // Live exchange rates
const [forwardPoints, setForwardPoints] = useState([]); // Forward points data
const [avgRates, setAvgRates] = useState({});           // Average rates
```

#### Step 4: Initial Data Loading
**Triggered by**: `useEffect` hooks when organization data is available

**API Calls Made:**
1. **Get Market Data**: `/api/cms/get-rates`
2. **Get Average Order Rates**: `/api/cms/get-avg-order-rate-by-date`
3. **Get Available Currencies**: `/api/cms/get-entitlement-currency`

```tsx
useEffect(() => {
  setFetchingCurrencies(true);
  getMxMarketData();
  getAvgOrderRates();
  setCurrency();
}, [organisation]);
```

### 3. Currency Selection Process

#### Step 5: Currency Reserves Component
- **Location**: `src/client/domain/currency-management/components/currency-reserves.component.tsx`
- **Process**: User selects a currency from dropdown

**API Call**: `/api/cms/get-entitlement-currency`
```tsx
const getAvailableCurrencies = async () => {
  const url = '/api/cms/get-entitlement-currency';
  const response = await axios.post(url, { 
    orgId: organisation?.id, 
    fetchEntryCount, 
    mode 
  });
  setAvailableCurrencies(response.data.data);
};
```

#### Step 6: Entry Data Loading
**Triggered by**: Currency selection change

**API Call**: `/api/cms/get-entries` (called twice - for managed and unmanaged)

```tsx
const getEntries = async (type = 'unmanaged') => {
  const url = `/api/cms/get-entries`;
  const response = await axios.post(url, {
    orgId: orgId,
    currencyCode: currency?.value,
    orgCurrency: organisation?.currency,
    type,
  });
  
  if (type === 'unmanaged') {
    setList(response.data.data.entries);
    setForwardPoints(response.data.data.forwardPoints);
  } else {
    setManagedList(response.data.data.entries);
    setManagedForwardPoints(response.data.data.forwardPoints);
  }
};
```

## Backend API Endpoints

### 1. Get Entries Endpoint
- **Route**: `POST /api/cms/get-entries`
- **Controller**: `CmsEntriesController.getEntries()`
- **Location**: `src/server/modules/cms/cms.controller.ts`

**Request Body:**
```json
{
  "orgId": "string",
  "currencyCode": "string", 
  "orgCurrency": "string",
  "type": "managed|unmanaged"
}
```

**Response:**
```json
{
  "data": {
    "entries": [...],
    "marginPercentage": [...],
    "forwardPoints": [...]
  }
}
```

**Database Operations:**
1. Query `crm_entries` table with filters
2. Query `crm_feedback` table for each entry
3. Query `forward_point` table for forward points
4. Query `org_entitlements` for margin percentage

### 2. Update Entry Endpoint
- **Route**: `POST /api/cms/update-entry`
- **Controller**: `CmsEntriesController.updateEntry()`

**Request Body:**
```json
{
  "orgId": "string",
  "id": "string",
  "params": {
    "manage_type": "string",
    "reservedMin": "number",
    "reservedMax": "number", 
    "reservedAmount": "number",
    "reservedRate": "number",
    "currentRate": "number",
    "isManaged": "boolean",
    "isApproved": "boolean",
    "totalReservedAmount": "number"
  }
}
```

**Database Operations:**
1. Update `crm_entries` table
2. Insert/Update `crm_feedback` table if approved

### 3. Get Rates Endpoint
- **Route**: `POST /api/cms/get-rates`
- **Controller**: `CmsEntriesController.getRates()`

**Process:**
1. Query `rate` table for last month's data
2. Retry up to 7 days if no data found
3. Format rates by currency pair

### 4. Get Average Order Rate Endpoint
- **Route**: `POST /api/cms/get-avg-order-rate-by-date`
- **Controller**: `CmsEntriesController.getAvgFeedbackRateByDate()`

**Process:**
1. Query `crm_feedback` table for average rates
2. Calculate weighted averages by currency
3. Return formatted rate data

## Database Operations

### Key Tables

#### 1. crm_entries
**Purpose**: Stores currency management entries
**Key Fields:**
- `id`: Primary key
- `orgId`: Organization ID
- `currencyCode`: Currency code
- `month`: Payment month
- `year`: Payment year
- `forecaseAmount`: Forecasted amount
- `budgetRate`: Budget exchange rate
- `isManaged`: Whether entry is managed
- `isApproved`: Whether entry is approved
- `reservedAmount`: Reserved amount
- `reservedMin`: Minimum reserved amount
- `reservedMax`: Maximum reserved amount

#### 2. crm_feedback
**Purpose**: Stores feedback and reserved rates
**Key Fields:**
- `id`: Primary key
- `crm_entry_id`: Foreign key to crm_entries
- `reservedAmount`: Reserved amount
- `reservedRate`: Reserved exchange rate
- `reservedDate`: Date of reservation
- `homeCurrencyAmount`: Amount in home currency

#### 3. forward_point
**Purpose**: Stores forward points data
**Key Fields:**
- `baseCurrency`: Base currency
- `tradeCurrency`: Trade currency
- `year`: Year
- `month`: Month
- `forwardPoints`: Forward points value

#### 4. rate
**Purpose**: Stores exchange rate data
**Key Fields:**
- `baseCurrency`: Base currency
- `tradeCurrency`: Trade currency
- `date`: Rate date
- `last`: Last exchange rate

### Database Service
- **Location**: `src/server/domain/common/services/db.service.ts`
- **Purpose**: Provides Knex.js database connection and query builder
- **Configuration**: PostgreSQL with SSL support for production

## Data Flow Diagrams

### 1. Initial Page Load Flow
```
User Click → Route Resolution → Component Mount → API Calls → Data Processing → UI Render
     ↓              ↓                ↓              ↓            ↓              ↓
Header Link → React Router → CMPageContainer → getRates() → State Update → Dashboard
```

### 2. Currency Selection Flow
```
Currency Select → API Call → Database Query → Response → State Update → Entry Loading
       ↓              ↓           ↓             ↓           ↓              ↓
Dropdown → getEntries() → crm_entries → JSON → setList() → getEntries() → UI Update
```

### 3. Data Update Flow
```
User Action → API Call → Database Update → Response → State Refresh → UI Update
     ↓           ↓            ↓              ↓            ↓              ↓
Button Click → updateEntry() → UPDATE SQL → Success → getEntries() → Re-render
```

## Key Features

### 1. Dashboard View
- **Component**: `dashboard.component.tsx`
- **Features**:
  - Chart visualization of managed vs unmanaged entries
  - Interactive bar charts with hover tooltips
  - Clickable bars for detailed view
  - Currency score breakdown

### 2. Plan View
- **Components**: `unmanaged.component.tsx`, `managed.component.tsx`
- **Features**:
  - List of unmanaged entries with action buttons
  - List of managed entries
  - Reserve amount editing
  - Forward/Plan/Remove actions

### 3. Currency Reserves
- **Component**: `currency-reserves.component.tsx`
- **Features**:
  - Currency selection dropdown with flags
  - Entitlement percentage editing
  - Month-based configuration
  - Real-time validation

### 4. Data Import
- **Integration**: Upload CSV functionality
- **Process**:
  - CSV file upload and parsing
  - Field mapping configuration
  - Data validation and preview
  - Batch import to crm_entries table

## Troubleshooting

### Common Issues

#### 1. Data Not Loading
**Symptoms**: Empty lists, loading spinners not stopping
**Causes**:
- Invalid organization ID
- Missing authentication token
- Database connection issues
- API endpoint errors

**Debug Steps**:
1. Check browser network tab for failed requests
2. Verify authentication token in localStorage
3. Check server logs for database errors
4. Validate API request/response format

#### 2. Currency Selection Issues
**Symptoms**: Dropdown not populating, selection not working
**Causes**:
- Missing organization entitlements
- Invalid currency codes
- API timeout

**Debug Steps**:
1. Check `/api/cms/get-entitlement-currency` response
2. Verify organization entitlements in database
3. Check currency constants in frontend

#### 3. Update Failures
**Symptoms**: Changes not saving, error messages
**Causes**:
- Validation errors
- Database constraint violations
- Missing required fields

**Debug Steps**:
1. Check request payload format
2. Verify database constraints
3. Check server validation logic

### Performance Considerations

#### 1. Database Optimization
- Index on `crm_entries(orgId, currencyCode)`
- Index on `crm_feedback(crm_entry_id)`
- Index on `rate(baseCurrency, tradeCurrency, date)`

#### 2. Frontend Optimization
- Memoized calculations for formatted lists
- Debounced API calls for real-time updates
- Lazy loading of chart components

#### 3. Caching Strategy
- Cache exchange rates for 5 minutes
- Cache organization entitlements
- Cache forward points data

## Security Considerations

### 1. Authentication
- All API endpoints require valid Firebase token
- Token validation in `getSessionUser()` method
- Automatic redirect to login on token expiry

### 2. Authorization
- Organization-based data isolation
- User can only access their organization's data
- Role-based permissions for different actions

### 3. Data Validation
- Server-side validation of all inputs
- SQL injection prevention via parameterized queries
- XSS protection in frontend rendering

## Conclusion

The Currency Management module provides a comprehensive solution for managing currency exposures and hedging strategies. The architecture follows a clear separation of concerns with React frontend components, Express.js backend APIs, and PostgreSQL database storage. The module supports real-time data updates, interactive visualizations, and robust error handling.

For developers working on this module, understanding the data flow from user interaction through API calls to database operations is crucial for effective debugging and feature development.

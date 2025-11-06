# Fluenccy Frontend - Techno-Functional Documentation

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Core Architectural Patterns](#core-architectural-patterns)
6. [Component Architecture](#component-architecture)
7. [State Management](#state-management)
8. [GraphQL Integration](#graphql-integration)
9. [Routing Architecture](#routing-architecture)
10. [Authentication Flow](#authentication-flow)
11. [Styling System](#styling-system)
12. [Common Services & Hooks](#common-services--hooks)
13. [Domain Modules](#domain-modules)
14. [Development Workflow](#development-workflow)
15. [Common Patterns & Conventions](#common-patterns--conventions)
16. [Performance Optimization](#performance-optimization)
17. [Troubleshooting Guide](#troubleshooting-guide)

---

## Executive Summary

The **Fluenccy Frontend** is a React-based Single Page Application (SPA) that provides a comprehensive interface for managing currency hedging operations. The application integrates with the backend GraphQL API and provides real-time data visualization, invoice management, payment tracking, and hedging plan creation.

### Key Features
- **Multi-tenant Organization Management**: Switch between organizations, manage Xero connections
- **Real-time Data Visualization**: Charts and graphs for currency rates, payments, and performance
- **Invoice & Payment Management**: View and manage invoices and payments from Xero
- **Hedging Plan Builder**: Create and manage currency hedging strategies
- **Currency Score Analysis**: Visualize currency risk scores and performance metrics
- **CSV Upload**: Import financial data via CSV files
- **Admin Dashboard**: Administrative interface for managing organizations and users

### Technical Highlights
- **React 17** with TypeScript for type safety
- **Apollo Client** for GraphQL data fetching and caching
- **React Router** for client-side routing
- **Tailwind CSS** for utility-first styling
- **Firebase Authentication** for user management
- **Modular Domain-Driven Architecture** for scalability

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Browser (Client)                            │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              React Application (SPA)                      │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │  │
│  │  │   Providers  │  │   Routes     │  │  Components  │   │  │
│  │  │  (Context)    │  │  (Router)    │  │  (UI/Logic)  │   │  │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │  │
│  │         │                  │                 │            │  │
│  │         └──────────────────┼─────────────────┘            │  │
│  │                            │                               │  │
│  │  ┌─────────────────────────▼──────────────────────────┐   │  │
│  │  │         Apollo Client (GraphQL)                    │   │  │
│  │  │  ┌──────────────┐  ┌──────────────┐               │   │  │
│  │  │  │   Cache      │  │   Links      │               │   │  │
│  │  │  │  (InMemory)  │  │  (HTTP/Auth) │               │   │  │
│  │  │  └──────────────┘  └──────────────┘               │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  │                            │                               │  │
│  │  ┌─────────────────────────▼──────────────────────────┐   │  │
│  │  │         Local State Management                   │   │  │
│  │  │  ┌──────────────┐  ┌──────────────┐             │   │  │
│  │  │  │ React State  │  │ Local Storage│             │   │  │
│  │  │  │  (useState)  │  │  (Cookies)   │             │   │  │
│  │  │  └──────────────┘  └──────────────┘             │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                     │
│                            │ HTTP/GraphQL                        │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend API Server                            │
│              (GraphQL + REST Endpoints)                         │
└─────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
App (Root)
├── Providers
│   ├── CookiesProvider
│   ├── BrowserRouter
│   ├── ApolloProvider
│   ├── IntercomProvider
│   ├── ToastProvider
│   ├── ModalProvider
│   └── AuthProvider
│
└── Routes
    ├── AuthRoute (Login, Signup, etc.)
    ├── AdminRoute (Admin dashboard)
    ├── OnboardingRoute (Onboarding flow)
    └── AppRoute (Main application)
        ├── DashboardLayout
        ├── ChartLayout
        ├── PlanLayout
        ├── OrganisationLayout
        └── ... (other feature layouts)
```

---

## Technology Stack

### Core Framework
- **React 17.0.1**: UI library
- **TypeScript 4.1.3**: Type-safe JavaScript
- **React DOM 17.0.1**: React rendering

### Routing
- **React Router DOM 5.2.0**: Client-side routing

### Data Fetching
- **Apollo Client 3.3.7**: GraphQL client
- **apollo-upload-client 16.0.0**: File upload support
- **cross-fetch 3.0.6**: Fetch API polyfill

### State Management
- **Apollo Client Cache**: GraphQL data caching
- **React Context API**: Global state (Auth, etc.)
- **React Hooks**: Local component state

### Styling
- **Tailwind CSS 2.0.3**: Utility-first CSS framework
- **@tailwindcss/ui 0.7.2**: Tailwind UI components
- **Styled Components 5.3.3**: CSS-in-JS (limited use)
- **Less 4.1.2**: CSS preprocessor (legacy)

### UI Components & Libraries
- **Framer Motion 4.1.11**: Animation library
- **Victory 35.4.8**: Data visualization charts
- **React Beautiful DnD 13.1.0**: Drag and drop
- **React Data Table Component 7.4.4**: Data tables
- **React Datepicker 4.14.1**: Date selection
- **React Select 5.2.2**: Select dropdowns
- **React Dropzone 11.4.2**: File uploads
- **React Tooltip 4.2.21**: Tooltips
- **Lottie React 2.1.0**: Lottie animations

### Authentication
- **Firebase 8.2.3**: Authentication SDK
- **react-cookie 4.0.3**: Cookie management
- **jwt-decode 3.1.2**: JWT token decoding

### Utilities
- **Lodash 4.17.20**: Utility functions
- **date-fns 2.23.0**: Date manipulation
- **Numeral 2.0.6**: Number formatting
- **Moment 2.29.1**: Date/time handling (legacy)
- **Classnames 2.2.6**: Conditional CSS classes
- **Axios 0.23.0**: HTTP client (for REST APIs)

### Analytics & Monitoring
- **analytics-node 4.0.1**: Analytics (Segment)
- **mixpanel-browser 2.41.0**: Mixpanel analytics
- **react-use-intercom 1.3.0**: Intercom integration

### Development Tools
- **Webpack 4.46.0**: Module bundler
- **Babel**: JavaScript/TypeScript transpilation
- **ESLint**: Code linting
- **Jest**: Testing framework
- **Cypress 6.8.0**: E2E testing
- **Storybook**: Component development

---

## Project Structure

### Frontend Directory Structure

```
src/client/
├── app.tsx                    # Main App component (route switching)
├── client.tsx                 # Application entry point (providers setup)
├── index.html                 # HTML template
│
├── domain/                    # Feature-based domain modules
│   ├── account/              # Account management
│   │   ├── account.constant.ts       # Route constants
│   │   ├── account.layout.tsx        # Layout component
│   │   ├── account.routes.ts         # Route definitions
│   │   ├── components/              # Domain components
│   │   ├── graphql/                 # GraphQL queries/mutations
│   │   │   ├── query-account.graphql.ts
│   │   │   ├── use-mutation-account.graphql.ts
│   │   │   └── use-query-local-account.graphql.ts
│   │   ├── pages/                   # Page components
│   │   └── index.ts                 # Public exports
│   │
│   ├── admin/                # Admin interface
│   ├── auth/                 # Authentication
│   │   ├── auth.context.tsx         # Auth context provider
│   │   ├── auth.service.ts          # Firebase auth service
│   │   ├── auth.routes.ts            # Auth routes
│   │   └── ...
│   │
│   ├── app/                  # App-level components
│   ├── chart/                # Data visualization
│   ├── common/               # Shared components & utilities
│   │   ├── components/              # Reusable UI components
│   │   │   ├── button/
│   │   │   ├── input/
│   │   │   ├── select/
│   │   │   ├── table/
│   │   │   └── ...
│   │   ├── containers/              # Container components
│   │   ├── hooks/                   # Shared hooks
│   │   │   ├── use-analytics.hook.ts
│   │   │   ├── use-toast.hook.ts
│   │   │   └── ...
│   │   ├── services/               # Common services
│   │   │   ├── apollo.service.ts
│   │   │   ├── analytics.service.ts
│   │   │   ├── local-storage.service.ts
│   │   │   └── ...
│   │   ├── constants/              # Application constants
│   │   └── pages/                   # Common pages (404, 500)
│   │
│   ├── dashboard/            # Dashboard
│   ├── organisation/         # Organization management
│   ├── plan/                 # Hedging plans
│   ├── chart/                # Charts and graphs
│   ├── currency-score/       # Currency scoring
│   ├── upload-csv/           # CSV upload
│   ├── onboarding/          # Onboarding flow
│   └── ...
│
├── assets/                   # Static assets
│   ├── fonts/               # Font files
│   ├── images/              # Image files
│   ├── svg/                # SVG icons
│   └── static/             # Static files (favicon, etc.)
│
├── styles/                   # Global styles
│   ├── base.css            # Base styles
│   ├── fluenccy.css        # Application styles
│   ├── font.css            # Font definitions
│   └── vendor.css          # Third-party styles
│
└── test/                    # Test utilities
    ├── index.ts
    └── mock-auth-provider.component.tsx
```

### Domain Module Structure

Each domain module follows a consistent structure:

```
domain-name/
├── {domain}.constant.ts          # Route/constant definitions
├── {domain}.layout.tsx           # Layout component (wraps routes)
├── {domain}.routes.tsx           # Route definitions
├── components/                   # Domain-specific components
│   ├── component-name/
│   │   ├── component-name.component.tsx
│   │   ├── component-name.stories.tsx (Storybook)
│   │   └── index.ts
│   └── index.ts
├── graphql/                      # GraphQL operations
│   ├── query-{name}.graphql.ts
│   ├── use-mutation-{name}.graphql.ts
│   ├── use-query-local-{name}.graphql.ts
│   └── index.ts
├── hooks/                        # Domain-specific hooks
│   └── use-{name}.hook.ts
├── pages/                        # Page components
│   ├── {name}.page.tsx
│   └── index.ts
├── services/                     # Domain services (optional)
│   └── {name}.service.ts
└── index.ts                      # Public exports
```

---

## Core Architectural Patterns

### 1. Domain-Driven Design (DDD)

The frontend follows a **Domain-Driven Design** approach where features are organized by business domain (account, organisation, plan, chart, etc.). Each domain is self-contained with its own components, GraphQL operations, hooks, and pages.

**Benefits:**
- Clear feature boundaries
- Easy to locate code
- Scalable architecture
- Team collaboration

### 2. Component Composition

Components are built using **composition patterns**:
- **Presentational Components**: Pure UI components (Button, Input, Table)
- **Container Components**: Components that manage state and data fetching
- **Layout Components**: Components that structure page layout
- **Page Components**: Top-level route components

### 3. Hook-Based Architecture

**Custom hooks** encapsulate reusable logic:
- Data fetching hooks (`useQueryLocalUser`, `useQueryLocalOrganisation`)
- Business logic hooks (`useAnalytics`, `useToast`, `useModal`)
- Domain-specific hooks (`useIsOrganisationTokenInactive`)

### 4. Provider Pattern

**Context providers** manage global state:
- `AuthProvider`: Authentication state
- `ToastProvider`: Toast notifications
- `ModalProvider`: Modal dialogs
- `ApolloProvider`: GraphQL client

### 5. Route-Based Code Splitting

Routes are organized by domain, enabling:
- Lazy loading of route components
- Clear navigation structure
- Feature-based code organization

---

## Component Architecture

### Component Types

#### 1. Presentational Components

**Purpose**: Pure UI components with no business logic

**Example:**
```typescript
// button.component.tsx
type Props = {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
};

export const Button = ({ children, onClick, disabled, className }: Props) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn('px-4 py-2 rounded', className)}
    >
      {children}
    </button>
  );
};
```

**Characteristics:**
- Receive data via props
- No internal state (or minimal UI state)
- Reusable across domains
- Located in `common/components/`

#### 2. Container Components

**Purpose**: Components that manage state and data fetching

**Example:**
```typescript
// dashboard-container.component.tsx
export const DashboardContainer = () => {
  const { user } = useQueryLocalUser();
  const { organisation } = useQueryLocalOrganisation();
  const { data, loading } = useQuery(GET_DASHBOARD_DATA);

  if (loading) return <Loader />;
  if (!data) return <Error />;

  return <DashboardView data={data} user={user} organisation={organisation} />;
};
```

**Characteristics:**
- Fetch data (GraphQL, REST)
- Manage component state
- Handle business logic
- Pass data to presentational components

#### 3. Layout Components

**Purpose**: Structure page layout and routing

**Example:**
```typescript
// dashboard.layout.tsx
export const DashboardLayout = memo(() => {
  return (
    <Switch>
      <Route path={DASHBOARD_ROUTES.root} component={DashboardPage} exact />
      <Redirect to={DASHBOARD_ROUTES.root} />
    </Switch>
  );
});
```

**Characteristics:**
- Define route structure
- Wrap pages with layout
- Handle navigation

#### 4. Page Components

**Purpose**: Top-level route components

**Example:**
```typescript
// dashboard.page.tsx
export const DashboardPage = memo(() => {
  return (
    <Page>
      <PageContent>
        <DashboardContainer />
      </PageContent>
    </Page>
  );
});
```

**Characteristics:**
- Top-level route handlers
- Minimal logic (delegate to containers)
- Use layout components (Page, PageContent)

### Component Patterns

#### Memoization Pattern

**Usage**: Prevent unnecessary re-renders

```typescript
export const MyComponent = memo(({ data }: Props) => {
  // Component implementation
});
```

#### Conditional Rendering Pattern

```typescript
{loading ? (
  <Loader />
) : error ? (
  <ErrorPanel error={error} />
) : (
  <DataView data={data} />
)}
```

#### Controlled Components Pattern

```typescript
const [value, setValue] = useState('');

<input
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

---

## State Management

### 1. Apollo Client Cache

**Purpose**: GraphQL data caching and state management

**Setup** (`apollo.service.ts`):
```typescript
export const apolloCache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        ...userQueryFields,
        ...organisationQueryFields,
        // ... other local fields
      },
    },
  },
});

export const apolloService = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: apolloCache,
});
```

**Local State Management**:
```typescript
// use-query-local-user.graphql.ts
export const userVar = makeVar<LocalUserType | null>(null);

export const userQueryFields = {
  localUser: {
    read: () => userVar(),
  },
};

// Usage
const { data } = useQuery<LocalQuery>(QUERY_LOCAL_USER);
const user = data?.localUser;
```

**Cache Updates**:
```typescript
// Update local state
userVar(newUser);

// Clear cache
await apolloService.clearStore();
```

### 2. React Context API

**Purpose**: Global application state

**Auth Context Example**:
```typescript
// auth.context.tsx
export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [token, setToken] = useState(null);

  // ... auth logic

  return (
    <AuthContext.Provider value={{ firebaseUser, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Usage
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### 3. React Hooks (Local State)

**Purpose**: Component-level state

```typescript
const [state, setState] = useState(initialValue);
const [data, setData] = useState<DataType | null>(null);
```

### 4. Local Storage & Cookies

**Purpose**: Persist data across sessions

```typescript
// Local Storage
localStorageService.setItem('key', value);
const value = localStorageService.getItem('key');

// Cookies
const { setCookie, getCookie } = useCookies();
setCookie('key', value);
```

---

## GraphQL Integration

### Apollo Client Setup

**Configuration** (`apollo.service.ts`):
```typescript
// HTTP Link
const httpLink = new HttpLink({
  uri: '/graphql',
  fetch,
});

// Upload Link (for file uploads)
const uploadLink = createUploadLink({ uri: '/graphql' });

// Auth Link (adds token to headers)
const authLink = setContext((_, { headers }) => {
  const token = localStorageService.getItem('firebase-token');
  return {
    headers: {
      ...headers,
      authorization: token || '',
    },
  };
});

// Apollo Client
export const apolloService = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: apolloCache,
});
```

### Query Pattern

**1. Define GraphQL Query**:
```typescript
// query-user.graphql.ts
import { gql } from '@apollo/client';

export const QUERY_USER = gql`
  query User {
    user {
      id
      firstName
      lastName
      role
    }
  }
`;
```

**2. Create Hook**:
```typescript
// use-query-user.graphql.ts
import { useQuery } from '@apollo/client';
import { QUERY_USER } from './query-user.graphql';
import { GqlUserQuery } from '@graphql';

export const useQueryUser = () => {
  const { data, loading, error } = useQuery<GqlUserQuery>(QUERY_USER);

  return {
    user: data?.user || null,
    loading,
    error,
  };
};
```

**3. Use in Component**:
```typescript
const { user, loading, error } = useQueryUser();

if (loading) return <Loader />;
if (error) return <ErrorPanel error={error} />;

return <div>{user.firstName}</div>;
```

### Mutation Pattern

**1. Define GraphQL Mutation**:
```typescript
// mutation-sign-up.graphql.ts
const MUTATION_SIGN_UP = gql`
  mutation SignUp($input: SignUpInput!) {
    signUp(input: $input) {
      firstName
      lastName
    }
  }
`;
```

**2. Create Hook**:
```typescript
// use-mutation-account.graphql.ts
export const useMutationAccount = () => {
  const [signUp, { loading, error }] = useMutation<
    GqlSignUpMutation,
    GqlSignUpMutationVariables
  >(MUTATION_SIGN_UP);

  return { signUp, loading, error };
};
```

**3. Use in Component**:
```typescript
const { signUp, loading } = useMutationAccount();

const handleSubmit = async (formData) => {
  try {
    await signUp({ variables: { input: formData } });
    // Handle success
  } catch (error) {
    // Handle error
  }
};
```

### Local State Queries

**Purpose**: Manage client-side state with GraphQL

**Setup**:
```typescript
// use-query-local-user.graphql.ts
export const userVar = makeVar<LocalUserType | null>(null);

export const QUERY_LOCAL_USER = gql`
  query LocalUser {
    localUser @client
  }
`;

export const userQueryFields = {
  localUser: {
    read: () => userVar(),
  },
};

// Usage
const { data } = useQuery<LocalQuery>(QUERY_LOCAL_USER);
const user = data?.localUser;

// Update
userVar(newUser);
```

### Cache Management

**Clear Cache**:
```typescript
export const clearLocalApolloCache = async () => {
  await apolloService.clearStore();
  clearLocalAccount();
  clearLocalAdmin();
  // ... clear other local vars
};
```

**Refetch Queries**:
```typescript
const { refetch } = useQuery(QUERY_USER);

// Refetch on demand
await refetch();
```

---

## Routing Architecture

### Route Structure

**Main Routes** (`app.tsx`):
```typescript
<Switch>
  <Route path={COMMON_ROUTE.error} component={FiveHundredPage} exact />
  {map(AUTH_ROUTES, (route) => (
    <AuthRoute key={route} path={route} component={AuthLayout} exact />
  ))}
  <AdminRoute path={ADMIN_ROUTES.root} component={AdminLayout} />
  <OnboardingRoute path={ONBOARDING_ROUTES.root} component={OnboardingLayout} />
  <AppRoute path="/" component={AppLayout} />
</Switch>
```

### Route Types

#### 1. Auth Routes

**Purpose**: Authentication pages (login, signup, etc.)

**Definition**:
```typescript
// auth.routes.ts
export const AUTH_ROUTES = {
  login: '/login',
  signUp: '/sign-up',
  forgotPassword: '/forgot-password',
  twoFactor: '/2-factor-auth',
  logout: '/logout',
};
```

**Route Component**:
```typescript
// AuthRoute checks authentication
export const AuthRoute = ({ component: Component, ...rest }) => {
  const { isAuthenticated, isAuthenticating } = useAuth();

  if (isAuthenticating) return <Loader />;
  if (isAuthenticated) return <Redirect to={DASHBOARD_ROUTES.root} />;

  return <Route {...rest} component={Component} />;
};
```

#### 2. App Routes

**Purpose**: Main application routes (protected)

**Layout** (`app.layout.tsx`):
```typescript
export const AppLayout = memo(() => {
  return (
    <>
      <TheHeader />
      <Switch>
        <Route path={DASHBOARD_ROUTES.root} component={DashboardLayout} />
        <Route path={CHART_ROUTES.root} component={ChartLayout} />
        <Route path={PLAN_ROUTES.root} component={PlanLayout} />
        <Route path={ORGANISATION_ROUTES.root} component={OrganisationLayout} />
        {/* ... other routes */}
        <Redirect from="/" to={DASHBOARD_ROUTES.root} exact />
        <Route component={FourOhFourPage} />
      </Switch>
    </>
  );
});
```

**Route Component**:
```typescript
// AppRoute checks authentication
export const AppRoute = ({ component: Component, ...rest }) => {
  const { isAuthenticated, isAuthenticating } = useAuth();

  if (isAuthenticating) return <Loader />;
  if (!isAuthenticated) return <Redirect to={AUTH_ROUTES.login} />;

  return <Route {...rest} component={Component} />;
};
```

#### 3. Admin Routes

**Purpose**: Admin-only routes

**Route Component**:
```typescript
// AdminRoute checks admin role
export const AdminRoute = ({ component: Component, ...rest }) => {
  const { user } = useQueryLocalUser();
  const { isAuthenticated, isAuthenticating } = useAuth();

  if (isAuthenticating) return <Loader />;
  if (!isAuthenticated) return <Redirect to={AUTH_ROUTES.login} />;
  if (user?.role !== 'superuser') return <Redirect to={DASHBOARD_ROUTES.root} />;

  return <Route {...rest} component={Component} />;
};
```

### Navigation

**Programmatic Navigation**:
```typescript
import { useHistory } from 'react-router-dom';

const history = useHistory();

// Navigate
history.push('/dashboard');

// Navigate with state
history.push({
  pathname: '/dashboard',
  state: { from: 'login' }
});

// Go back
history.goBack();
```

**Link Component**:
```typescript
import { Link } from 'react-router-dom';

<Link to="/dashboard">Dashboard</Link>
```

---

## Authentication Flow

### Authentication Architecture

**Providers** (`client.tsx`):
```typescript
<AuthProvider>
  <App />
</AuthProvider>
```

**Auth Context** (`auth.context.tsx`):
```typescript
export const AuthProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  // Listen to auth state changes
  useEffect(() => {
    authService.onAuthStateChanged(async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      if (firebaseUser) {
        setToken(await firebaseUser.getIdToken());
      } else {
        setToken(null);
      }
      setIsAuthenticating(false);
    });

    // Listen to token refresh
    authService.onIdTokenChanged(async () => {
      if (firebaseUser) {
        setToken(await firebaseUser.getIdToken());
      }
    });
  }, []);

  // Store token in localStorage and cookies
  useEffect(() => {
    if (token) {
      setCookie('firebase-token', token);
      localStorageService.setItem('firebase-token', token);
    } else {
      removeCookie('firebase-token');
      localStorageService.removeItem('firebase-token');
    }
  }, [token]);

  // Login function
  const login = async (email: string, password: string) => {
    const firebaseUser = await authService.signInWithEmailAndPassword(email, password);
    setFirebaseUser(firebaseUser);
    setToken(await firebaseUser.getIdToken());
  };

  // Logout function
  const logout = async () => {
    await clearLocalApolloCache();
    await authService.signOut();
  };

  return (
    <AuthContext.Provider value={{ firebaseUser, token, login, logout, isAuthenticated, isAuthenticating }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Login Flow

**1. User submits login form**:
```typescript
const handleSubmit = async (event: FormEvent) => {
  event.preventDefault();
  try {
    await login(formData.email, formData.password);
    history.push({ pathname: AUTH_ROUTES.twoFactor, state: { email: formData.email } });
  } catch (error) {
    setFormError('Email or password are incorrect.');
  }
};
```

**2. Firebase authenticates**:
- Firebase validates credentials
- Returns Firebase user object
- Generates JWT token

**3. Token stored**:
- Token stored in `AuthContext` state
- Token stored in `localStorage`
- Token stored in cookies
- Token added to Apollo Client auth link

**4. User redirected**:
- To two-factor auth page (if enabled)
- Or to dashboard

### Token Management

**Token in GraphQL Requests**:
```typescript
// apollo.service.ts
const authLink = setContext((_, { headers }) => {
  const token = localStorageService.getItem('firebase-token');
  return {
    headers: {
      ...headers,
      authorization: token || '',
    },
  };
});
```

**Token Refresh**:
- Firebase automatically refreshes tokens
- `onIdTokenChanged` listener updates token in state
- Token updated in localStorage and cookies

### Protected Routes

**Route Protection**:
```typescript
export const AppRoute = ({ component: Component, ...rest }) => {
  const { isAuthenticated, isAuthenticating } = useAuth();

  if (isAuthenticating) return <Loader />;
  if (!isAuthenticated) return <Redirect to={AUTH_ROUTES.login} />;

  return <Route {...rest} component={Component} />;
};
```

---

## Styling System

### Tailwind CSS

**Configuration** (`tailwind.config.js`):
```javascript
module.exports = {
  theme: {
    screen: TAILWIND_THEME.screens,
    colors: TAILWIND_THEME.colors,
    fontFamily: {
      sans: [TAILWIND_THEME.fontFamily.sans, ...defaultConfig.theme.fontFamily.sans],
      mono: [TAILWIND_THEME.fontFamily.mono, ...defaultConfig.theme.fontFamily.mono],
    },
    extend: {
      ...TAILWIND_THEME.extend,
    },
  },
  variants: {
    extend: {
      backgroundColor: ['active', 'checked'],
      // ... other variants
    },
  },
  plugins: [require('@tailwindcss/ui')],
};
```

**Theme Constants** (`tailwind.constant.ts`):
- Colors, fonts, spacing, breakpoints defined in constants
- Centralized theme management

**Usage**:
```typescript
<div className="w-full px-4 py-2 bg-blue-500 text-white rounded">
  Content
</div>
```

### CSS Modules

**Global Styles**:
- `base.css`: Base styles
- `fluenccy.css`: Application-specific styles
- `font.css`: Font definitions
- `vendor.css`: Third-party styles

**Import in Components**:
```typescript
import './component-name.css';
```

### Classnames Utility

**Conditional Classes**:
```typescript
import cn from 'classnames';

const classes = cn('base-class', {
  'active-class': isActive,
  'disabled-class': isDisabled,
});
```

---

## Common Services & Hooks

### Services

#### 1. Apollo Service (`apollo.service.ts`)

**Purpose**: GraphQL client configuration

**Key Exports**:
- `apolloService`: Apollo Client instance
- `apolloCache`: In-memory cache
- `clearLocalApolloCache()`: Clear cache function

#### 2. Analytics Service (`analytics.service.ts`)

**Purpose**: Analytics tracking (Segment, Mixpanel)

**Usage**:
```typescript
const { track, page, identify } = useAnalytics();

track('event_name', { property: 'value' });
page();
identify({ userId, name, email });
```

#### 3. Local Storage Service (`local-storage.service.ts`)

**Purpose**: LocalStorage wrapper

**Usage**:
```typescript
localStorageService.setItem('key', value);
const value = localStorageService.getItem('key');
localStorageService.removeItem('key');
```

#### 4. Util Service (`util.service.ts`)

**Purpose**: Utility functions

**Key Methods**:
- `formatCurrencyAmount(amount, currency)`: Format currency
- `formatRateAmount(amount, currency)`: Format exchange rate
- `isValidEmail(email)`: Validate email
- `getUrlSearchParamByKey(key)`: Get URL param

#### 5. Firebase Service (`firebase.service.ts`)

**Purpose**: Firebase initialization

**Usage**:
```typescript
// Initialized in auth.service.ts
```

### Hooks

#### 1. useAuth Hook

**Purpose**: Access authentication state

**Usage**:
```typescript
const { firebaseUser, isAuthenticated, login, logout, token } = useAuth();
```

#### 2. useAnalytics Hook

**Purpose**: Analytics tracking

**Usage**:
```typescript
const { track, page, identify } = useAnalytics();
```

#### 3. useToast Hook

**Purpose**: Show toast notifications

**Usage**:
```typescript
const { addToast } = useToast();

addToast({ message: 'Success!', type: 'success' });
```

#### 4. useModal Hook

**Purpose**: Manage modal dialogs

**Usage**:
```typescript
const { openModal, closeModal, setWidth } = useModal();

openModal(<MyModalComponent />);
```

#### 5. useCookies Hook

**Purpose**: Cookie management

**Usage**:
```typescript
const { setCookie, getCookie, removeCookie } = useCookies();

setCookie('key', value);
const value = getCookie('key');
```

#### 6. GraphQL Hooks

**Query Hooks**:
```typescript
const { user, loading, error } = useQueryLocalUser();
const { organisation, loading } = useQueryLocalOrganisation();
```

**Mutation Hooks**:
```typescript
const { signUp, loading, error } = useMutationAccount();
```

---

## Domain Modules

### Key Domains

#### 1. Auth Domain (`src/client/domain/auth/`)

**Purpose**: Authentication and user management

**Components**:
- Login page
- Signup page
- Forgot password page
- Two-factor auth page

**Services**:
- `auth.service.ts`: Firebase auth operations
- `auth.context.tsx`: Auth context provider

#### 2. Dashboard Domain (`src/client/domain/dashboard/`)

**Purpose**: Main dashboard view

**Components**:
- Dashboard page
- Dashboard widgets
- Summary cards

#### 3. Organisation Domain (`src/client/domain/organisation/`)

**Purpose**: Organization management

**Components**:
- Organization select page
- Organization details
- Xero connection status

**GraphQL**:
- `query-organisation-by-id.graphql.ts`
- `mutation-update-organisation.graphql.ts`

#### 4. Plan Domain (`src/client/domain/plan/`)

**Purpose**: Hedging plan management

**Components**:
- Plan builder
- Plan table
- Invoice management
- IMS (Invoice Management System) components

**Features**:
- Invoice selection
- Hedging calculations
- Schedule management

#### 5. Chart Domain (`src/client/domain/chart/`)

**Purpose**: Data visualization

**Components**:
- Rate charts
- Payment charts
- Performance charts

**Libraries**:
- Victory charts
- Custom chart components

#### 6. Upload CSV Domain (`src/client/domain/upload-csv/`)

**Purpose**: CSV file upload and processing

**Components**:
- File upload component
- Upload progress
- Data preview

**Features**:
- Drag-and-drop upload
- File validation
- Progress tracking

#### 7. Currency Score Domain (`src/client/domain/currency-score/`)

**Purpose**: Currency risk scoring

**Components**:
- Score visualization
- Breakdown charts
- Performance metrics

#### 8. Admin Domain (`src/client/domain/admin/`)

**Purpose**: Administrative interface

**Components**:
- Organization management
- User management
- Entitlement management
- CMS interface

**Features**:
- Organization CRUD
- User invitations
- Entitlement configuration

---

## Development Workflow

### Local Development Setup

**1. Prerequisites**:
```bash
# Node.js 14.21.3
# Yarn package manager
```

**2. Install Dependencies**:
```bash
yarn install
```

**3. Environment Setup**:
```bash
# Create .env file with required variables
FIREBASE_API_KEY=your_key
FIREBASE_AUTH_DOMAIN=your_domain
# ... other env vars
```

**4. Start Development Server**:
```bash
# Terminal 1: Start backend
yarn dev:server

# Terminal 2: Start frontend
yarn dev:client
```

**5. Access Application**:
- Frontend: `http://localhost:3000` (or configured port)
- Backend: `http://localhost:3001`

### Build Process

**Development Build**:
```bash
yarn dev:client
```

**Production Build**:
```bash
yarn build:client
```

**Build Output**:
- Compiled JavaScript: `web/`
- Static assets: `web/`
- Styles: `web/fluenccy.css`

### GraphQL Code Generation

**Generate Types**:
```bash
yarn gql
```

**Process**:
1. Generate schema from backend
2. Generate TypeScript types
3. Update `src/graphql-codegen.ts`

### Testing

**Unit Tests**:
```bash
yarn test:client
```

**E2E Tests**:
```bash
yarn test:cypress
```

**Component Tests** (Storybook):
```bash
yarn storybook
```

---

## Common Patterns & Conventions

### Naming Conventions

**Files**:
- Components: `{name}.component.tsx`
- Pages: `{name}.page.tsx`
- Hooks: `use-{name}.hook.ts`
- Services: `{name}.service.ts`
- GraphQL: `{operation}-{name}.graphql.ts`
- Constants: `{name}.constant.ts`

**Components**:
- PascalCase: `Button`, `DashboardPage`
- Descriptive names: `UserProfileCard`, `InvoiceTableRow`

**Hooks**:
- Prefix with `use`: `useAuth`, `useQueryLocalUser`
- Descriptive names: `useIsOrganisationTokenInactive`

**Variables**:
- camelCase: `userData`, `isLoading`
- Boolean prefixes: `is`, `has`, `should`

### Code Organization

**Import Order**:
```typescript
// 1. React and React-related
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

// 2. Third-party libraries
import cn from 'classnames';
import { map } from 'lodash';

// 3. GraphQL types
import { GqlUser, GqlOrganisation } from '@graphql';

// 4. Client domain imports
import { useAuth } from '@client/auth';
import { useQueryLocalUser } from '@client/user';
import { Button, Input } from '@client/common';

// 5. Assets
import LogoSvg from '@assets/svg/logo.svg';

// 6. Styles (if needed)
import './component.css';
```

**Component Structure**:
```typescript
// 1. Imports
import React, { useState } from 'react';

// 2. Types
type Props = {
  data: DataType;
  onAction: () => void;
};

// 3. Component
export const MyComponent = memo(({ data, onAction }: Props) => {
  // 4. Hooks
  const [state, setState] = useState();
  const { user } = useQueryLocalUser();

  // 5. Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);

  // 6. Handlers
  const handleClick = () => {
    onAction();
  };

  // 7. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
});
```

### Error Handling

**GraphQL Errors**:
```typescript
const { data, loading, error } = useQuery(QUERY);

if (loading) return <Loader />;
if (error) return <ErrorPanel error={error} />;
if (!data) return <EmptyState />;

return <DataView data={data} />;
```

**Try-Catch Pattern**:
```typescript
const handleSubmit = async () => {
  try {
    setIsSaving(true);
    await mutation({ variables: { input } });
    // Success handling
  } catch (error) {
    setFormError(error.message);
  } finally {
    setIsSaving(false);
  }
};
```

### Loading States

**Loading Pattern**:
```typescript
const { data, loading } = useQuery(QUERY);

if (loading) {
  return <Loader />;
}

return <Content data={data} />;
```

**Skeleton Loading**:
```typescript
{loading ? (
  <TableSkeleton />
) : (
  <Table data={data} />
)}
```

### Form Handling

**Controlled Components**:
```typescript
const [formData, setFormData] = useState({
  email: '',
  password: '',
});

const handleChange = (field: string, value: string) => {
  setFormData(prev => ({ ...prev, [field]: value }));
};

<input
  value={formData.email}
  onChange={(e) => handleChange('email', e.target.value)}
/>
```

**Form Submission**:
```typescript
const handleSubmit = async (event: FormEvent) => {
  event.preventDefault();
  try {
    await mutation({ variables: { input: formData } });
  } catch (error) {
    setFormError(error.message);
  }
};
```

---

## Performance Optimization

### Code Splitting

**Route-Based Splitting**:
- Routes are organized by domain
- Each route can be lazy-loaded

**Component Lazy Loading**:
```typescript
const LazyComponent = React.lazy(() => import('./component'));

<Suspense fallback={<Loader />}>
  <LazyComponent />
</Suspense>
```

### Memoization

**Component Memoization**:
```typescript
export const MyComponent = memo(({ data }: Props) => {
  // Component implementation
});
```

**Callback Memoization**:
```typescript
const handleClick = useCallback(() => {
  // Handler logic
}, [dependencies]);
```

**Value Memoization**:
```typescript
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);
```

### Apollo Cache Optimization

**Cache Policies**:
```typescript
const { data } = useQuery(QUERY, {
  fetchPolicy: 'cache-first', // or 'network-only', 'cache-and-network'
});
```

**Cache Updates**:
```typescript
// Update cache after mutation
const [updateUser] = useMutation(MUTATION, {
  update: (cache, { data }) => {
    cache.writeQuery({
      query: QUERY_USER,
      data: { user: data.updateUser },
    });
  },
});
```

### Image Optimization

**Lazy Loading**:
```typescript
<img src={src} loading="lazy" alt={alt} />
```

**SVG Optimization**:
- Use SVG sprites
- Optimize SVG files
- Use icon components

---

## Troubleshooting Guide

### Common Issues

#### 1. GraphQL Errors

**Symptoms**:
- `Network error`
- `GraphQL error: ...`

**Solutions**:
- Check backend server is running
- Verify token is valid
- Check GraphQL query syntax
- Review Apollo Client cache

#### 2. Authentication Issues

**Symptoms**:
- Redirect loops
- Token not found
- Auth state not updating

**Solutions**:
- Clear localStorage: `localStorage.clear()`
- Clear cookies
- Check Firebase configuration
- Verify token refresh logic

#### 3. Routing Issues

**Symptoms**:
- 404 errors
- Routes not matching
- Redirects not working

**Solutions**:
- Check route definitions
- Verify route order in Switch
- Check route protection logic
- Review browser history

#### 4. Styling Issues

**Symptoms**:
- Styles not applying
- Tailwind classes not working
- CSS conflicts

**Solutions**:
- Rebuild styles: `yarn build:client:styles`
- Check Tailwind config
- Verify CSS import order
- Check for CSS conflicts

#### 5. State Management Issues

**Symptoms**:
- State not updating
- Cache not clearing
- Stale data

**Solutions**:
- Clear Apollo cache: `await apolloService.clearStore()`
- Check component re-renders
- Verify state dependencies
- Review cache policies

### Debugging Tips

**1. React DevTools**:
- Install React DevTools browser extension
- Inspect component tree
- Check props and state

**2. Apollo DevTools**:
- Install Apollo Client DevTools
- Inspect GraphQL queries
- View cache contents

**3. Console Logging**:
```typescript
console.log('Debug info', { data, state });
```

**4. Network Tab**:
- Check GraphQL requests
- Verify request headers
- Review response data

**5. Component Debugging**:
```typescript
useEffect(() => {
  console.log('Component mounted/updated', { props, state });
}, [dependencies]);
```

### Performance Debugging

**1. React Profiler**:
- Use React DevTools Profiler
- Identify slow components
- Check render times

**2. Bundle Analysis**:
```bash
# Analyze bundle size
yarn build:client
# Use webpack-bundle-analyzer
```

**3. Network Analysis**:
- Check request sizes
- Identify slow queries
- Optimize GraphQL queries

---

## Additional Resources

### Documentation Files
- `README.md` - Project overview
- `DEVELOPER_DOCUMENTATION.md` - General developer guide

### External Documentation
- [React Documentation](https://reactjs.org/docs)
- [Apollo Client Docs](https://www.apollographql.com/docs/react/)
- [React Router Docs](https://reactrouter.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Key Files to Review
- `src/client/client.tsx` - Application entry point
- `src/client/app.tsx` - Main app component
- `src/client/domain/common/services/apollo.service.ts` - GraphQL client
- `src/client/domain/auth/auth.context.tsx` - Authentication
- `src/client/domain/common/components/` - Reusable components

---

## Conclusion

This document provides a comprehensive overview of the Fluenccy frontend architecture. Key takeaways:

1. **Modular Architecture**: Domain-driven design with clear feature boundaries
2. **Type Safety**: TypeScript throughout with GraphQL type generation
3. **State Management**: Apollo Client cache + React Context + Local state
4. **Component Patterns**: Presentational, Container, Layout, Page components
5. **GraphQL Integration**: Type-safe queries and mutations with Apollo Client
6. **Styling System**: Tailwind CSS with centralized theme management

For specific implementation details, refer to the source code and inline comments. When adding features or fixing bugs, follow the established patterns to maintain code consistency.

---

**Last Updated**: 2025-01-27
**Version**: 1.0


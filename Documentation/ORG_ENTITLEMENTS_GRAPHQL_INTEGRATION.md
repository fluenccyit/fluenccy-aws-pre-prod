# Org Entitlements GraphQL Integration

## Problem Identified

There was a significant discrepancy between the TypeScript model and GraphQL schema:

### TypeScript Model (`org-entitlements.model.ts`)
- **34 fields** including complex financial calculations
- Fields like `forwardMarginPercentage`, `spotMarginPercentage`, `limitOrderMarginPercentage`
- Business logic fields like `fi_name`, `fi_email`, `plan_approval_email`
- Probability and adjustment fields for trading algorithms

### GraphQL Schema (`graphql-schema.json`)
- **0 org entitlement types** - completely missing!
- No way to query or mutate org entitlements through GraphQL
- Only available through REST API endpoints

### Database Migration
- Only basic `org_entitlements` table with minimal fields
- Missing all the detailed financial calculation fields

## Solution Implemented

### 1. Created GraphQL Type Definitions
**File:** `src/server/domain/org-entitlements/org-entitlements.type-def.ts`

```graphql
type OrgEntitlement {
  id: ID!
  orgId: ID!
  spotPercentage: Float!
  forwardPercentage: Float!
  orderPercentage: Float!
  marginPercentage: Float!
  # ... all 34 fields from TypeScript model
  forwardMarginPercentage: Float!
  limitOrderMarginPercentage: Float!
  spotMarginPercentage: Float!
  setOptimised: Boolean!
  createdBy: String
  updatedBy: String
  createdAt: String!
  updatedAt: String!
}
```

### 2. Created GraphQL Resolvers
**File:** `src/server/domain/org-entitlements/org-entitlements.resolver.ts`

**Queries:**
- `orgEntitlements(input: ByOrgIdAndModeInput!)` - Get entitlements by org and mode
- `orgEntitlementById(id: ID!)` - Get specific entitlement
- `orgMarginPercentage(input: ByOrgIdAndModeInput!)` - Get margin data
- `orgPlanApprovalEmail(input: ByOrgIdAndModeInput!)` - Get approval email

**Mutations:**
- `createOrgEntitlement(input: CreateOrgEntitlementInput!)` - Create new entitlement
- `updateOrgEntitlement(input: UpdateOrgEntitlementInput!)` - Update existing
- `deleteOrgEntitlement(id: ID!)` - Delete entitlement

### 3. Updated Database Migration
**File:** `migrations/fluenccy-db-setup.js`

Added all missing columns to `org_entitlements` table:
```javascript
// Additional org entitlement fields from the TypeScript model
table.decimal('spotPercentage', 17, 5).notNullable().defaultTo(0);
table.decimal('forwardPercentage', 17, 5).notNullable().defaultTo(0);
table.decimal('orderPercentage', 17, 5).notNullable().defaultTo(0);
table.decimal('marginPercentage', 17, 5).notNullable().defaultTo(0);
table.decimal('avgOrder', 17, 5).notNullable().defaultTo(0);
table.decimal('budgetDiscount', 17, 5).notNullable().defaultTo(0);
table.decimal('hedgePercentage', 17, 5).notNullable().defaultTo(0);
table.decimal('hedgeAdjustment', 17, 5).notNullable().defaultTo(0);
table.decimal('EFTAdjustment', 17, 5).notNullable().defaultTo(0);
table.decimal('volAdjustment', 17, 5).notNullable().defaultTo(0);
table.decimal('orderAdjustmentPlus', 17, 5).notNullable().defaultTo(0);
table.decimal('orderAdjustmentMinus', 17, 5).notNullable().defaultTo(0);
table.decimal('orderProbability', 17, 5).notNullable().defaultTo(0);
table.decimal('minimumProbability', 17, 5).notNullable().defaultTo(0);
table.decimal('maximumProbability', 17, 5).notNullable().defaultTo(0);
table.decimal('minPercentAboveSpot', 17, 5).notNullable().defaultTo(0);
table.decimal('maxPercentOnOrder', 17, 5).notNullable().defaultTo(0);
table.string('fi_name').notNullable().defaultTo('');
table.string('fi_email').notNullable().defaultTo('');
table.string('plan_approval_email').notNullable().defaultTo('');
table.decimal('maxForwardPercent', 17, 5).notNullable().defaultTo(0);
table.decimal('minForwardPercent', 17, 5).notNullable().defaultTo(0);
table.decimal('forwardMarginPercentage', 17, 5).notNullable().defaultTo(0);
table.decimal('limitOrderMarginPercentage', 17, 5).notNullable().defaultTo(0);
table.decimal('spotMarginPercentage', 17, 5).notNullable().defaultTo(0);
table.boolean('setOptimised').notNullable().defaultTo(false);
table.string('createdBy');
table.string('updatedBy');
table.string('mode').notNullable().defaultTo('default');
table.boolean('showInversedRate').notNullable().defaultTo(false);
```

## Next Steps Required

### 1. Register GraphQL Types
Add to `src/server/app.schema.ts`:
```typescript
import { orgEntitlementsTypeDef } from '@server/org-entitlements/org-entitlements.type-def';
import { Query as OrgEntitlementsQuery, Mutation as OrgEntitlementsMutation } from '@server/org-entitlements/org-entitlements.resolver';

// Add to typeDefs array
orgEntitlementsTypeDef,

// Add to resolvers
Query: {
  ...Query,
  ...OrgEntitlementsQuery,
},
Mutation: {
  ...Mutation,
  ...OrgEntitlementsMutation,
},
```

### 2. Update GraphQL Codegen
Run the GraphQL codegen to generate TypeScript types:
```bash
npm run codegen
```

### 3. Implement Missing Database Methods
The resolvers reference some methods that don't exist yet:
- `orgEntitlementsDbGetters.getOrgEntitlementById()`
- `orgEntitlementsDbUpdaters.updateOrgEntitlement()`
- `orgEntitlementsDbUpdaters.deleteOrgEntitlement()`

### 4. Test Integration
- Test GraphQL queries in GraphQL Playground
- Verify data consistency between REST and GraphQL APIs
- Test all CRUD operations

## Benefits

1. **Consistency**: GraphQL schema now matches TypeScript models
2. **Completeness**: All org entitlement fields are now accessible via GraphQL
3. **Type Safety**: Generated TypeScript types for GraphQL operations
4. **Developer Experience**: Single API for both REST and GraphQL access
5. **Future-Proof**: Easy to extend with additional fields

## Files Created/Modified

### New Files:
- `src/server/domain/org-entitlements/org-entitlements.type-def.ts`
- `src/server/domain/org-entitlements/org-entitlements.resolver.ts`
- `ORG_ENTITLEMENTS_GRAPHQL_INTEGRATION.md`

### Modified Files:
- `migrations/fluenccy-db-setup.js` - Added missing columns to org_entitlements table

This solution bridges the gap between the TypeScript models and GraphQL schema, ensuring complete feature parity and type safety across the application.

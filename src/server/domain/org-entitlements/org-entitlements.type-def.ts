import { gql } from 'apollo-server-express';

export const orgEntitlementsTypeDef = gql`
  type OrgEntitlement {
    id: ID!
    orgId: ID!
    spotPercentage: Float!
    forwardPercentage: Float!
    orderPercentage: Float!
    marginPercentage: Float!
    avgOrder: Float!
    budgetDiscount: Float!
    hedgePercentage: Float!
    hedgeAdjustment: Float!
    EFTAdjustment: Float!
    volAdjustment: Float!
    orderAdjustmentPlus: Float!
    orderAdjustmentMinus: Float!
    orderProbability: Float!
    minimumProbability: Float!
    maximumProbability: Float!
    minPercentAboveSpot: Float!
    maxPercentOnOrder: Float!
    fi_name: String!
    fi_email: String!
    plan_approval_email: String!
    maxForwardPercent: Float!
    minForwardPercent: Float!
    forwardMarginPercentage: Float!
    limitOrderMarginPercentage: Float!
    spotMarginPercentage: Float!
    setOptimised: Boolean!
    createdBy: String
    updatedBy: String
    createdAt: String!
    updatedAt: String!
  }

  input CreateOrgEntitlementInput {
    orgId: ID!
    spotPercentage: Float!
    forwardPercentage: Float!
    orderPercentage: Float!
    marginPercentage: Float!
    avgOrder: Float!
    budgetDiscount: Float!
    hedgePercentage: Float!
    hedgeAdjustment: Float!
    EFTAdjustment: Float!
    volAdjustment: Float!
    orderAdjustmentPlus: Float!
    orderAdjustmentMinus: Float!
    orderProbability: Float!
    minimumProbability: Float!
    maximumProbability: Float!
    minPercentAboveSpot: Float!
    maxPercentOnOrder: Float!
    fi_name: String!
    fi_email: String!
    plan_approval_email: String!
    maxForwardPercent: Float!
    minForwardPercent: Float!
    forwardMarginPercentage: Float!
    limitOrderMarginPercentage: Float!
    spotMarginPercentage: Float!
    setOptimised: Boolean!
    createdBy: String
    updatedBy: String
  }

  input UpdateOrgEntitlementInput {
    id: ID!
    spotPercentage: Float
    forwardPercentage: Float
    orderPercentage: Float
    marginPercentage: Float
    avgOrder: Float
    budgetDiscount: Float
    hedgePercentage: Float
    hedgeAdjustment: Float
    EFTAdjustment: Float
    volAdjustment: Float
    orderAdjustmentPlus: Float
    orderAdjustmentMinus: Float
    orderProbability: Float
    minimumProbability: Float
    maximumProbability: Float
    minPercentAboveSpot: Float
    maxPercentOnOrder: Float
    fi_name: String
    fi_email: String
    plan_approval_email: String
    maxForwardPercent: Float
    minForwardPercent: Float
    forwardMarginPercentage: Float
    limitOrderMarginPercentage: Float
    spotMarginPercentage: Float
    setOptimised: Boolean
    updatedBy: String
  }

  input ByOrgIdAndModeInput {
    orgId: ID!
    mode: String!
  }

  extend type Query {
    orgEntitlements(input: ByOrgIdAndModeInput!): [OrgEntitlement!]!
    orgEntitlementById(id: ID!): OrgEntitlement
    orgMarginPercentage(input: ByOrgIdAndModeInput!): [OrgEntitlement!]!
    orgPlanApprovalEmail(input: ByOrgIdAndModeInput!): [OrgEntitlement!]!
  }

  extend type Mutation {
    createOrgEntitlement(input: CreateOrgEntitlementInput!): OrgEntitlement!
    updateOrgEntitlement(input: UpdateOrgEntitlementInput!): OrgEntitlement!
    deleteOrgEntitlement(id: ID!): Boolean!
  }
`;

--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.5

-- Started on 2025-10-02 13:45:59

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 222 (class 1259 OID 17548)
-- Name: account; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.account (
    id character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    name character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.account OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 17674)
-- Name: authentication_code; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.authentication_code (
    email character varying(255) NOT NULL,
    code character varying(255) NOT NULL,
    username character varying(255) NOT NULL,
    created_at date,
    updated_at date
);


ALTER TABLE public.authentication_code OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 17957)
-- Name: buying_schedule; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.buying_schedule (
    id character varying(255) NOT NULL,
    "orgId" character varying(255) NOT NULL,
    "scheduleName" character varying(255) NOT NULL,
    "currencyPair" character varying(255) NOT NULL,
    amount numeric(17,5) NOT NULL,
    frequency character varying(255) NOT NULL,
    "startDate" date NOT NULL,
    "endDate" date,
    "isActive" boolean DEFAULT true NOT NULL,
    "scheduleConfig" jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.buying_schedule OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 17850)
-- Name: config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.config (
    key character varying(255) NOT NULL,
    value text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.config OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 18061)
-- Name: crm_entitlement_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.crm_entitlement_item (
    id character varying(255) NOT NULL,
    "entitlementId" character varying(255) NOT NULL,
    "itemType" character varying(255) NOT NULL,
    "itemValue" character varying(255) NOT NULL,
    quantity numeric(17,5),
    "unitPrice" numeric(17,5),
    currency character varying(255),
    "isActive" boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.crm_entitlement_item OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 18007)
-- Name: crm_entitlements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.crm_entitlements (
    id character varying(255) NOT NULL,
    "orgId" character varying(255) NOT NULL,
    "entitlementType" character varying(255) NOT NULL,
    "entitlementValue" character varying(255) NOT NULL,
    "expiresAt" date,
    "isActive" boolean DEFAULT true NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.crm_entitlements OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 18024)
-- Name: crm_entries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.crm_entries (
    id character varying(255) NOT NULL,
    "orgId" character varying(255) NOT NULL,
    "entryType" character varying(255) NOT NULL,
    "entryId" character varying(255) NOT NULL,
    provider character varying(255) NOT NULL,
    "entryData" jsonb NOT NULL,
    status character varying(255) NOT NULL,
    "processedAt" timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.crm_entries OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 18078)
-- Name: crm_entry_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.crm_entry_logs (
    id character varying(255) NOT NULL,
    "entryId" character varying(255) NOT NULL,
    action character varying(255) NOT NULL,
    status character varying(255) NOT NULL,
    message text,
    metadata jsonb,
    "actionAt" timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.crm_entry_logs OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 18040)
-- Name: crm_feedback; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.crm_feedback (
    id character varying(255) NOT NULL,
    "orgId" character varying(255) NOT NULL,
    "userId" character varying(255) NOT NULL,
    "feedbackType" character varying(255) NOT NULL,
    "feedbackText" text NOT NULL,
    rating integer,
    status character varying(255) NOT NULL,
    "submittedAt" timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.crm_feedback OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 17991)
-- Name: crm_import_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.crm_import_logs (
    id character varying(255) NOT NULL,
    "orgId" character varying(255) NOT NULL,
    "importType" character varying(255) NOT NULL,
    status character varying(255) NOT NULL,
    "totalRecords" integer,
    "processedRecords" integer,
    "errorCount" integer,
    "errorMessage" text,
    metadata jsonb,
    "startedAt" timestamp with time zone,
    "completedAt" timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.crm_import_logs OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 17861)
-- Name: financial_products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.financial_products (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    category character varying(255) NOT NULL,
    "minAmount" numeric(17,5),
    "maxAmount" numeric(17,5),
    currency character varying(255) NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.financial_products OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 17660)
-- Name: forward_point; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.forward_point (
    date date NOT NULL,
    "baseCurrency" character varying(255) NOT NULL,
    "tradeCurrency" character varying(255) NOT NULL,
    month character varying(255) NOT NULL,
    year character varying(255) NOT NULL,
    "forwardPoints" numeric(17,5) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.forward_point OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 17923)
-- Name: hedge_invoice; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hedge_invoice (
    provider character varying(255) NOT NULL,
    "invoiceId" character varying(255) NOT NULL,
    "tenantId" character varying(255) NOT NULL,
    "invoiceType" character varying(255) NOT NULL,
    "invoiceNumber" character varying(255) NOT NULL,
    "invoiceStatus" character varying(255) NOT NULL,
    "contactName" character varying(255) NOT NULL,
    date date NOT NULL,
    "dateDue" date NOT NULL,
    total numeric(17,5) NOT NULL,
    "currencyCode" character varying(255) NOT NULL,
    "currencyRate" numeric(17,5) NOT NULL,
    "amountDue" numeric(17,5) NOT NULL,
    "amountPaid" numeric(17,5) NOT NULL,
    "amountCredited" numeric(17,5) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.hedge_invoice OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 17941)
-- Name: hedge_invoice_basket; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hedge_invoice_basket (
    id character varying(255) NOT NULL,
    "orgId" character varying(255) NOT NULL,
    "basketName" character varying(255) NOT NULL,
    "invoiceIds" jsonb NOT NULL,
    "totalAmount" numeric(17,5) NOT NULL,
    currency character varying(255) NOT NULL,
    status character varying(255) NOT NULL,
    "createdDate" date NOT NULL,
    "hedgeDate" date,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.hedge_invoice_basket OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 17932)
-- Name: hedge_payment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hedge_payment (
    provider character varying(255) NOT NULL,
    "paymentId" character varying(255) NOT NULL,
    "tenantId" character varying(255) NOT NULL,
    "paymentStatus" character varying(255) NOT NULL,
    "paymentType" character varying(255) NOT NULL,
    "invoiceId" character varying(255) NOT NULL,
    date date NOT NULL,
    amount numeric(17,5) NOT NULL,
    "currencyCode" character varying(255) NOT NULL,
    "currencyRate" numeric(17,5) NOT NULL,
    "minCost" numeric(17,5) NOT NULL,
    "minRate" numeric(17,5) NOT NULL,
    "maxCost" numeric(17,5) NOT NULL,
    "maxRate" numeric(17,5) NOT NULL,
    "actualCost" numeric(17,5) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.hedge_payment OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 17907)
-- Name: import_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.import_logs (
    id character varying(255) NOT NULL,
    "orgId" character varying(255) NOT NULL,
    "importType" character varying(255) NOT NULL,
    status character varying(255) NOT NULL,
    "totalRecords" integer,
    "processedRecords" integer,
    "errorCount" integer,
    "errorMessage" text,
    metadata jsonb,
    "startedAt" timestamp with time zone,
    "completedAt" timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.import_logs OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 17642)
-- Name: invoice; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoice (
    provider character varying(255) NOT NULL,
    "invoiceId" character varying(255) NOT NULL,
    "tenantId" character varying(255) NOT NULL,
    "invoiceType" character varying(255) NOT NULL,
    "invoiceNumber" character varying(255) NOT NULL,
    "invoiceStatus" character varying(255) NOT NULL,
    "contactName" character varying(255) NOT NULL,
    date date NOT NULL,
    "dateDue" date NOT NULL,
    total numeric(17,5) NOT NULL,
    "currencyCode" character varying(255) NOT NULL,
    "currencyRate" numeric(17,5) NOT NULL,
    "amountDue" numeric(17,5) NOT NULL,
    "amountPaid" numeric(17,5) NOT NULL,
    "amountCredited" numeric(17,5) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.invoice OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 17248)
-- Name: knex_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.knex_migrations (
    id integer NOT NULL,
    name character varying(255),
    batch integer,
    migration_time timestamp with time zone
);


ALTER TABLE public.knex_migrations OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 17247)
-- Name: knex_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.knex_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.knex_migrations_id_seq OWNER TO postgres;

--
-- TOC entry 5115 (class 0 OID 0)
-- Dependencies: 217
-- Name: knex_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.knex_migrations_id_seq OWNED BY public.knex_migrations.id;


--
-- TOC entry 220 (class 1259 OID 17255)
-- Name: knex_migrations_lock; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.knex_migrations_lock (
    index integer NOT NULL,
    is_locked integer
);


ALTER TABLE public.knex_migrations_lock OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 17254)
-- Name: knex_migrations_lock_index_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.knex_migrations_lock_index_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.knex_migrations_lock_index_seq OWNER TO postgres;

--
-- TOC entry 5116 (class 0 OID 0)
-- Dependencies: 219
-- Name: knex_migrations_lock_index_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.knex_migrations_lock_index_seq OWNED BY public.knex_migrations_lock.index;


--
-- TOC entry 233 (class 1259 OID 17873)
-- Name: org_entitlements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.org_entitlements (
    id character varying(255) NOT NULL,
    "orgId" character varying(255) NOT NULL,
    "entitlementType" character varying(255) NOT NULL,
    "entitlementValue" character varying(255) NOT NULL,
    "expiresAt" date,
    "isActive" boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.org_entitlements OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 17590)
-- Name: organisation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.organisation (
    id character varying(255) NOT NULL,
    "accountId" character varying(255) NOT NULL,
    "tenantId" character varying(255) NOT NULL,
    "tokenUserId" character varying(255),
    name character varying(255) NOT NULL,
    currency character varying(255) NOT NULL,
    "hedgeMargin" numeric(17,5) DEFAULT 0.0035 NOT NULL,
    "buildPlanScore" integer DEFAULT 0 NOT NULL,
    "buildPlanAnswers" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "currencyScores" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "initialSyncComplete" boolean DEFAULT false NOT NULL,
    "onboardingComplete" boolean DEFAULT false NOT NULL,
    "intentRegistered" boolean DEFAULT false NOT NULL,
    "syncStatus" character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.organisation OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 17623)
-- Name: organisation_user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.organisation_user (
    "orgId" character varying(255) NOT NULL,
    "userId" character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.organisation_user OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 17651)
-- Name: payment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment (
    provider character varying(255) NOT NULL,
    "paymentId" character varying(255) NOT NULL,
    "tenantId" character varying(255) NOT NULL,
    "paymentStatus" character varying(255) NOT NULL,
    "paymentType" character varying(255) NOT NULL,
    "invoiceId" character varying(255) NOT NULL,
    date date NOT NULL,
    amount numeric(17,5) NOT NULL,
    "currencyCode" character varying(255) NOT NULL,
    "currencyRate" numeric(17,5) NOT NULL,
    "minCost" numeric(17,5) NOT NULL,
    "minRate" numeric(17,5) NOT NULL,
    "maxCost" numeric(17,5) NOT NULL,
    "maxRate" numeric(17,5) NOT NULL,
    "actualCost" numeric(17,5) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.payment OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 18094)
-- Name: quote_invoice; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quote_invoice (
    id character varying(255) NOT NULL,
    "orgId" character varying(255) NOT NULL,
    "quoteNumber" character varying(255) NOT NULL,
    "invoiceId" character varying(255),
    status character varying(255) NOT NULL,
    amount numeric(17,5) NOT NULL,
    currency character varying(255) NOT NULL,
    "quoteDate" date NOT NULL,
    "expiryDate" date,
    "invoiceDate" date,
    "quoteData" jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.quote_invoice OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 17539)
-- Name: rate; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rate (
    date date NOT NULL,
    "baseCurrency" character varying(255) NOT NULL,
    "tradeCurrency" character varying(255) NOT NULL,
    open numeric(17,5) NOT NULL,
    high numeric(17,5) NOT NULL,
    low numeric(17,5) NOT NULL,
    last numeric(17,5) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.rate OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 17974)
-- Name: recurring_plan; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recurring_plan (
    id character varying(255) NOT NULL,
    "orgId" character varying(255) NOT NULL,
    "planName" character varying(255) NOT NULL,
    "planType" character varying(255) NOT NULL,
    amount numeric(17,5) NOT NULL,
    currency character varying(255) NOT NULL,
    frequency character varying(255) NOT NULL,
    "startDate" date NOT NULL,
    "endDate" date,
    "isActive" boolean DEFAULT true NOT NULL,
    "planConfig" jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.recurring_plan OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 17579)
-- Name: tenant; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tenant (
    id character varying(255) NOT NULL,
    provider character varying(255) NOT NULL,
    "lastSynced" timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.tenant OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 17559)
-- Name: user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."user" (
    id character varying(255) NOT NULL,
    "accountId" character varying(255),
    "firebaseUid" character varying(255) NOT NULL,
    "firstName" character varying(255) NOT NULL,
    "lastName" character varying(255) NOT NULL,
    role character varying(255) NOT NULL,
    "tokenSet" jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."user" OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 17890)
-- Name: xero_token_set; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.xero_token_set (
    id character varying(255) NOT NULL,
    "orgId" character varying(255) NOT NULL,
    "tokenSet" jsonb NOT NULL,
    "expiresAt" timestamp with time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.xero_token_set OWNER TO postgres;

--
-- TOC entry 4779 (class 2604 OID 17251)
-- Name: knex_migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.knex_migrations ALTER COLUMN id SET DEFAULT nextval('public.knex_migrations_id_seq'::regclass);


--
-- TOC entry 4780 (class 2604 OID 17258)
-- Name: knex_migrations_lock index; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.knex_migrations_lock ALTER COLUMN index SET DEFAULT nextval('public.knex_migrations_lock_index_seq'::regclass);


--
-- TOC entry 4854 (class 2606 OID 17558)
-- Name: account account_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_id_unique UNIQUE (id);


--
-- TOC entry 4856 (class 2606 OID 17556)
-- Name: account account_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (id);


--
-- TOC entry 4910 (class 2606 OID 17968)
-- Name: buying_schedule buying_schedule_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.buying_schedule
    ADD CONSTRAINT buying_schedule_id_unique UNIQUE (id);


--
-- TOC entry 4912 (class 2606 OID 17966)
-- Name: buying_schedule buying_schedule_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.buying_schedule
    ADD CONSTRAINT buying_schedule_pkey PRIMARY KEY (id);


--
-- TOC entry 4882 (class 2606 OID 17860)
-- Name: config config_key_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.config
    ADD CONSTRAINT config_key_unique UNIQUE (key);


--
-- TOC entry 4884 (class 2606 OID 17858)
-- Name: config config_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.config
    ADD CONSTRAINT config_pkey PRIMARY KEY (key);


--
-- TOC entry 4934 (class 2606 OID 18072)
-- Name: crm_entitlement_item crm_entitlement_item_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crm_entitlement_item
    ADD CONSTRAINT crm_entitlement_item_id_unique UNIQUE (id);


--
-- TOC entry 4936 (class 2606 OID 18070)
-- Name: crm_entitlement_item crm_entitlement_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crm_entitlement_item
    ADD CONSTRAINT crm_entitlement_item_pkey PRIMARY KEY (id);


--
-- TOC entry 4922 (class 2606 OID 18018)
-- Name: crm_entitlements crm_entitlements_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crm_entitlements
    ADD CONSTRAINT crm_entitlements_id_unique UNIQUE (id);


--
-- TOC entry 4924 (class 2606 OID 18016)
-- Name: crm_entitlements crm_entitlements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crm_entitlements
    ADD CONSTRAINT crm_entitlements_pkey PRIMARY KEY (id);


--
-- TOC entry 4926 (class 2606 OID 18034)
-- Name: crm_entries crm_entries_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crm_entries
    ADD CONSTRAINT crm_entries_id_unique UNIQUE (id);


--
-- TOC entry 4928 (class 2606 OID 18032)
-- Name: crm_entries crm_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crm_entries
    ADD CONSTRAINT crm_entries_pkey PRIMARY KEY (id);


--
-- TOC entry 4938 (class 2606 OID 18088)
-- Name: crm_entry_logs crm_entry_logs_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crm_entry_logs
    ADD CONSTRAINT crm_entry_logs_id_unique UNIQUE (id);


--
-- TOC entry 4940 (class 2606 OID 18086)
-- Name: crm_entry_logs crm_entry_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crm_entry_logs
    ADD CONSTRAINT crm_entry_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 4930 (class 2606 OID 18050)
-- Name: crm_feedback crm_feedback_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crm_feedback
    ADD CONSTRAINT crm_feedback_id_unique UNIQUE (id);


--
-- TOC entry 4932 (class 2606 OID 18048)
-- Name: crm_feedback crm_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crm_feedback
    ADD CONSTRAINT crm_feedback_pkey PRIMARY KEY (id);


--
-- TOC entry 4918 (class 2606 OID 18001)
-- Name: crm_import_logs crm_import_logs_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crm_import_logs
    ADD CONSTRAINT crm_import_logs_id_unique UNIQUE (id);


--
-- TOC entry 4920 (class 2606 OID 17999)
-- Name: crm_import_logs crm_import_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crm_import_logs
    ADD CONSTRAINT crm_import_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 4886 (class 2606 OID 17872)
-- Name: financial_products financial_products_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.financial_products
    ADD CONSTRAINT financial_products_id_unique UNIQUE (id);


--
-- TOC entry 4888 (class 2606 OID 17870)
-- Name: financial_products financial_products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.financial_products
    ADD CONSTRAINT financial_products_pkey PRIMARY KEY (id);


--
-- TOC entry 4880 (class 2606 OID 17668)
-- Name: forward_point forward_point_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forward_point
    ADD CONSTRAINT forward_point_pkey PRIMARY KEY (date, month, year, "baseCurrency", "tradeCurrency");


--
-- TOC entry 4906 (class 2606 OID 17951)
-- Name: hedge_invoice_basket hedge_invoice_basket_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hedge_invoice_basket
    ADD CONSTRAINT hedge_invoice_basket_id_unique UNIQUE (id);


--
-- TOC entry 4908 (class 2606 OID 17949)
-- Name: hedge_invoice_basket hedge_invoice_basket_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hedge_invoice_basket
    ADD CONSTRAINT hedge_invoice_basket_pkey PRIMARY KEY (id);


--
-- TOC entry 4902 (class 2606 OID 17931)
-- Name: hedge_invoice hedge_invoice_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hedge_invoice
    ADD CONSTRAINT hedge_invoice_pkey PRIMARY KEY ("tenantId", "invoiceId", provider);


--
-- TOC entry 4904 (class 2606 OID 17940)
-- Name: hedge_payment hedge_payment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hedge_payment
    ADD CONSTRAINT hedge_payment_pkey PRIMARY KEY ("tenantId", "paymentId", provider);


--
-- TOC entry 4898 (class 2606 OID 17917)
-- Name: import_logs import_logs_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.import_logs
    ADD CONSTRAINT import_logs_id_unique UNIQUE (id);


--
-- TOC entry 4900 (class 2606 OID 17915)
-- Name: import_logs import_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.import_logs
    ADD CONSTRAINT import_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 4876 (class 2606 OID 17650)
-- Name: invoice invoice_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice
    ADD CONSTRAINT invoice_pkey PRIMARY KEY ("tenantId", "invoiceId", provider);


--
-- TOC entry 4850 (class 2606 OID 17260)
-- Name: knex_migrations_lock knex_migrations_lock_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.knex_migrations_lock
    ADD CONSTRAINT knex_migrations_lock_pkey PRIMARY KEY (index);


--
-- TOC entry 4848 (class 2606 OID 17253)
-- Name: knex_migrations knex_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.knex_migrations
    ADD CONSTRAINT knex_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4890 (class 2606 OID 17884)
-- Name: org_entitlements org_entitlements_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.org_entitlements
    ADD CONSTRAINT org_entitlements_id_unique UNIQUE (id);


--
-- TOC entry 4892 (class 2606 OID 17882)
-- Name: org_entitlements org_entitlements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.org_entitlements
    ADD CONSTRAINT org_entitlements_pkey PRIMARY KEY (id);


--
-- TOC entry 4870 (class 2606 OID 17607)
-- Name: organisation organisation_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organisation
    ADD CONSTRAINT organisation_id_unique UNIQUE (id);


--
-- TOC entry 4872 (class 2606 OID 17605)
-- Name: organisation organisation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organisation
    ADD CONSTRAINT organisation_pkey PRIMARY KEY (id);


--
-- TOC entry 4874 (class 2606 OID 17641)
-- Name: organisation_user organisation_user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organisation_user
    ADD CONSTRAINT organisation_user_pkey PRIMARY KEY ("orgId", "userId");


--
-- TOC entry 4878 (class 2606 OID 17659)
-- Name: payment payment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment
    ADD CONSTRAINT payment_pkey PRIMARY KEY ("tenantId", "paymentId", provider);


--
-- TOC entry 4942 (class 2606 OID 18104)
-- Name: quote_invoice quote_invoice_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quote_invoice
    ADD CONSTRAINT quote_invoice_id_unique UNIQUE (id);


--
-- TOC entry 4944 (class 2606 OID 18102)
-- Name: quote_invoice quote_invoice_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quote_invoice
    ADD CONSTRAINT quote_invoice_pkey PRIMARY KEY (id);


--
-- TOC entry 4852 (class 2606 OID 17547)
-- Name: rate rate_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rate
    ADD CONSTRAINT rate_pkey PRIMARY KEY (date, "baseCurrency", "tradeCurrency");


--
-- TOC entry 4914 (class 2606 OID 17985)
-- Name: recurring_plan recurring_plan_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recurring_plan
    ADD CONSTRAINT recurring_plan_id_unique UNIQUE (id);


--
-- TOC entry 4916 (class 2606 OID 17983)
-- Name: recurring_plan recurring_plan_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recurring_plan
    ADD CONSTRAINT recurring_plan_pkey PRIMARY KEY (id);


--
-- TOC entry 4866 (class 2606 OID 17589)
-- Name: tenant tenant_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant
    ADD CONSTRAINT tenant_id_unique UNIQUE (id);


--
-- TOC entry 4868 (class 2606 OID 17587)
-- Name: tenant tenant_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant
    ADD CONSTRAINT tenant_pkey PRIMARY KEY (id);


--
-- TOC entry 4858 (class 2606 OID 17571)
-- Name: user user_accountid_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_accountid_unique UNIQUE ("accountId");


--
-- TOC entry 4860 (class 2606 OID 17578)
-- Name: user user_firebaseuid_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_firebaseuid_unique UNIQUE ("firebaseUid");


--
-- TOC entry 4862 (class 2606 OID 17569)
-- Name: user user_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_id_unique UNIQUE (id);


--
-- TOC entry 4864 (class 2606 OID 17567)
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- TOC entry 4894 (class 2606 OID 17901)
-- Name: xero_token_set xero_token_set_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.xero_token_set
    ADD CONSTRAINT xero_token_set_id_unique UNIQUE (id);


--
-- TOC entry 4896 (class 2606 OID 17899)
-- Name: xero_token_set xero_token_set_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.xero_token_set
    ADD CONSTRAINT xero_token_set_pkey PRIMARY KEY (id);


--
-- TOC entry 4955 (class 2606 OID 17969)
-- Name: buying_schedule buying_schedule_orgid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.buying_schedule
    ADD CONSTRAINT buying_schedule_orgid_foreign FOREIGN KEY ("orgId") REFERENCES public.organisation(id);


--
-- TOC entry 4962 (class 2606 OID 18073)
-- Name: crm_entitlement_item crm_entitlement_item_entitlementid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crm_entitlement_item
    ADD CONSTRAINT crm_entitlement_item_entitlementid_foreign FOREIGN KEY ("entitlementId") REFERENCES public.crm_entitlements(id);


--
-- TOC entry 4958 (class 2606 OID 18019)
-- Name: crm_entitlements crm_entitlements_orgid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crm_entitlements
    ADD CONSTRAINT crm_entitlements_orgid_foreign FOREIGN KEY ("orgId") REFERENCES public.organisation(id);


--
-- TOC entry 4959 (class 2606 OID 18035)
-- Name: crm_entries crm_entries_orgid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crm_entries
    ADD CONSTRAINT crm_entries_orgid_foreign FOREIGN KEY ("orgId") REFERENCES public.organisation(id);


--
-- TOC entry 4963 (class 2606 OID 18089)
-- Name: crm_entry_logs crm_entry_logs_entryid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crm_entry_logs
    ADD CONSTRAINT crm_entry_logs_entryid_foreign FOREIGN KEY ("entryId") REFERENCES public.crm_entries(id);


--
-- TOC entry 4960 (class 2606 OID 18051)
-- Name: crm_feedback crm_feedback_orgid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crm_feedback
    ADD CONSTRAINT crm_feedback_orgid_foreign FOREIGN KEY ("orgId") REFERENCES public.organisation(id);


--
-- TOC entry 4961 (class 2606 OID 18056)
-- Name: crm_feedback crm_feedback_userid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crm_feedback
    ADD CONSTRAINT crm_feedback_userid_foreign FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- TOC entry 4957 (class 2606 OID 18002)
-- Name: crm_import_logs crm_import_logs_orgid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crm_import_logs
    ADD CONSTRAINT crm_import_logs_orgid_foreign FOREIGN KEY ("orgId") REFERENCES public.organisation(id);


--
-- TOC entry 4954 (class 2606 OID 17952)
-- Name: hedge_invoice_basket hedge_invoice_basket_orgid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hedge_invoice_basket
    ADD CONSTRAINT hedge_invoice_basket_orgid_foreign FOREIGN KEY ("orgId") REFERENCES public.organisation(id);


--
-- TOC entry 4953 (class 2606 OID 17918)
-- Name: import_logs import_logs_orgid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.import_logs
    ADD CONSTRAINT import_logs_orgid_foreign FOREIGN KEY ("orgId") REFERENCES public.organisation(id);


--
-- TOC entry 4951 (class 2606 OID 17885)
-- Name: org_entitlements org_entitlements_orgid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.org_entitlements
    ADD CONSTRAINT org_entitlements_orgid_foreign FOREIGN KEY ("orgId") REFERENCES public.organisation(id);


--
-- TOC entry 4946 (class 2606 OID 17608)
-- Name: organisation organisation_accountid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organisation
    ADD CONSTRAINT organisation_accountid_foreign FOREIGN KEY ("accountId") REFERENCES public.account(id);


--
-- TOC entry 4947 (class 2606 OID 17613)
-- Name: organisation organisation_tenantid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organisation
    ADD CONSTRAINT organisation_tenantid_foreign FOREIGN KEY ("tenantId") REFERENCES public.tenant(id);


--
-- TOC entry 4948 (class 2606 OID 17618)
-- Name: organisation organisation_tokenuserid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organisation
    ADD CONSTRAINT organisation_tokenuserid_foreign FOREIGN KEY ("tokenUserId") REFERENCES public."user"(id);


--
-- TOC entry 4949 (class 2606 OID 17630)
-- Name: organisation_user organisation_user_orgid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organisation_user
    ADD CONSTRAINT organisation_user_orgid_foreign FOREIGN KEY ("orgId") REFERENCES public.organisation(id);


--
-- TOC entry 4950 (class 2606 OID 17635)
-- Name: organisation_user organisation_user_userid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organisation_user
    ADD CONSTRAINT organisation_user_userid_foreign FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- TOC entry 4964 (class 2606 OID 18105)
-- Name: quote_invoice quote_invoice_orgid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quote_invoice
    ADD CONSTRAINT quote_invoice_orgid_foreign FOREIGN KEY ("orgId") REFERENCES public.organisation(id);


--
-- TOC entry 4956 (class 2606 OID 17986)
-- Name: recurring_plan recurring_plan_orgid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recurring_plan
    ADD CONSTRAINT recurring_plan_orgid_foreign FOREIGN KEY ("orgId") REFERENCES public.organisation(id);


--
-- TOC entry 4945 (class 2606 OID 17572)
-- Name: user user_accountid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_accountid_foreign FOREIGN KEY ("accountId") REFERENCES public.account(id);


--
-- TOC entry 4952 (class 2606 OID 17902)
-- Name: xero_token_set xero_token_set_orgid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.xero_token_set
    ADD CONSTRAINT xero_token_set_orgid_foreign FOREIGN KEY ("orgId") REFERENCES public.organisation(id);


-- Completed on 2025-10-02 13:45:59

--
-- PostgreSQL database dump complete
--


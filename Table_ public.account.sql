-- Table: public.account

-- DROP TABLE public.account;

CREATE TABLE IF NOT EXISTS public.account
(
    id character varying(255) COLLATE pg_catalog."default" NOT NULL,
    type character varying(255) COLLATE pg_catalog."default" NOT NULL,
    name character varying(255) COLLATE pg_catalog."default",
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT account_pkey PRIMARY KEY (id),
    CONSTRAINT account_id_unique UNIQUE (id)
)

TABLESPACE pg_default;

ALTER TABLE public.account
    OWNER to sfkjimfacqueht;
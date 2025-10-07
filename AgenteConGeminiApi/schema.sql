-- public.transactions definition

-- Drop table

-- DROP TABLE public.transactions;

CREATE TABLE public.transactions (
	id serial4 NOT NULL,
	user_id int4 NOT NULL,
	amount numeric(10, 2) NOT NULL,
	description text NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT transactions_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_transactions_user_id ON public.transactions USING btree (user_id);


-- public.transactions foreign keys

ALTER TABLE public.transactions ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users(id);

-- public.users definition

-- Drop table

-- DROP TABLE public.users;

CREATE TABLE public.users (
	id serial4 NOT NULL,
	"name" varchar(255) NOT NULL,
	email varchar(255) NOT NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT users_email_key UNIQUE (email),
	CONSTRAINT users_pkey PRIMARY KEY (id)
);
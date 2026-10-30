CREATE TABLE "holdings" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"category" text NOT NULL,
	"type" text NOT NULL,
	"sub_type" text NOT NULL,
	"current_value" double precision NOT NULL,
	"invested_amount" double precision,
	"monthly_contribution" double precision,
	"last_updated" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX "holdings_user_id_idx" ON "holdings" USING btree ("user_id");
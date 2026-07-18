CREATE TABLE "goals" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"label" text NOT NULL,
	"target" double precision NOT NULL,
	"current" double precision NOT NULL,
	"start_value" double precision NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"target_date" timestamp with time zone,
	"last_updated" timestamp with time zone NOT NULL,
	"paused" boolean DEFAULT false NOT NULL,
	"history" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "net_worth_snapshots" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"assets" double precision NOT NULL,
	"liabilities" double precision NOT NULL,
	"net_worth" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roadmap_checks" (
	"user_id" text PRIMARY KEY NOT NULL,
	"checks" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scores" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "goals_user_id_idx" ON "goals" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "net_worth_snapshots_user_id_idx" ON "net_worth_snapshots" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "scores_user_id_idx" ON "scores" USING btree ("user_id");
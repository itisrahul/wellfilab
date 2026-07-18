CREATE TABLE "onboarding" (
	"user_id" text NOT NULL,
	"plan" text NOT NULL,
	"email" text NOT NULL,
	"answers" jsonb NOT NULL,
	"submitted_at" timestamp with time zone NOT NULL,
	CONSTRAINT "onboarding_user_id_plan_pk" PRIMARY KEY("user_id","plan")
);
--> statement-breakpoint
CREATE TABLE "score_inputs" (
	"user_id" text PRIMARY KEY NOT NULL,
	"body" jsonb,
	"finance" jsonb,
	"age" integer,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

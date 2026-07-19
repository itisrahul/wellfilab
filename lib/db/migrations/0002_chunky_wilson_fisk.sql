CREATE TABLE "tool_views" (
	"slug" text NOT NULL,
	"date" text NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "tool_views_slug_date_pk" PRIMARY KEY("slug","date")
);
--> statement-breakpoint
CREATE INDEX "tool_views_date_idx" ON "tool_views" USING btree ("date");
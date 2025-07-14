ALTER TABLE "fragments" ALTER COLUMN "files" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "user_id" text NOT NULL;
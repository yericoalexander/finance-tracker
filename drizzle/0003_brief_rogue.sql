ALTER TABLE "reminder_settings" ADD COLUMN "early_warning_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "reminder_settings" ADD COLUMN "last_alert_milestone" text;
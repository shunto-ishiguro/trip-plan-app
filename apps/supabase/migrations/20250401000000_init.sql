CREATE TYPE "public"."budget_category" AS ENUM('transport', 'accommodation', 'food', 'activity', 'other');
CREATE TYPE "public"."checklist_type" AS ENUM('packing', 'todo');
CREATE TYPE "public"."pricing_type" AS ENUM('total', 'per_person');
CREATE TYPE "public"."reservation_type" AS ENUM('flight', 'hotel', 'rental_car', 'restaurant', 'activity', 'other');
CREATE TYPE "public"."share_permission" AS ENUM('view', 'edit');

CREATE TABLE "trips" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"destination" text NOT NULL,
	"start_date" text NOT NULL,
	"end_date" text NOT NULL,
	"member_count" integer DEFAULT 1 NOT NULL,
	"memo" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "spots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_id" uuid NOT NULL,
	"day_index" integer NOT NULL,
	"order" integer NOT NULL,
	"name" text NOT NULL,
	"address" text,
	"start_time" text,
	"end_time" text,
	"memo" text,
	"latitude" double precision,
	"longitude" double precision
);

CREATE TABLE "budget_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_id" uuid NOT NULL,
	"category" "budget_category" NOT NULL,
	"name" text NOT NULL,
	"amount" integer NOT NULL,
	"pricing_type" "pricing_type" NOT NULL,
	"memo" text
);

CREATE TABLE "checklist_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_id" uuid NOT NULL,
	"type" "checklist_type" NOT NULL,
	"text" text NOT NULL,
	"checked" boolean DEFAULT false NOT NULL
);

CREATE TABLE "reservations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_id" uuid NOT NULL,
	"type" "reservation_type" NOT NULL,
	"name" text NOT NULL,
	"confirmation_number" text,
	"datetime" text,
	"link" text,
	"memo" text
);

CREATE TABLE "share_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_id" uuid NOT NULL,
	"share_url" text NOT NULL,
	"permission" "share_permission" DEFAULT 'view' NOT NULL,
	CONSTRAINT "share_settings_trip_id_unique" UNIQUE("trip_id")
);

ALTER TABLE "spots" ADD CONSTRAINT "spots_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "budget_items" ADD CONSTRAINT "budget_items_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "checklist_items" ADD CONSTRAINT "checklist_items_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "share_settings" ADD CONSTRAINT "share_settings_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;

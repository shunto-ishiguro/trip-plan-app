-- ============================================================
-- Collaborative editing: auth, roles, sharing
-- ============================================================

-- 1a. trips に owner_id 追加
ALTER TABLE "trips" ADD COLUMN "owner_id" uuid REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX "trips_owner_id_idx" ON "trips" ("owner_id");

-- 1b. trip_members テーブル
CREATE TYPE "public"."trip_role" AS ENUM('owner', 'editor', 'viewer');

CREATE TABLE "trip_members" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "trip_id" uuid NOT NULL REFERENCES "public"."trips"("id") ON DELETE CASCADE,
  "user_id" uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "role" "trip_role" NOT NULL DEFAULT 'viewer',
  "joined_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "trip_members_trip_user_unique" UNIQUE("trip_id", "user_id")
);
CREATE INDEX "trip_members_user_id_idx" ON "trip_members" ("user_id");
CREATE INDEX "trip_members_trip_id_idx" ON "trip_members" ("trip_id");

-- 1c. share_settings にトークン列追加
ALTER TABLE "share_settings"
  ADD COLUMN "share_token" text UNIQUE,
  ADD COLUMN "is_active" boolean NOT NULL DEFAULT true,
  ADD COLUMN "created_by" uuid REFERENCES auth.users(id) ON DELETE SET NULL;

UPDATE "share_settings" SET "share_token" = encode(gen_random_bytes(24), 'base64url') WHERE "share_token" IS NULL;
ALTER TABLE "share_settings" ALTER COLUMN "share_token" SET NOT NULL;
CREATE INDEX "share_settings_token_idx" ON "share_settings" ("share_token");

CREATE TYPE "public"."attendance_status" AS ENUM('ON_TIME', 'LATE', 'ABSENT');--> statement-breakpoint
CREATE TYPE "public"."buddy_role" AS ENUM('PRIMARY', 'ASSISTANT');--> statement-breakpoint
CREATE TYPE "public"."game_session_status" AS ENUM('PENDING', 'READY', 'ACTIVE', 'PAUSED', 'COMPLETED', 'EXPIRED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."game_status" AS ENUM('DRAFT', 'ACTIVE', 'INACTIVE');--> statement-breakpoint
CREATE TYPE "public"."game_type" AS ENUM('QUIZ', 'PUZZLE', 'MEMORY', 'REACTION', 'RAPID_ANSWER', 'SEQUENCE', 'WORD_GAME', 'IMAGE_GUESS', 'LOGIC', 'TEAM_CHALLENGE', 'EXPLORATION', 'FLAPPY_BIRD');--> statement-breakpoint
CREATE TYPE "public"."location_status" AS ENUM('AVAILABLE', 'RESERVED', 'OCCUPIED', 'COMPLETED', 'LOCKED');--> statement-breakpoint
CREATE TYPE "public"."mission_status" AS ENUM('ACTIVE', 'INACTIVE');--> statement-breakpoint
CREATE TYPE "public"."mission_type" AS ENUM('MAIN', 'SIDE_QUEST', 'MYSTERY_EGG');--> statement-breakpoint
CREATE TYPE "public"."question_difficulty" AS ENUM('EASY', 'MEDIUM', 'HARD');--> statement-breakpoint
CREATE TYPE "public"."question_status" AS ENUM('ACTIVE', 'INACTIVE', 'DRAFT');--> statement-breakpoint
CREATE TYPE "public"."question_type" AS ENUM('MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER');--> statement-breakpoint
CREATE TYPE "public"."route_status" AS ENUM('ACTIVE', 'INACTIVE');--> statement-breakpoint
CREATE TYPE "public"."score_source_type" AS ENUM('GAME', 'BONUS', 'PENALTY', 'CORRECTION', 'ACHIEVEMENT');--> statement-breakpoint
CREATE TYPE "public"."stage_status" AS ENUM('UPCOMING', 'ACTIVE', 'COMPLETED');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('ADMIN', 'BUDDY', 'PARTICIPANT');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('ACTIVE', 'INACTIVE');--> statement-breakpoint
CREATE TABLE "achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"condition" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"icon" text,
	"status" "game_status" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attendances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"participant_id" uuid NOT NULL,
	"day" integer NOT NULL,
	"date" varchar(20) NOT NULL,
	"check_in_at" timestamp with time zone,
	"check_in_status" "attendance_status" DEFAULT 'ON_TIME',
	"check_in_qr_token" varchar(255),
	"check_out_at" timestamp with time zone,
	"check_out_qr_token" varchar(255),
	"reflection_submitted" boolean DEFAULT false,
	"xp_awarded" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid,
	"actor_role" "user_role",
	"action" varchar(100) NOT NULL,
	"target_type" varchar(100),
	"target_id" uuid,
	"details" jsonb,
	"ip_address" varchar(45),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_reflections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"participant_id" uuid NOT NULL,
	"day" integer NOT NULL,
	"rating_fasilitas" integer DEFAULT 5 NOT NULL,
	"rating_materi" integer DEFAULT 5 NOT NULL,
	"rating_buddy" integer DEFAULT 5 NOT NULL,
	"essay_insight" text,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fgd_evaluations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar(50) NOT NULL,
	"participant_id" uuid NOT NULL,
	"team_id" uuid,
	"buddy_id" uuid NOT NULL,
	"rubric_scores" jsonb DEFAULT '{"keaktifan":5,"kedalaman":5,"adab":5}'::jsonb NOT NULL,
	"total_score" integer DEFAULT 15 NOT NULL,
	"xp_awarded" integer DEFAULT 150 NOT NULL,
	"feedback_notes" text,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "floors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"number" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "floors_number_unique" UNIQUE("number")
);
--> statement-breakpoint
CREATE TABLE "game_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" uuid NOT NULL,
	"mission_id" uuid,
	"team_id" uuid NOT NULL,
	"location_id" uuid NOT NULL,
	"stage_id" uuid NOT NULL,
	"buddy_id" uuid NOT NULL,
	"status" "game_session_status" DEFAULT 'PENDING' NOT NULL,
	"server_start_at" timestamp with time zone,
	"server_end_at" timestamp with time zone,
	"time_limit" integer,
	"participants" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"result" jsonb,
	"total_score" integer,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"instructions" text,
	"type" "game_type" NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"question_bank_category" varchar(100),
	"min_players" integer DEFAULT 1 NOT NULL,
	"max_players" integer DEFAULT 12 NOT NULL,
	"status" "game_status" DEFAULT 'DRAFT' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"floor_id" uuid NOT NULL,
	"qr_code" varchar(255),
	"capacity" integer DEFAULT 1 NOT NULL,
	"status" "location_status" DEFAULT 'AVAILABLE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "locations_code_unique" UNIQUE("code"),
	CONSTRAINT "locations_qr_code_unique" UNIQUE("qr_code")
);
--> statement-breakpoint
CREATE TABLE "missions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"type" "mission_type" DEFAULT 'MAIN' NOT NULL,
	"location_id" uuid NOT NULL,
	"stage_id" uuid NOT NULL,
	"game_id" uuid,
	"order" integer DEFAULT 1 NOT NULL,
	"is_required" boolean DEFAULT true NOT NULL,
	"time_limit" integer,
	"status" "mission_status" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ormawa_booths" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"short_name" varchar(100),
	"category" varchar(100) NOT NULL,
	"floor_id" uuid,
	"booth_number" varchar(50),
	"description" text,
	"qr_code" varchar(255) NOT NULL,
	"xp_reward" integer DEFAULT 75 NOT NULL,
	"badge_icon" varchar(100) DEFAULT 'Shield',
	"badge_color" varchar(50) DEFAULT '#16a34a',
	"contact_person" varchar(255),
	"instagram" varchar(100),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ormawa_booths_code_unique" UNIQUE("code"),
	CONSTRAINT "ormawa_booths_qr_code_unique" UNIQUE("qr_code")
);
--> statement-breakpoint
CREATE TABLE "ormawa_scans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"participant_id" uuid NOT NULL,
	"booth_id" uuid NOT NULL,
	"xp_earned" integer DEFAULT 75 NOT NULL,
	"scanned_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "participant_achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"participant_id" uuid NOT NULL,
	"achievement_id" uuid NOT NULL,
	"awarded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" varchar(100),
	"difficulty" "question_difficulty" DEFAULT 'MEDIUM' NOT NULL,
	"question_text" text NOT NULL,
	"type" "question_type" DEFAULT 'MULTIPLE_CHOICE' NOT NULL,
	"options" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"correct_answer" text NOT NULL,
	"explanation" text,
	"base_score" integer DEFAULT 10 NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" "question_status" DEFAULT 'ACTIVE' NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "route_stops" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"route_id" uuid NOT NULL,
	"location_id" uuid NOT NULL,
	"order" integer NOT NULL,
	"is_required" boolean DEFAULT true NOT NULL,
	"estimated_duration_min" integer
);
--> statement-breakpoint
CREATE TABLE "routes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"stage_id" uuid NOT NULL,
	"status" "route_status" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "score_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"participant_id" uuid NOT NULL,
	"team_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"source_type" "score_source_type" NOT NULL,
	"source_id" uuid,
	"reason" text,
	"stage_id" uuid,
	"game_session_id" uuid,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"order" integer NOT NULL,
	"status" "stage_status" DEFAULT 'UPCOMING' NOT NULL,
	"start_time" timestamp with time zone,
	"end_time" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"is_captain" boolean DEFAULT false NOT NULL,
	"buddy_role" "buddy_role",
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(50) NOT NULL,
	"captain_id" uuid,
	"route_id" uuid,
	"status" "user_status" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "teams_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(100) NOT NULL,
	"password_hash" text NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"role" "user_role" DEFAULT 'PARTICIPANT' NOT NULL,
	"status" "user_status" DEFAULT 'ACTIVE' NOT NULL,
	"gender" varchar(20) DEFAULT 'MALE',
	"character_class" varchar(100) DEFAULT 'CYBER_KNIGHT',
	"character_title" varchar(150) DEFAULT 'Novice Adventurer',
	"character_tier" integer DEFAULT 1,
	"unlocked_titles" jsonb DEFAULT '["Novice Adventurer"]'::jsonb,
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_participant_id_users_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_reflections" ADD CONSTRAINT "daily_reflections_participant_id_users_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fgd_evaluations" ADD CONSTRAINT "fgd_evaluations_participant_id_users_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fgd_evaluations" ADD CONSTRAINT "fgd_evaluations_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fgd_evaluations" ADD CONSTRAINT "fgd_evaluations_buddy_id_users_id_fk" FOREIGN KEY ("buddy_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_sessions" ADD CONSTRAINT "game_sessions_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_sessions" ADD CONSTRAINT "game_sessions_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_sessions" ADD CONSTRAINT "game_sessions_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_sessions" ADD CONSTRAINT "game_sessions_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_sessions" ADD CONSTRAINT "game_sessions_stage_id_stages_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."stages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_sessions" ADD CONSTRAINT "game_sessions_buddy_id_users_id_fk" FOREIGN KEY ("buddy_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "locations" ADD CONSTRAINT "locations_floor_id_floors_id_fk" FOREIGN KEY ("floor_id") REFERENCES "public"."floors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "missions" ADD CONSTRAINT "missions_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "missions" ADD CONSTRAINT "missions_stage_id_stages_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."stages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "missions" ADD CONSTRAINT "missions_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ormawa_booths" ADD CONSTRAINT "ormawa_booths_floor_id_floors_id_fk" FOREIGN KEY ("floor_id") REFERENCES "public"."floors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ormawa_scans" ADD CONSTRAINT "ormawa_scans_participant_id_users_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ormawa_scans" ADD CONSTRAINT "ormawa_scans_booth_id_ormawa_booths_id_fk" FOREIGN KEY ("booth_id") REFERENCES "public"."ormawa_booths"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participant_achievements" ADD CONSTRAINT "participant_achievements_participant_id_users_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participant_achievements" ADD CONSTRAINT "participant_achievements_achievement_id_achievements_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "route_stops" ADD CONSTRAINT "route_stops_route_id_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "route_stops" ADD CONSTRAINT "route_stops_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routes" ADD CONSTRAINT "routes_stage_id_stages_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."stages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "score_transactions" ADD CONSTRAINT "score_transactions_participant_id_users_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "score_transactions" ADD CONSTRAINT "score_transactions_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "score_transactions" ADD CONSTRAINT "score_transactions_stage_id_stages_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."stages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "score_transactions" ADD CONSTRAINT "score_transactions_game_session_id_game_sessions_id_fk" FOREIGN KEY ("game_session_id") REFERENCES "public"."game_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "score_transactions" ADD CONSTRAINT "score_transactions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_captain_id_users_id_fk" FOREIGN KEY ("captain_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_route_id_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "attendances_participant_day_unique" ON "attendances" USING btree ("participant_id","day");--> statement-breakpoint
CREATE INDEX "attendances_participant_idx" ON "attendances" USING btree ("participant_id");--> statement-breakpoint
CREATE INDEX "attendances_date_idx" ON "attendances" USING btree ("date");--> statement-breakpoint
CREATE INDEX "audit_logs_actor_idx" ON "audit_logs" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "audit_logs_created_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "daily_reflections_participant_day_unique" ON "daily_reflections" USING btree ("participant_id","day");--> statement-breakpoint
CREATE INDEX "daily_reflections_participant_idx" ON "daily_reflections" USING btree ("participant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "fgd_eval_session_participant_unique" ON "fgd_evaluations" USING btree ("session_id","participant_id");--> statement-breakpoint
CREATE INDEX "fgd_eval_participant_idx" ON "fgd_evaluations" USING btree ("participant_id");--> statement-breakpoint
CREATE INDEX "fgd_eval_team_idx" ON "fgd_evaluations" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "game_sessions_team_idx" ON "game_sessions" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "game_sessions_game_idx" ON "game_sessions" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "game_sessions_status_idx" ON "game_sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "locations_floor_idx" ON "locations" USING btree ("floor_id");--> statement-breakpoint
CREATE INDEX "missions_location_idx" ON "missions" USING btree ("location_id");--> statement-breakpoint
CREATE INDEX "missions_stage_idx" ON "missions" USING btree ("stage_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ormawa_scans_unique" ON "ormawa_scans" USING btree ("participant_id","booth_id");--> statement-breakpoint
CREATE INDEX "ormawa_scans_participant_idx" ON "ormawa_scans" USING btree ("participant_id");--> statement-breakpoint
CREATE INDEX "ormawa_scans_booth_idx" ON "ormawa_scans" USING btree ("booth_id");--> statement-breakpoint
CREATE UNIQUE INDEX "participant_achievements_unique" ON "participant_achievements" USING btree ("participant_id","achievement_id");--> statement-breakpoint
CREATE INDEX "questions_category_idx" ON "questions" USING btree ("category");--> statement-breakpoint
CREATE INDEX "questions_difficulty_idx" ON "questions" USING btree ("difficulty");--> statement-breakpoint
CREATE UNIQUE INDEX "route_stops_unique" ON "route_stops" USING btree ("route_id","order");--> statement-breakpoint
CREATE INDEX "route_stops_route_idx" ON "route_stops" USING btree ("route_id");--> statement-breakpoint
CREATE INDEX "score_tx_participant_idx" ON "score_transactions" USING btree ("participant_id");--> statement-breakpoint
CREATE INDEX "score_tx_team_idx" ON "score_transactions" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "score_tx_stage_idx" ON "score_transactions" USING btree ("stage_id");--> statement-breakpoint
CREATE UNIQUE INDEX "team_members_unique" ON "team_members" USING btree ("team_id","user_id");
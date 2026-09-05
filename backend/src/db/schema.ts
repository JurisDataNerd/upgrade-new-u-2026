import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

// ============================================================
// Enums
// ============================================================

export const userRoleEnum = pgEnum("user_role", ["ADMIN", "BUDDY", "PARTICIPANT"]);
export const userStatusEnum = pgEnum("user_status", ["ACTIVE", "INACTIVE"]);
export const buddyRoleEnum = pgEnum("buddy_role", ["PRIMARY", "ASSISTANT"]);
export const stageStatusEnum = pgEnum("stage_status", ["UPCOMING", "ACTIVE", "COMPLETED"]);
export const locationStatusEnum = pgEnum("location_status", [
  "AVAILABLE", "RESERVED", "OCCUPIED", "COMPLETED", "LOCKED",
]);
export const missionTypeEnum = pgEnum("mission_type", ["MAIN", "SIDE_QUEST", "MYSTERY_EGG"]);
export const missionStatusEnum = pgEnum("mission_status", ["ACTIVE", "INACTIVE"]);
export const gameTypeEnum = pgEnum("game_type", [
  "QUIZ", "PUZZLE", "MEMORY", "REACTION", "RAPID_ANSWER",
  "SEQUENCE", "WORD_GAME", "IMAGE_GUESS", "LOGIC",
  "TEAM_CHALLENGE", "EXPLORATION", "FLAPPY_BIRD",
]);
export const gameStatusEnum = pgEnum("game_status", ["DRAFT", "ACTIVE", "INACTIVE"]);
export const gameSessionStatusEnum = pgEnum("game_session_status", [
  "PENDING", "READY", "ACTIVE", "PAUSED", "COMPLETED", "EXPIRED", "CANCELLED",
]);
export const questionDifficultyEnum = pgEnum("question_difficulty", ["EASY", "MEDIUM", "HARD"]);
export const questionTypeEnum = pgEnum("question_type", [
  "MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER",
]);
export const questionStatusEnum = pgEnum("question_status", ["ACTIVE", "INACTIVE", "DRAFT"]);
export const scoreSourceTypeEnum = pgEnum("score_source_type", [
  "GAME", "BONUS", "PENALTY", "CORRECTION", "ACHIEVEMENT",
]);
export const routeStatusEnum = pgEnum("route_status", ["ACTIVE", "INACTIVE"]);
export const attendanceStatusEnum = pgEnum("attendance_status", ["ON_TIME", "LATE", "ABSENT"]);

// ============================================================
// Tables
// ============================================================

// --- Users ---
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  role: userRoleEnum("role").notNull().default("PARTICIPANT"),
  status: userStatusEnum("status").notNull().default("ACTIVE"),
  gender: varchar("gender", { length: 20 }).default("MALE"),
  characterClass: varchar("character_class", { length: 100 }).default("CYBER_KNIGHT"),
  characterTitle: varchar("character_title", { length: 150 }).default("Novice Adventurer"),
  characterTier: integer("character_tier").default(1),
  unlockedTitles: jsonb("unlocked_titles").$type<string[]>().default(["Novice Adventurer"]),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// --- Teams ---
export const teams = pgTable("teams", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  captainId: uuid("captain_id").references(() => users.id),
  routeId: uuid("route_id").references(() => routes.id),
  status: userStatusEnum("status").notNull().default("ACTIVE"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// --- Team Members (participants assigned to teams) ---
export const teamMembers = pgTable("team_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  teamId: uuid("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  isCaptain: boolean("is_captain").notNull().default(false),
  buddyRole: buddyRoleEnum("buddy_role"), // null for participants, PRIMARY/ASSISTANT for buddies
  joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("team_members_unique").on(table.teamId, table.userId),
]);

// --- Stages ---
export const stages = pgTable("stages", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  order: integer("order").notNull(),
  status: stageStatusEnum("status").notNull().default("UPCOMING"),
  startTime: timestamp("start_time", { withTimezone: true }),
  endTime: timestamp("end_time", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// --- Floors ---
export const floors = pgTable("floors", {
  id: uuid("id").defaultRandom().primaryKey(),
  number: integer("number").notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// --- Locations ---
export const locations = pgTable("locations", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  floorId: uuid("floor_id").notNull().references(() => floors.id, { onDelete: "cascade" }),
  qrCode: varchar("qr_code", { length: 255 }).unique(),
  capacity: integer("capacity").notNull().default(1),
  status: locationStatusEnum("status").notNull().default("AVAILABLE"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("locations_floor_idx").on(table.floorId),
]);

// --- Routes ---
export const routes = pgTable("routes", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  stageId: uuid("stage_id").notNull().references(() => stages.id, { onDelete: "cascade" }),
  status: routeStatusEnum("status").notNull().default("ACTIVE"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// --- Route Stops ---
export const routeStops = pgTable("route_stops", {
  id: uuid("id").defaultRandom().primaryKey(),
  routeId: uuid("route_id").notNull().references(() => routes.id, { onDelete: "cascade" }),
  locationId: uuid("location_id").notNull().references(() => locations.id, { onDelete: "cascade" }),
  order: integer("order").notNull(),
  isRequired: boolean("is_required").notNull().default(true),
  estimatedDurationMin: integer("estimated_duration_min"),
}, (table) => [
  uniqueIndex("route_stops_unique").on(table.routeId, table.order),
  index("route_stops_route_idx").on(table.routeId),
]);

// --- Games (definitions/templates) ---
export const games = pgTable("games", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  instructions: text("instructions"),
  type: gameTypeEnum("type").notNull(),
  config: jsonb("config").notNull().default({}),
  questionBankCategory: varchar("question_bank_category", { length: 100 }),
  minPlayers: integer("min_players").notNull().default(1),
  maxPlayers: integer("max_players").notNull().default(12),
  status: gameStatusEnum("status").notNull().default("DRAFT"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// --- Missions ---
export const missions = pgTable("missions", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: missionTypeEnum("type").notNull().default("MAIN"),
  locationId: uuid("location_id").notNull().references(() => locations.id, { onDelete: "cascade" }),
  stageId: uuid("stage_id").notNull().references(() => stages.id, { onDelete: "cascade" }),
  gameId: uuid("game_id").references(() => games.id),
  order: integer("order").notNull().default(1),
  isRequired: boolean("is_required").notNull().default(true),
  timeLimit: integer("time_limit"), // seconds
  status: missionStatusEnum("status").notNull().default("ACTIVE"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("missions_location_idx").on(table.locationId),
  index("missions_stage_idx").on(table.stageId),
]);

// --- Game Sessions ---
export const gameSessions = pgTable("game_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  gameId: uuid("game_id").notNull().references(() => games.id),
  missionId: uuid("mission_id").references(() => missions.id),
  teamId: uuid("team_id").notNull().references(() => teams.id),
  locationId: uuid("location_id").notNull().references(() => locations.id),
  stageId: uuid("stage_id").notNull().references(() => stages.id),
  buddyId: uuid("buddy_id").notNull().references(() => users.id),
  status: gameSessionStatusEnum("status").notNull().default("PENDING"),
  serverStartAt: timestamp("server_start_at", { withTimezone: true }),
  serverEndAt: timestamp("server_end_at", { withTimezone: true }),
  timeLimit: integer("time_limit"), // seconds
  participants: jsonb("participants").notNull().default([]),
  result: jsonb("result"),
  totalScore: integer("total_score"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("game_sessions_team_idx").on(table.teamId),
  index("game_sessions_game_idx").on(table.gameId),
  index("game_sessions_status_idx").on(table.status),
]);

// --- Questions (Question Bank) ---
export const questions = pgTable("questions", {
  id: uuid("id").defaultRandom().primaryKey(),
  category: varchar("category", { length: 100 }),
  difficulty: questionDifficultyEnum("difficulty").notNull().default("MEDIUM"),
  questionText: text("question_text").notNull(),
  type: questionTypeEnum("type").notNull().default("MULTIPLE_CHOICE"),
  options: jsonb("options").notNull().default([]),
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation"),
  baseScore: integer("base_score").notNull().default(10),
  tags: jsonb("tags").notNull().default([]),
  status: questionStatusEnum("status").notNull().default("ACTIVE"),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("questions_category_idx").on(table.category),
  index("questions_difficulty_idx").on(table.difficulty),
]);

// --- Score Transactions ---
export const scoreTransactions = pgTable("score_transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  participantId: uuid("participant_id").notNull().references(() => users.id),
  teamId: uuid("team_id").notNull().references(() => teams.id),
  amount: integer("amount").notNull(),
  sourceType: scoreSourceTypeEnum("source_type").notNull(),
  sourceId: uuid("source_id"), // reference to game_session, etc.
  reason: text("reason"),
  stageId: uuid("stage_id").references(() => stages.id),
  gameSessionId: uuid("game_session_id").references(() => gameSessions.id),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("score_tx_participant_idx").on(table.participantId),
  index("score_tx_team_idx").on(table.teamId),
  index("score_tx_stage_idx").on(table.stageId),
]);

// --- Achievements ---
export const achievements = pgTable("achievements", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  condition: jsonb("condition").notNull().default({}),
  icon: text("icon"),
  status: gameStatusEnum("status").notNull().default("ACTIVE"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// --- Participant Achievements ---
export const participantAchievements = pgTable("participant_achievements", {
  id: uuid("id").defaultRandom().primaryKey(),
  participantId: uuid("participant_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  achievementId: uuid("achievement_id").notNull().references(() => achievements.id, { onDelete: "cascade" }),
  awardedAt: timestamp("awarded_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("participant_achievements_unique").on(table.participantId, table.achievementId),
]);

// --- Audit Logs ---
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  actorId: uuid("actor_id").references(() => users.id),
  actorRole: userRoleEnum("actor_role"),
  action: varchar("action", { length: 100 }).notNull(),
  targetType: varchar("target_type", { length: 100 }),
  targetId: uuid("target_id"),
  details: jsonb("details"),
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("audit_logs_actor_idx").on(table.actorId),
  index("audit_logs_created_idx").on(table.createdAt),
]);

// ============================================================
// Event Flow Tables (PKKMB 3-Day Program: Presensi, FGD, Ormawa, Refleksi)
// ============================================================

// --- Attendances (Presensi Harian Hari 1, 2, 3) ---
export const attendances = pgTable("attendances", {
  id: uuid("id").defaultRandom().primaryKey(),
  participantId: uuid("participant_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  day: integer("day").notNull(), // 1, 2, 3
  date: varchar("date", { length: 20 }).notNull(), // e.g. "2026-09-22"
  checkInAt: timestamp("check_in_at", { withTimezone: true }),
  checkInStatus: attendanceStatusEnum("check_in_status").default("ON_TIME"),
  checkInQrToken: varchar("check_in_qr_token", { length: 255 }),
  checkOutAt: timestamp("check_out_at", { withTimezone: true }),
  checkOutQrToken: varchar("check_out_qr_token", { length: 255 }),
  reflectionSubmitted: boolean("reflection_submitted").default(false),
  xpAwarded: integer("xp_awarded").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("attendances_participant_day_unique").on(table.participantId, table.day),
  index("attendances_participant_idx").on(table.participantId),
  index("attendances_date_idx").on(table.date),
]);

// --- FGD Evaluations (Penilaian Rubrik Diskusi oleh Buddy) ---
export const fgdEvaluations = pgTable("fgd_evaluations", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: varchar("session_id", { length: 50 }).notNull(), // e.g. "FGD-1", "FGD-2", "FGD-6"
  participantId: uuid("participant_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  teamId: uuid("team_id").references(() => teams.id, { onDelete: "cascade" }),
  buddyId: uuid("buddy_id").notNull().references(() => users.id),
  rubricScores: jsonb("rubric_scores").notNull().default({ keaktifan: 5, kedalaman: 5, adab: 5 }),
  totalScore: integer("total_score").notNull().default(15),
  xpAwarded: integer("xp_awarded").notNull().default(150),
  feedbackNotes: text("feedback_notes"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("fgd_eval_session_participant_unique").on(table.sessionId, table.participantId),
  index("fgd_eval_participant_idx").on(table.participantId),
  index("fgd_eval_team_idx").on(table.teamId),
]);

// --- Ormawa Booths (Stand Expo UKM / Organisasi Mahasiswa Hari 3) ---
export const ormawaBooths = pgTable("ormawa_booths", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(), // e.g. "ORMAWA-SILAT"
  name: varchar("name", { length: 255 }).notNull(),
  shortName: varchar("short_name", { length: 100 }),
  category: varchar("category", { length: 100 }).notNull(), // Olahraga, Seni, Penalaran, Keagamaan
  floorId: uuid("floor_id").references(() => floors.id),
  boothNumber: varchar("booth_number", { length: 50 }),
  description: text("description"),
  qrCode: varchar("qr_code", { length: 255 }).notNull().unique(),
  xpReward: integer("xp_reward").notNull().default(75),
  badgeIcon: varchar("badge_icon", { length: 100 }).default("Shield"),
  badgeColor: varchar("badge_color", { length: 50 }).default("#16a34a"),
  contactPerson: varchar("contact_person", { length: 255 }),
  instagram: varchar("instagram", { length: 100 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// --- Ormawa Scans (Log Kunjungan Mahasiswa ke Booth UKM) ---
export const ormawaScans = pgTable("ormawa_scans", {
  id: uuid("id").defaultRandom().primaryKey(),
  participantId: uuid("participant_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  boothId: uuid("booth_id").notNull().references(() => ormawaBooths.id, { onDelete: "cascade" }),
  xpEarned: integer("xp_earned").notNull().default(75),
  scannedAt: timestamp("scanned_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("ormawa_scans_unique").on(table.participantId, table.boothId),
  index("ormawa_scans_participant_idx").on(table.participantId),
  index("ormawa_scans_booth_idx").on(table.boothId),
]);

// --- Daily Reflections (Kuesioner Refleksi & Evaluasi Harian) ---
export const dailyReflections = pgTable("daily_reflections", {
  id: uuid("id").defaultRandom().primaryKey(),
  participantId: uuid("participant_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  day: integer("day").notNull(), // 1, 2, 3
  ratingFasilitas: integer("rating_fasilitas").notNull().default(5),
  ratingMateri: integer("rating_materi").notNull().default(5),
  ratingBuddy: integer("rating_buddy").notNull().default(5),
  essayInsight: text("essay_insight"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("daily_reflections_participant_day_unique").on(table.participantId, table.day),
  index("daily_reflections_participant_idx").on(table.participantId),
]);


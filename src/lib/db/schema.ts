import { relations } from 'drizzle-orm'
import {
  boolean,
  index,
  integer,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

// ── users ──────────────────────────────────────────────────────────────────
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  googleSub: text('google_sub').unique().notNull(),
  sheetId: text('sheet_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// ── google_tokens ──────────────────────────────────────────────────────────
export const googleTokens = pgTable('google_tokens', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  refreshTokenEncrypted: text('refresh_token_encrypted').notNull(),
  iv: text('iv').notNull(),
  authTag: text('auth_tag').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// ── pairing_codes ──────────────────────────────────────────────────────────
// Kode pairing 8 karakter berlaku 10 menit; hanya hash yang disimpan
export const pairingCodes = pgTable('pairing_codes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  codeHash: text('code_hash').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  usedAt: timestamp('used_at', { withTimezone: true }),
})

// ── devices ────────────────────────────────────────────────────────────────
// Perangkat iOS yang terhubung; hanya token_hash (SHA-256) yang disimpan
export const devices = pgTable('devices', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull().unique(),
  label: text('label').notNull(),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// ── captures ───────────────────────────────────────────────────────────────
// Catatan pemrosesan screenshot untuk audit dan deteksi duplikasi
export const captures = pgTable(
  'captures',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    deviceId: uuid('device_id').references(() => devices.id, { onDelete: 'set null' }),
    imageHash: text('image_hash').notNull(),
    status: text('status').notNull(), // 'ok' | 'needs_review' | 'failed' | 'duplicate'
    confidence: real('confidence'),
    merchant: text('merchant'),
    amountIdr: integer('amount_idr'),
    category: text('category'),
    txDate: text('tx_date'),
    sheetRowId: text('sheet_row_id'),
    errorCode: text('error_code'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('captures_user_id_image_hash_idx').on(table.userId, table.imageHash),
    index('captures_user_id_status_created_idx').on(table.userId, table.status, table.createdAt),
  ],
)

// ── reminder_settings ──────────────────────────────────────────────────────
// Pengaturan pengingat / limit budget pengeluaran per pengguna
export const reminderSettings = pgTable('reminder_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  monthlyLimitIdr: integer('monthly_limit_idr'),
  customMessage: text('custom_message'),
  earlyWarningEnabled: boolean('early_warning_enabled').notNull().default(true),
  warningThresholdPercent: integer('warning_threshold_percent').notNull().default(90),
  lastAlertMilestone: text('last_alert_milestone'),
  isEnabled: boolean('is_enabled').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// ── Relations ──────────────────────────────────────────────────────────────
export const usersRelations = relations(users, ({ one, many }) => ({
  googleToken: one(googleTokens, {
    fields: [users.id],
    references: [googleTokens.userId],
  }),
  reminderSetting: one(reminderSettings, {
    fields: [users.id],
    references: [reminderSettings.userId],
  }),
  pairingCodes: many(pairingCodes),
  devices: many(devices),
  captures: many(captures),
}))

export const reminderSettingsRelations = relations(reminderSettings, ({ one }) => ({
  user: one(users, {
    fields: [reminderSettings.userId],
    references: [users.id],
  }),
}))

export const googleTokensRelations = relations(googleTokens, ({ one }) => ({
  user: one(users, {
    fields: [googleTokens.userId],
    references: [users.id],
  }),
}))

export const pairingCodesRelations = relations(pairingCodes, ({ one }) => ({
  user: one(users, {
    fields: [pairingCodes.userId],
    references: [users.id],
  }),
}))

export const devicesRelations = relations(devices, ({ one, many }) => ({
  user: one(users, {
    fields: [devices.userId],
    references: [users.id],
  }),
  captures: many(captures),
}))

export const capturesRelations = relations(captures, ({ one }) => ({
  user: one(users, {
    fields: [captures.userId],
    references: [users.id],
  }),
  device: one(devices, {
    fields: [captures.deviceId],
    references: [devices.id],
  }),
}))

// ── Type exports ───────────────────────────────────────────────────────────
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type GoogleToken = typeof googleTokens.$inferSelect
export type PairingCode = typeof pairingCodes.$inferSelect
export type NewPairingCode = typeof pairingCodes.$inferInsert
export type Device = typeof devices.$inferSelect
export type NewDevice = typeof devices.$inferInsert
export type Capture = typeof captures.$inferSelect
export type NewCapture = typeof captures.$inferInsert
export type ReminderSetting = typeof reminderSettings.$inferSelect
export type NewReminderSetting = typeof reminderSettings.$inferInsert

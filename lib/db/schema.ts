import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  date,
  varchar,
  integer,
  real,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  memberCode: text('member_code').notNull().unique(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  fullName: text('full_name').notNull(),
  avatarUrl: text('avatar_url'),
  phoneNumber: text('phone_number'),
  isPhoneVerified: boolean('is_phone_verified').notNull().default(false),
  isEmailVerified: boolean('is_email_verified').notNull().default(false),
  emailVerifyToken: text('email_verify_token'),
  vipTier: text('vip_tier').notNull().default('FREE'), // 'FREE' | 'VIP'
  vipExpiresAt: timestamp('vip_expires_at', { withTimezone: true }),
  role: text('role').notNull().default('USER'), // 'USER' | 'ADMIN'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const fengShuiDaily = pgTable('feng_shui_daily', {
  id: uuid('id').defaultRandom().primaryKey(),
  targetDate: date('target_date').notNull().unique(),
  luckyPair: varchar('lucky_pair', { length: 2 }).notNull(),
  isManualOverride: boolean('is_manual_override').notNull().default(false),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const lotteryTickets = pgTable('lottery_tickets', {
  id: uuid('id').defaultRandom().primaryKey(),
  province: text('province').notNull(),
  drawDate: date('draw_date').notNull(),
  ticketNumber: varchar('ticket_number', { length: 6 }).notNull(),
  imageUrl: text('image_url').notNull(),
  availableQty: integer('available_qty').notNull().default(16),
  pricePerTicket: integer('price_per_ticket').notNull().default(10000),
  showBadge: boolean('show_badge').notNull().default(false),
  badgeText: text('badge_text'),
  status: text('status').notNull().default('AVAILABLE'), // 'AVAILABLE' | 'SOLD_OUT'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const ticketOrders = pgTable('ticket_orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderCode: text('order_code').notNull().unique(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  ticketId: uuid('ticket_id').references(() => lotteryTickets.id, { onDelete: 'set null' }),
  ticketNumber: varchar('ticket_number', { length: 6 }).notNull(),
  province: text('province').notNull(),
  drawDate: date('draw_date').notNull(),
  quantity: integer('quantity').notNull(),
  totalAmount: integer('total_amount').notNull(),
  shippingFee: integer('shipping_fee').notNull().default(0),
  deliveryMethod: text('delivery_method').notNull(), // 'SAFE_KEEPING' | 'EXPRESS_9KM'
  deliveryAddress: text('delivery_address'),
  customerName: text('customer_name'),
  customerPhone: text('customer_phone'),
  distanceKm: real('distance_km'),
  paymentMethod: text('payment_method').notNull(), // 'BANK_TRANSFER' | 'MOMO' | 'COD'
  paymentStatus: text('payment_status').notNull().default('PENDING'), // 'PENDING' | 'PAID'
  safeKeepingPhotoUrl: text('safe_keeping_photo_url'),
  prizeStatus: text('prize_status').notNull().default('WAITING'), // 'WAITING' | 'WON' | 'LOST'
  wonPrizeDetail: text('won_prize_detail'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const vipSubscriptions = pgTable('vip_subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  planMonths: integer('plan_months').notNull(),
  paidMonths: integer('paid_months').notNull(),
  discountPercent: integer('discount_percent').notNull().default(0),
  amountPaid: integer('amount_paid').notNull(),
  status: text('status').notNull().default('ACTIVE'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const lotteryDrawsCache = pgTable('lottery_draws_cache', {
  id: uuid('id').defaultRandom().primaryKey(),
  drawDate: date('draw_date').notNull(), // YYYY-MM-DD
  region: text('region').notNull(), // 'south' | 'central' | 'north'
  resultsJson: text('results_json').notNull(),
  isComplete: boolean('is_complete').notNull().default(false),
  source: text('source').notNull().default('xosoapi.online'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

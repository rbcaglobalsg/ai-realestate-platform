import { pgTable, uuid, varchar, text, timestamp, integer, bigint, boolean, decimal } from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  company: varchar('company', { length: 200 }),
  plan: varchar('plan', { length: 20 }).default('free'), // free | starter | pro | business
  aiCreditsUsed: integer('ai_credits_used').default(0),
  aiCreditsLimit: integer('ai_credits_limit').default(5), // free: 5, starter: 10, pro: unlimited(-1), business: unlimited(-1)
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Projects table
export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  location: varchar('location', { length: 500 }),
  latitude: decimal('latitude', { precision: 10, scale: 7 }),
  longitude: decimal('longitude', { precision: 10, scale: 7 }),
  landArea: decimal('land_area', { precision: 15, scale: 2 }),
  buildingHeight: decimal('building_height', { precision: 8, scale: 2 }),
  expectedFloors: integer('expected_floors'),
  landCost: bigint('land_cost', { mode: 'number' }),
  constructionCost: bigint('construction_cost', { mode: 'number' }),
  expectedSalePrice: bigint('expected_sale_price', { mode: 'number' }),
  loanRate: decimal('loan_rate', { precision: 5, scale: 2 }),
  loanTerm: integer('loan_term'),
  status: varchar('status', { length: 20 }).default('planning'), // planning | in-progress | completed
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Design generations table
export const designs = pgTable('designs', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').references(() => projects.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  prompt: text('prompt').notNull(),
  type: varchar('type', { length: 20 }).default('image'), // image | 3d | video
  model: varchar('model', { length: 100 }),
  resultUrl: text('result_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Real transaction data cache
export const realTransactions = pgTable('real_transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  regionCode: varchar('region_code', { length: 10 }).notNull(),
  regionName: varchar('region_name', { length: 100 }).notNull(),
  propertyType: varchar('property_type', { length: 20 }).notNull(), // apt | rowhouse | detached | officetel | land | commercial
  dealType: varchar('deal_type', { length: 10 }).notNull(), // sale | lease | rent
  dealAmount: bigint('deal_amount', { mode: 'number' }),
  area: decimal('area', { precision: 10, scale: 2 }),
  buildYear: integer('build_year'),
  dealYear: integer('deal_year').notNull(),
  dealMonth: integer('deal_month').notNull(),
  dealDay: integer('deal_day'),
  floor: integer('floor'),
  rawData: text('raw_data'), // original XML/JSON response
  fetchedAt: timestamp('fetched_at').defaultNow().notNull(),
});

// Subscriptions (Toss Payments)
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  tossPaymentKey: varchar('toss_payment_key', { length: 200 }),
  tossOrderId: varchar('toss_order_id', { length: 200 }),
  plan: varchar('plan', { length: 20 }).notNull(),
  amount: integer('amount').notNull(), // in won
  status: varchar('status', { length: 20 }).default('active'), // active | cancelled | expired
  startedAt: timestamp('started_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),
  cancelledAt: timestamp('cancelled_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Building registry cache
export const buildingRegistry = pgTable('building_registry', {
  id: uuid('id').defaultRandom().primaryKey(),
  sigunguCode: varchar('sigungu_code', { length: 5 }).notNull(),
  bun: varchar('bun', { length: 4 }).notNull(),
  ji: varchar('ji', { length: 4 }).notNull(),
  buildingName: varchar('building_name', { length: 200 }),
  mainPurpose: varchar('main_purpose', { length: 100 }),
  totalFloorArea: decimal('total_floor_area', { precision: 15, scale: 2 }),
  structureType: varchar('structure_type', { length: 100 }),
  approvalDate: varchar('approval_date', { length: 10 }),
  rawData: text('raw_data'),
  fetchedAt: timestamp('fetched_at').defaultNow().notNull(),
});

// Land price (공시지가) cache
export const landPrices = pgTable('land_prices', {
  id: uuid('id').defaultRandom().primaryKey(),
  pnu: varchar('pnu', { length: 19 }).notNull(), // 필지고유번호
  publicPrice: bigint('public_price', { mode: 'number' }), // 공시지가 (원/㎡)
  year: integer('year').notNull(),
  rawData: text('raw_data'),
  fetchedAt: timestamp('fetched_at').defaultNow().notNull(),
});

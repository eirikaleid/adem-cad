import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core'

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const projectFiles = pgTable('project_files', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  filename: varchar('filename', { length: 255 }).notNull(),
  format: varchar('format', { length: 20 }).notNull(), // 'step' | 'gltf' | 'stl' | 'json'
  minioKey: varchar('minio_key', { length: 500 }).notNull(),
  sizeBytes: text('size_bytes').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
export const capsules = sqliteTable(
  'capsules',
  {
    id: text('id').primaryKey(),
    owner: text('owner').notNull(),
    name: text('name').notNull(),
    title: text('title').notNull(),
    date: text('date').notNull(),
    answers: text('answers').notNull(),
    coverId: text('cover_id'),
    revision: integer('revision').notNull().default(1),
    updatedAt: text('updated_at').notNull(),
    deleting: integer('deleting').notNull().default(0),
  },
  (t) => [index('idx_capsules_owner_updated').on(t.owner, t.updatedAt)],
);
export const photos = sqliteTable(
  'photos',
  {
    id: text('id').primaryKey(),
    capsuleId: text('capsule_id')
      .notNull()
      .references(() => capsules.id, { onDelete: 'cascade' }),
    objectKey: text('object_key').notNull(),
    filename: text('filename').notNull(),
    mime: text('mime').notNull(),
    size: integer('size').notNull(),
    caption: text('caption').notNull().default(''),
    createdAt: text('created_at').notNull(),
  },
  (t) => [index('idx_photos_capsule').on(t.capsuleId)],
);

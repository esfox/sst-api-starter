import { sql } from 'kysely';

/** @param {import('kysely').Kysely<unknown>} db */
export async function up(db) {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      "email" VARCHAR(255) UNIQUE NOT NULL,
      "password_hash" VARCHAR,
      "username" VARCHAR(255),
      "first_name" VARCHAR(255),
      "last_name" VARCHAR(255),
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updated_at" TIMESTAMP,
      "deleted_at" TIMESTAMP
    );

    CREATE UNIQUE INDEX "users_email_index" ON users("email");
    CREATE UNIQUE INDEX "users_username_index" ON users("username");
    CREATE INDEX "users_first_name_index" ON users("first_name");
    CREATE INDEX "users_last_name_index" ON users("last_name");
    CREATE INDEX "users_created_at_index" ON users("created_at");
    CREATE INDEX "users_updated_at_index" ON users("updated_at");
    CREATE INDEX "users_deleted_at_index" ON users("deleted_at");

    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
  `.execute(db);
}

/** @param {import('kysely').Kysely<unknown>} db */
export async function down(db) {
  await sql`DROP TABLE IF EXISTS users`.execute(db);
}

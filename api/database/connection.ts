import { Config } from 'sst/node/config';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { type Database } from './schema';

export const database = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: Config.DB_CONNECTION,
    }),
  }),
});

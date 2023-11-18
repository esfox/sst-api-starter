import { ReferenceExpression } from 'kysely';
import { Database } from './schema';

export type DatabaseTable = keyof Database;
export type DatabaseColumn = ReferenceExpression<Database, DatabaseTable>;

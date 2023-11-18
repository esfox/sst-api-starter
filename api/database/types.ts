import { type ReferenceExpression } from 'kysely';
import { type Database } from './schema';

export type DatabaseTable = keyof Database;
export type DatabaseColumn = ReferenceExpression<Database, DatabaseTable>;

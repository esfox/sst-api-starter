import { type ComparisonOperatorExpression, type OrderByDirectionExpression } from 'kysely';
import { type DatabaseColumn } from '../database/types';

export type PaginationParams = {
  page?: number;
  count: number;
};

export type FilterParams = {
  field: DatabaseColumn;
  value: unknown;
  comparison?: ComparisonOperatorExpression;
};

export type SearchParams = {
  term: string;
  fields: DatabaseColumn[];
};

export type SortingParams = {
  field: DatabaseColumn;
  order: OrderByDirectionExpression;
};

import {
  type ComparisonOperatorExpression,
  type DeleteQueryBuilder,
  type ExpressionBuilder,
  type InsertObject,
  type SelectQueryBuilder,
  type UpdateQueryBuilder,
  type UpdateResult,
  type Updateable,
} from 'kysely';
import { database } from '../database/connection';
import { type Database } from '../database/schema';
import { type DatabaseColumn, type DatabaseTable } from '../database/types';
import {
  type FilterParams,
  type PaginationParams,
  type SearchParams,
  type SortingParams,
} from '../types';

type SelectQuery = SelectQueryBuilder<Database, DatabaseTable, object>;
type UpdateQuery = UpdateQueryBuilder<Database, DatabaseTable, DatabaseTable, UpdateResult>;
type DeleteQuery = DeleteQueryBuilder<Database, DatabaseTable, object>;
type InsertData = InsertObject<Database, DatabaseTable>;

export class SqlService<Entity> {
  protected table: DatabaseTable;

  protected primaryKeyColumn: DatabaseColumn = 'id' as DatabaseColumn;

  protected updatedAtColumn?: DatabaseColumn;

  protected deletedAtColumn?: DatabaseColumn;

  constructor({
    table,
    primaryKeyColumn,
    updatedAtColumn,
    deletedAtColumn,
  }: {
    table: DatabaseTable;
    primaryKeyColumn?: DatabaseColumn;
    updatedAtColumn?: DatabaseColumn;
    deletedAtColumn?: DatabaseColumn;
  }) {
    this.table = table;

    if (primaryKeyColumn) {
      this.primaryKeyColumn = primaryKeyColumn;
    }

    if (updatedAtColumn) {
      this.updatedAtColumn = updatedAtColumn;
    }

    if (deletedAtColumn) {
      this.deletedAtColumn = deletedAtColumn;
    }
  }

  private withoutSoftDeletes = (expressionBuilder: ExpressionBuilder<Database, DatabaseTable>) =>
    expressionBuilder(this.deletedAtColumn as DatabaseColumn, 'is', null);

  protected static withPagination(query: SelectQuery, pagination: PaginationParams) {
    const { count, page } = pagination ?? {};
    let newQuery = query;
    if (count) {
      newQuery = newQuery.limit(count);

      if (page) {
        newQuery = newQuery.offset(count * (page - 1));
      }
    }

    return newQuery;
  }

  protected static withFilters(query: SelectQuery, filters: FilterParams[]) {
    let newQuery = query;
    filters.forEach(filter => {
      const { field, value, comparison } = filter;

      if (Array.isArray(value)) {
        newQuery = newQuery.where(field, 'in', value);
      } else {
        newQuery = newQuery.where(field, comparison ?? '=', value);
      }
    });

    return newQuery;
  }

  protected static withSearch(query: SelectQuery, searchParams: SearchParams) {
    const { term, fields } = searchParams;
    let newQuery = query;
    fields.forEach(field => {
      newQuery = newQuery.where(field, 'like', `%${term}%`);
    });

    return newQuery;
  }

  protected static withSorting(query: SelectQuery, sorting: SortingParams[]) {
    let newQuery = query;
    sorting.forEach(sort => {
      newQuery = newQuery.orderBy(sort.field, sort.order);
    });

    return newQuery;
  }

  async create({ data }: { data: InsertData | Record<string, unknown> }) {
    const insertingArray = Array.isArray(data);
    const insertData = insertingArray ? data : [data];
    const result = await database
      .insertInto(this.table)
      .values(insertData)
      .returningAll()
      .execute();

    return result as Entity;
  }

  async findAll(
    args: {
      pagination?: PaginationParams;
      filters?: FilterParams[];
      search?: SearchParams;
      sorting?: SortingParams[];
    } = {}
  ) {
    let query = database.selectFrom(this.table);

    if (this.deletedAtColumn) {
      query = query.where(this.withoutSoftDeletes);
    }

    const { pagination, filters, search, sorting } = args ?? {};
    if (filters) {
      query = SqlService.withFilters(query, filters);
    }

    if (search) {
      query = SqlService.withSearch(query, search);
    }

    /* The query is copied here since the total records query should have
      filters but not sorting, since the query will not work if with sorting. */
    const queryWithFilters = query;

    if (sorting) {
      query = SqlService.withSorting(query, sorting);
    }

    if (pagination) {
      query = SqlService.withPagination(query, pagination);
    }

    const records = await query.selectAll().execute();

    const totalCountResult = await queryWithFilters
      .select(database.fn.countAll().as('count'))
      .executeTakeFirst();

    const totalRecords = totalCountResult?.count ?? 0;

    const returnValue = { records, totalRecords };
    return returnValue;
  }

  async findOne({ id, notFoundReturn }: { id: string; notFoundReturn?: () => unknown }) {
    let query = database
      .selectFrom(this.table)
      .selectAll()
      .where(this.primaryKeyColumn, '=', id)
      .limit(1);

    if (this.deletedAtColumn) {
      query = query.where(this.withoutSoftDeletes);
    }

    const record = await query.executeTakeFirst();

    if (!record && notFoundReturn) {
      return notFoundReturn();
    }

    return record;
  }

  async update({
    id,
    data,
    notFoundReturn,
  }: {
    id: string;
    data: Updateable<Entity>;
    notFoundReturn?: () => unknown;
  }) {
    const setData: Record<string, unknown> = data;
    if (this.updatedAtColumn) {
      setData[this.updatedAtColumn as string] = new Date();
    }

    let query = database
      .updateTable(this.table)
      .set(setData)
      .where(this.primaryKeyColumn, '=', id)
      .returningAll();

    if (this.deletedAtColumn) {
      query = query.where(this.withoutSoftDeletes);
    }

    const record = await query.execute();
    if (!record && notFoundReturn) {
      return notFoundReturn();
    }

    return record[0];
  }

  async delete({
    id,
    softDelete,
    notFoundReturn,
  }: {
    id: string | string[];
    softDelete?: boolean;
    notFoundReturn?: () => unknown;
  }) {
    const deletingArray = Array.isArray(id);
    const comparator: ComparisonOperatorExpression = deletingArray ? 'in' : '=';

    let query: UpdateQuery | DeleteQuery;
    if (softDelete) {
      query = database
        .updateTable(this.table)
        .set({ [this.deletedAtColumn as string]: new Date() });
    } else {
      query = database.deleteFrom(this.table);
    }

    if (this.deletedAtColumn) {
      query = query.where(this.withoutSoftDeletes);
    }

    const deletedRecords = await query
      .where(eb => eb(this.primaryKeyColumn, comparator, id))
      .returningAll()
      .execute();

    if (deletedRecords.length === 0 && notFoundReturn) {
      return notFoundReturn();
    }

    if (deletingArray) {
      return deletedRecords;
    }

    return deletedRecords[0];
  }
}

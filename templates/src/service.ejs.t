---
to: api/services/<%= h.inflection.dasherize(tableName) %>.service.ts
---
<% const withUpdatedAt = columns.find(column => column.name === 'updated_at') %>
<% const withDeletedAt = columns.find(column => column.name === 'deleted_at') %>
<% const pascalizedName = h.inflection.camelize(tableName) %><% _%>
<% const singularPascalizedName = h.inflection.singularize(pascalizedName) %><% _%>
import {
  TableName,
  <% if (withUpdatedAt || withDeletedAt) { %><% _%>
    <%= singularPascalizedName %>Field,
  <% } %><% _%>
} from '../database/constants';
import { type <%= pascalizedName %> } from '../database/schema';
import { SqlService } from '../services/sql.service';

export class <%= pascalizedName %>Service extends SqlService<<%= pascalizedName %>> {
  constructor() {
    super({
      table: TableName.<%= pascalizedName %>,
      <% if (withUpdatedAt) { %><% _%>
        updatedAtColumn: <%= singularPascalizedName %>Field.UpdatedAt,
      <% } %><% _%>
      <% if (withDeletedAt) { %><% _%>
        deletedAtColumn: <%= singularPascalizedName %>Field.DeletedAt,
      <% } %><% _%>
    });
  }
}

export const <%= h.inflection.camelize(tableName, true) %>Service = new <%= pascalizedName %>Service();

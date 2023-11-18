---
to: api/database/schema.ts
---
import {
  TableName,
<% for (const table of allTables) { %><% _%>
  <%= h.inflection.transform(table.tableName, [ 'camelize', 'singularize' ]) %>Field,<% _%>
<% } %>
} from './constants';

<% for (const table of allTables) { %>
<% const pascalizedName = h.inflection.camelize(table.tableName) %><% _%>
export interface <%= pascalizedName %> {
<% for (const column of table.columns) { %>
  [<%= h.inflection.singularize(pascalizedName) %>Field.<%= h.inflection.camelize(column.name) %>]<%= column.isNullable ? '?' : '' %>: <%= column.type %>;<% _%>
<% } %>
}
<% } %>

export interface Database {
<% for (const table of allTables) { %><%_ _%>
  <% const pascalizedName = h.inflection.camelize(table.tableName) %><%_ _%>
  [TableName.<%= pascalizedName %>]: <%= pascalizedName %>;<% _%>
<% } %>
}

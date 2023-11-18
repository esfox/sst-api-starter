---
to: api/database/constants.ts
---
export enum TableName {
<% for (const table of allTables) { %><% _%>
  <%= h.inflection.camelize(table.tableName) %> = '<%= table.tableName %>',<%_ _%>
<% } %>
}

<% for (const table of allTables) { %><% _%>
<% const entityName = h.inflection.transform(table.tableName, [ 'camelize', 'singularize' ]) %><% _%>
export enum <%= entityName %>Field {<% _%>
<% for (const column of table.columns) { %>
  <%= h.inflection.camelize(column.name) %> = '<%= column.name %>',<%_ _%>
<% } %>
}

<% } %>


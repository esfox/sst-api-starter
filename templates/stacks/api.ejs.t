---
to: stacks/api.ts
---
import { Api, type StackContext } from 'sst/constructs';
import { Secrets } from './secrets';

const handlersPath = 'api/handlers';

export function API({ stack }: StackContext) {
  const { DB_CONNECTION } = Secrets(stack);

  const api = new Api(stack, 'API', {
    routes: {
      'GET /docs': `${handlersPath}/docs.handler`,
      'GET /swagger.json': `${handlersPath}/docs.handler`,

      <% for (const table of allTables) { %><% _%>
        <% const dasherizedName = h.inflection.dasherize(table.tableName) %><% _%>
        'GET /<%= dasherizedName %>': `${handlersPath}/<%= dasherizedName %>.list`,
        'GET /<%= dasherizedName %>/{id}': `${handlersPath}/<%= dasherizedName %>.get`,
        'POST /<%= dasherizedName %>': `${handlersPath}/<%= dasherizedName %>.post`,
        'PATCH /<%= dasherizedName %>/{id}': `${handlersPath}/<%= dasherizedName %>.patch`,
        'DELETE /<%= dasherizedName %>/{id}': `${handlersPath}/<%= dasherizedName %>.destroy`,
        'DELETE /<%= dasherizedName %>/{id}/archive': `${handlersPath}/<%= dasherizedName %>.archive`,

      <% } %>
    },
  });

  api.bind([DB_CONNECTION]);

  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}

import { Api, type StackContext } from 'sst/constructs';
import { Secrets } from './secrets';

const apiHandlersPath = 'api/handlers';

export function API({ stack }: StackContext) {
  const { DB_CONNECTION } = Secrets(stack);

  const api = new Api(stack, 'API', {
    routes: {
      'GET /docs': `${apiHandlersPath}/docs.handler`,
      'GET /swagger.json': `${apiHandlersPath}/docs.handler`,

      'GET /users': `${apiHandlersPath}/users.list`,
      'GET /users/{id}': `${apiHandlersPath}/users.get`,
      'POST /users': `${apiHandlersPath}/users.post`,
      'PATCH /users/{id}': `${apiHandlersPath}/users.patch`,
      'DELETE /users/{id}': `${apiHandlersPath}/users.destroy`,
      'DELETE /users/{id}/archive': `${apiHandlersPath}/users.archive`,
    },
  });

  api.bind([DB_CONNECTION]);

  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}

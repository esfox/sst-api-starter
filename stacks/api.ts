import { Api, type StackContext } from 'sst/constructs';
import { Secrets } from './secrets';

const handlersPath = 'src/handlers';

export function API({ stack }: StackContext) {
  const { DB_CONNECTION } = Secrets(stack);

  const api = new Api(stack, 'API', {
    routes: {
      'GET /docs': `${handlersPath}/docs.handler`,
      'GET /swagger.json': `${handlersPath}/docs.handler`,

      'GET /users': `${handlersPath}/users.list`,
      'GET /users/{id}': `${handlersPath}/users.get`,
      'POST /users': `${handlersPath}/users.post`,
      'PATCH /users/{id}': `${handlersPath}/users.patch`,
      'DELETE /users/{id}': `${handlersPath}/users.destroy`,
      'DELETE /users/{id}/archive': `${handlersPath}/users.archive`,
    },
  });

  api.bind([DB_CONNECTION]);

  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}

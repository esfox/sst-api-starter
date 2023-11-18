import swaggerJsdoc from 'swagger-jsdoc';
import { version } from '../../package.json';
import { usersDocs } from '../docs/users';
import { createHandler } from '../helpers/handler.helper';

const swaggerJsonPath = '/swagger.json';

const options: swaggerJsdoc.OAS3Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API',
      version,
    },
    paths: {
      ...usersDocs,
    },
  },
  apis: [],
};

export const swaggerDefinition = swaggerJsdoc(options);

export const handler = createHandler({
  handler: async event => {
    const title = 'Service API';

    if (event.rawPath === swaggerJsonPath) {
      return {
        statusCode: 200,
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(swaggerDefinition),
      };
    }

    const body = `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <title>${title}</title>
          <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@3/swagger-ui.css">
      </head>
      <body>
          <div id="swagger"></div>
          <script src="https://unpkg.com/swagger-ui-dist@3/swagger-ui-bundle.js"></script>
          <script>
            SwaggerUIBundle({
              dom_id: '#swagger',
              url: '${swaggerJsonPath}'
          });
          </script>
      </body>
      </html>
    `;

    return {
      statusCode: 200,
      headers: {
        'content-type': 'text/html',
      },
      body,
    };
  },
});

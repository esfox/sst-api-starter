/* eslint-disable no-param-reassign */
import middy from '@middy/core';
import bodyParser from '@middy/http-json-body-parser';
import { type APIGatewayProxyEventV2, type APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { StatusCodes } from 'http-status-codes';
import { z, type ZodSchema } from 'zod';

const commonHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
  'Content-Type': 'application/json',
};

type ApiResponse = Omit<APIGatewayProxyStructuredResultV2, 'body'> & {
  body: { [key: string]: unknown } | string;
};

type CreateHandlerParams<TBody, TQuery, THeaders, TPathParams> = {
  validationSchema?: {
    body?: ZodSchema<TBody>;
    headers?: ZodSchema<THeaders>;
    pathParameters?: ZodSchema<TPathParams>;
    queryStringParameters?: ZodSchema<TQuery>;
  };
  handler: (
    event: Omit<
      APIGatewayProxyEventV2,
      'body' | 'headers' | 'pathParameters' | 'queryStringParameters'
    > & {
      body: TBody;
      headers: THeaders;
      pathParameters: TPathParams;
      queryStringParameters: TQuery;
    }
  ) => Promise<ApiResponse>;
  serializeBody?: boolean;
};

export function createHandler<TBody, TQuery, THeaders, TPathParams>({
  validationSchema,
  handler,
  serializeBody = true,
}: CreateHandlerParams<TBody, TQuery, THeaders, TPathParams>) {
  const before: middy.MiddlewareFn<APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2> = ({
    event,
  }) => {
    if (!validationSchema) {
      return;
    }

    const validationResult = z.object(validationSchema).safeParse(event);
    if (validationResult.success === false) {
      // eslint-disable-next-line consistent-return
      return {
        headers: commonHeaders,
        statusCode: StatusCodes.BAD_REQUEST,
        body: JSON.stringify(validationResult.error),
      };
    }

    const { body, headers, queryStringParameters, pathParameters } = validationResult.data;
    if (body) {
      event.body = body as APIGatewayProxyEventV2['body'];
    }

    if (headers) {
      event.headers = headers as APIGatewayProxyEventV2['headers'];
    }

    if (queryStringParameters) {
      event.queryStringParameters =
        queryStringParameters as APIGatewayProxyEventV2['queryStringParameters'];
    }

    if (pathParameters) {
      event.pathParameters = pathParameters as APIGatewayProxyEventV2['pathParameters'];
    }
  };

  const after: middy.MiddlewareFn<
    APIGatewayProxyEventV2,
    APIGatewayProxyStructuredResultV2
  > = event => {
    if (!serializeBody || !event.response) {
      return;
    }

    event.response.headers = { ...commonHeaders, ...event.response.headers };

    const { body } = event.response;
    if (typeof body !== 'object') {
      return;
    }

    event.response.body = JSON.stringify(body);
  };

  return middy(handler)
    .use(bodyParser({ disableContentTypeError: true }))
    .use({ before, after });
}

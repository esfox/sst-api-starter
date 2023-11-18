---
to: api/handlers/<%= h.inflection.dasherize(tableName) %>.ts
---
<% const dasherizedName = h.inflection.dasherize(tableName) %><% _%>
<% const camelizedName = h.inflection.camelize(tableName, true) %><% _%>
<% const singularPascalizedName = h.inflection.transform(tableName, [ 'camelize', 'singularize' ]) %><% _%>
<%_
  function getZodFunction(column) {
    const type = column.type;
    let zodFunction = 'string().trim()';
    if (type.includes('number')) {
      zodFunction = 'number()';
    } else if (type.includes('boolean')) {
      zodFunction = 'boolean()';
    } else if (type.includes('Date')) {
      zodFunction = 'date()';
    }

    if (type.includes('null') || column.isNullable || column.hasDefaultValue) {
      zodFunction += '.optional()'
    }

    return zodFunction;
  }
_%>

import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import { <%= singularPascalizedName %>Field } from '../database/constants';
import { createHandler } from '../helpers/handler.helper';
import { <%= camelizedName %>Service } from '../services/<%= dasherizedName %>.service';

export const list = createHandler({
  handler: async () => {
    const { records, totalRecords } = await <%= camelizedName %>Service.findAll();

    return {
      statusCode: StatusCodes.OK,
      body: { records, totalRecords },
    };
  },
});

export const get = createHandler({
  validationSchema: {
    pathParameters: z.object({ [<%= singularPascalizedName %>Field.Id]: z.string().uuid() }),
  },
  handler: async ({ pathParameters }) => {
    const id = pathParameters[<%= singularPascalizedName %>Field.Id];
    const record = await <%= camelizedName %>Service.findOne({ id });

    return {
      statusCode: StatusCodes.OK,
      body: { record },
    };
  },
});

export const post = createHandler({
  validationSchema: {
    body: z.object({
      <%_ for (const column of columns) { _%>
        <%_ if (!column.hasDefaultValue && column.name !== primaryKey) { _%>
          [<%= singularPascalizedName %>Field.<%= h.inflection.camelize(column.name) %>]: z.<%= getZodFunction(column) %>,
        <%_ } _%>
      <%_ } _%>
    }),
  },
  handler: async ({ body }) => {
    const record = await <%= camelizedName %>Service.create({ data: body });

    return {
      statusCode: StatusCodes.CREATED,
      body: { record },
    };
  },
});

export const patch = createHandler({
  validationSchema: {
    body: z.object({
      <%_ for (const column of columns) { _%>
        <%_ if (column.name !== primaryKey) { _%>
          [<%= singularPascalizedName %>Field.<%= h.inflection.camelize(column.name) %>]: z.<%= getZodFunction(column) %>,
        <%_ } _%>
      <% } %>
    }),
    pathParameters: z.object({ [<%= singularPascalizedName %>Field.Id]: z.string().uuid() }),
  },
  handler: async ({ body, pathParameters }) => {
    const id = pathParameters[<%= singularPascalizedName %>Field.Id];
    const record = await <%= camelizedName %>Service.update({ id, data: body });

    return {
      statusCode: StatusCodes.OK,
      body: { record },
    };
  },
});

export const destroy = createHandler({
  validationSchema: {
    pathParameters: z.object({ [<%= singularPascalizedName %>Field.Id]: z.string().uuid() }),
  },
  handler: async ({ pathParameters }) => {
    const id = pathParameters[<%= singularPascalizedName %>Field.Id];
    const record = await <%= camelizedName %>Service.delete({ id });

    return {
      statusCode: StatusCodes.OK,
      body: { record },
    };
  },
});

export const archive = createHandler({
  validationSchema: {
    pathParameters: z.object({ [<%= singularPascalizedName %>Field.Id]: z.string().uuid() }),
  },
  handler: async ({ pathParameters }) => {
    const id = pathParameters[<%= singularPascalizedName %>Field.Id];
    const record = await <%= camelizedName %>Service.delete({ id, softDelete: true });

    return {
      statusCode: StatusCodes.OK,
      body: { record },
    };
  },
});


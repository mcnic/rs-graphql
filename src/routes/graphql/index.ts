import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { GraphQLSchema, graphql, validate, DocumentNode, parse } from 'graphql';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { rootQuery } from './query.js';
import { rootMutation } from './mutation.js';
import depthLimit from 'graphql-depth-limit';
import DataLoader from 'dataloader';

const dataloaders = new WeakMap<WeakKey, DataLoader<unknown, unknown, unknown>>();

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      const schema = new GraphQLSchema({
        query: rootQuery,
        mutation: rootMutation,
      });

      const document: DocumentNode = parse(req.body.query);
      const validateResult = validate(schema, document, [depthLimit(5)]);
      if (validateResult.length)
        return {
          data: null,
          errors: validateResult,
        };

      const res = await graphql({
        schema,
        source: req.body.query,
        variableValues: req.body.variables,
        contextValue: {
          prisma,
          dataloaders,
          users: [],
        },
      });

      return res;
    },
  });
};

export default plugin;

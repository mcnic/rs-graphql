import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { rootQuery } from './query.js';
import { GraphQLSchema, graphql, validate, DocumentNode, parse } from 'graphql';
import depthLimit from 'graphql-depth-limit';
import { rootMutation } from './mutation.js';
import DataLoader from 'dataloader';
// import { getPrismaStats } from '../../../test/utils/requests.js';
// import DataLoader from 'dataloader';

// new DataLoader().prime();

const dataloaders = new WeakMap<WeakKey, DataLoader<unknown, unknown, unknown>>(); //<any, TUser4Subscribers>();
// DataLoader<unknown, TUser4Subscribers, unknown>;
//

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

      // const {
      //   body: { operationHistory: beforeHistory },
      // } = await getPrismaStats(fastify);
      const res = await graphql({
        schema,
        source: req.body.query,
        variableValues: req.body.variables,
        contextValue: {
          prisma,
          dataloaders,
          // userLoader: new DataLoader((keys) => myBatchGetUsers(keys)),
        },
      });

      // const {
      //   body: { operationHistory: afterHistory },
      // } = await getPrismaStats(fastify);

      // console.log('=== afterHistory', afterHistory, beforeHistory);

      return res;
    },
  });
};

export default plugin;

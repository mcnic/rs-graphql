import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { getRootQuery } from './query.js';
import { GraphQLObjectType, GraphQLSchema, graphql } from 'graphql';
import { getRootMutation } from './mutation.js';
import { getUserType } from './types/prismaTypes.js';

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
      const UserType: GraphQLObjectType = getUserType(prisma);

      const schema = new GraphQLSchema({
        query: getRootQuery(prisma, UserType),
        mutation: getRootMutation(prisma, UserType),
      });

      return await graphql({
        schema,
        source: req.body.query,
        variableValues: req.body.variables,
      });
    },
  });
};

export default plugin;

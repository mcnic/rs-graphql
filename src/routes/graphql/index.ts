import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { getRootQuery } from './query.js';
import {
  GraphQLObjectType,
  GraphQLSchema,
  graphql,
  validate,
  DocumentNode,
  parse,
} from 'graphql';
import { getRootMutation } from './mutation.js';
import { getUserType } from './types/prismaTypes.js';
import depthLimit from 'graphql-depth-limit';

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

      const document: DocumentNode = parse(req.body.query);
      const validateResult = validate(schema, document, [depthLimit(5)]);
      if (validateResult.length)
        return {
          data: null,
          errors: [{ message: 'exceeds maximum operation depth of 5' }],
        };

      return await graphql({
        schema,
        source: req.body.query,
        variableValues: req.body.variables,
        contextValue: {
          prisma,
        },
      });
    },
  });
};

export default plugin;

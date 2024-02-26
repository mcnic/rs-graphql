import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql } from 'graphql';
import { nonSDLSchema } from './query.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
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
      return await graphql({
        schema: nonSDLSchema,
        source: req.body.query,
        variableValues: req.body.variables,
      });

      // SDL variant
      // return await graphql({
      //   schema,
      //   source: req.body.query,
      //   variableValues: req.body.variables,
      //   rootValue,
      // });
    },
  });
};

export default plugin;

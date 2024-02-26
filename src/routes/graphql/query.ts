import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLFloat,
} from 'graphql';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const memberType = new GraphQLObjectType({
  name: 'memberType',
  fields: () => ({
    id: { type: GraphQLID },
    discount: { type: GraphQLFloat },
    postsLimitPerMonth: { type: GraphQLInt },
  }),
});

export const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    hello: {
      type: GraphQLString,
      resolve() {
        return 'world';
      },
    },
    memberTypes: {
      type: new GraphQLList(memberType),
      async resolve(_parent, _args) {
        return prisma.memberType.findMany();
      },
    },
  },
});

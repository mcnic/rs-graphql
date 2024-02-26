import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLEnumType,
} from 'graphql';
import { GraphQLSchema } from 'graphql';
import { UUIDType } from './types/uuid.js';

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

const postType = new GraphQLObjectType({
  name: 'postType',
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    authorId: { type: GraphQLString },
  }),
});

const userType = new GraphQLObjectType({
  name: 'userType',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
  }),
});

const profileType = new GraphQLObjectType({
  name: 'profileType',
  fields: () => ({
    id: { type: GraphQLID },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    // todo: relations with other tables
    // userId: userFields.id,
    // memberTypeId: memberTypeFields.id,
  }),
});

const MemberTypeId = new GraphQLEnumType({
  name: 'MemberTypeId',
  values: {
    basic: {
      value: 'basic',
    },
    business: { value: 'business' },
  },
});

const RootQuery = new GraphQLObjectType({
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
    memberType: {
      type: memberType,
      args: {
        id: {
          type: MemberTypeId,
        },
      },
      async resolve(_parent, args: { [key: string]: string }) {
        const { id } = args;
        return await prisma.memberType.findUnique({
          where: { id },
        });
      },
    },
    posts: {
      type: new GraphQLList(postType),
      async resolve(_parent, _args) {
        return prisma.post.findMany();
      },
    },
    post: {
      type: postType,
      args: {
        id: {
          type: UUIDType,
        },
      },
      async resolve(_parent, args: { [key: string]: string }) {
        const { id } = args;
        return await prisma.post.findUnique({
          where: { id },
        });
      },
    },
    user: {
      type: userType,
      args: {
        id: {
          type: UUIDType,
        },
      },
      async resolve(_parent, args: { [key: string]: string }) {
        const { id } = args;
        return await prisma.user.findUnique({
          where: { id },
        });
      },
    },
    users: {
      type: new GraphQLList(userType),
      async resolve(_parent, _args) {
        return prisma.user.findMany();
      },
    },
    profiles: {
      type: new GraphQLList(profileType),
      async resolve(_parent, _args) {
        return prisma.profile.findMany();
      },
    },
    profile: {
      type: profileType,
      args: {
        id: {
          type: UUIDType,
        },
      },
      async resolve(_parent, args: { [key: string]: string }) {
        const { id } = args;
        return await prisma.profile.findUnique({
          where: { id },
        });
      },
    },
  },
});

export const nonSDLSchema = new GraphQLSchema({
  query: RootQuery,
  // mutation: Mutations
  types: [UUIDType, MemberTypeId],
});

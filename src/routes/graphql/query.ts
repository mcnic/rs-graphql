import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLID,
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
    id: { type: UUIDType },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    authorId: { type: GraphQLString },
    // relationships
    // author: { type: userType },
  }),
});

const userType = new GraphQLObjectType({
  name: 'userType',
  fields: () => ({
    id: { type: UUIDType },
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
    // relationships
    profile: { type: profileType },
    posts: { type: postType },
  }),
});

const profileType = new GraphQLObjectType({
  name: 'profileType',
  fields: () => ({
    id: { type: UUIDType },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    userId: { type: UUIDType },
    memberTypeId: { type: GraphQLID },
    // relationships
    memberType: { type: memberType },
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
        return prisma.post.findMany({
          include: {
            author: true,
          },
        });
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
          include: {
            author: true,
          },
        });
      },
    },
    users: {
      type: new GraphQLList(userType),
      async resolve(_parent, _args) {
        return prisma.user.findMany({
          include: {
            profile: {
              include: {
                memberType: true,
              },
            },
            posts: true,
          },
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
        const user = await prisma.user.findFirst({
          where: { id },
          include: {
            profile: {
              include: {
                memberType: true,
              },
            },
            posts: true, //todo: not work, couse id for userId field is named authorId, I don't now what this deal doing
          },
        });
        return user;
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
        const profile = await prisma.profile.findFirst({
          where: { id },
          include: {
            memberType: true,
          },
        });
        return profile;
      },
    },
  },
});

export const nonSDLSchema = new GraphQLSchema({
  query: RootQuery,
  // mutation: Mutations
  types: [],
});

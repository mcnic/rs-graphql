import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library.js';
import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLFloat,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLInputObjectType,
} from 'graphql';
import { UUIDType } from './uuid.js';

export const getUserType = (
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
) => {
  const UserType: GraphQLObjectType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
      id: { type: UUIDType },
      name: { type: GraphQLString },
      balance: { type: GraphQLFloat },
      profile: { type: profileType },
      posts: { type: new GraphQLList(postType) },
      userSubscribedTo: {
        type: new GraphQLList(UserType),
        resolve: async (source: { id: string }) => {
          return await prisma.user.findMany({
            where: {
              subscribedToUser: {
                some: {
                  subscriberId: source.id,
                },
              },
            },
            include: {
              userSubscribedTo: true,
              subscribedToUser: true,
            },
          });
        },
      },
      subscribedToUser: {
        type: new GraphQLList(UserType),
        resolve: async (source: { id: string }) => {
          return await prisma.user.findMany({
            where: {
              userSubscribedTo: {
                some: {
                  authorId: source.id,
                },
              },
            },
            include: {
              userSubscribedTo: true,
              subscribedToUser: true,
            },
          });
        },
      },
    }),
  });

  return UserType;
};
export const memberType = new GraphQLObjectType({
  name: 'memberType',
  fields: () => ({
    id: { type: GraphQLID },
    discount: { type: GraphQLFloat },
    postsLimitPerMonth: { type: GraphQLInt },
  }),
});

export const postType = new GraphQLObjectType({
  name: 'postType',
  fields: () => ({
    id: { type: UUIDType },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
  }),
});

export const SubscriberType = new GraphQLObjectType({
  name: 'SubscriberType',
  fields: () => ({
    id: { type: UUIDType },
    name: { type: GraphQLString },
    userSubscribedTo: { type: new GraphQLList(SubscriberType) },
    subscribedToUser: { type: new GraphQLList(SubscriberType) },
  }),
});

export const profileType = new GraphQLObjectType({
  name: 'profileType',
  fields: () => ({
    id: { type: UUIDType },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    userId: { type: UUIDType },
    memberTypeId: { type: MemberTypeId },
    // relationships
    memberType: { type: memberType },
  }),
});

export const MemberTypeId = new GraphQLEnumType({
  name: 'MemberTypeId',
  values: {
    basic: {
      value: 'basic',
    },
    business: { value: 'business' },
  },
});

export const CreatePostInput = new GraphQLInputObjectType({
  name: 'CreatePostInput',
  fields: () => ({
    authorId: { type: UUIDType },
    content: { type: GraphQLString },
    title: { type: GraphQLString },
  }),
});

export const ChangePostInput = new GraphQLInputObjectType({
  name: 'ChangePostInput',
  fields: () => ({
    authorId: { type: UUIDType },
    content: { type: GraphQLString },
    title: { type: GraphQLString },
  }),
});

export const CreateUserInput = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: () => ({
    name: { type: UUIDType },
    balance: { type: GraphQLFloat },
  }),
});

export const ChangeUserInput = new GraphQLInputObjectType({
  name: 'ChangeUserInput',
  fields: () => ({
    name: { type: UUIDType },
    balance: { type: GraphQLFloat },
  }),
});

export const CreateProfileInput = new GraphQLInputObjectType({
  name: 'CreateProfileInput',
  fields: () => ({
    userId: { type: UUIDType },
    memberTypeId: { type: MemberTypeId },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
  }),
});

export const ChangeProfileInput = new GraphQLInputObjectType({
  name: 'ChangeProfileInput',
  fields: () => ({
    userId: { type: UUIDType },
    memberTypeId: { type: MemberTypeId },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
  }),
});

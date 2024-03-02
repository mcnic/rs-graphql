import { PrismaClient } from '@prisma/client';
import { GraphQLObjectType, GraphQLString, GraphQLList } from 'graphql';
import { UUIDType } from './types/uuid.js';
import {
  MemberType,
  MemberTypeId,
  ParamsWithId,
  PostType,
  ProfileType,
} from './types/prismaTypes.js';

export const getRootQuery = (prisma: PrismaClient, UserType: GraphQLObjectType) => {
  return new GraphQLObjectType({
    name: 'Query',
    fields: {
      hello: {
        type: GraphQLString,
        resolve() {
          return 'world';
        },
      },
      memberTypes: {
        type: new GraphQLList(MemberType),
        async resolve(_parent, _args) {
          return prisma.memberType.findMany();
        },
      },
      memberType: {
        type: MemberType,
        args: {
          id: {
            type: MemberTypeId,
          },
        },
        async resolve(_parent, { id }: ParamsWithId) {
          return await prisma.memberType.findUnique({
            where: { id },
          });
        },
      },
      posts: {
        type: new GraphQLList(PostType),
        async resolve(_parent, _args) {
          return prisma.post.findMany({
            include: {
              author: true,
            },
          });
        },
      },
      post: {
        type: PostType,
        args: {
          id: {
            type: UUIDType,
          },
        },
        async resolve(_parent, { id }: ParamsWithId) {
          return await prisma.post.findUnique({
            where: { id },
            include: {
              author: true,
            },
          });
        },
      },
      users: {
        type: new GraphQLList(UserType),
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
        type: UserType,
        args: {
          id: {
            type: UUIDType,
          },
        },
        async resolve(_parent, { id }: ParamsWithId) {
          return await prisma.user.findFirst({
            where: {
              id,
            },
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
      profiles: {
        type: new GraphQLList(ProfileType),
        async resolve(_parent, _args) {
          return prisma.profile.findMany();
        },
      },
      profile: {
        type: ProfileType,
        args: {
          id: {
            type: UUIDType,
          },
        },
        async resolve(_parent, { id }: ParamsWithId) {
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
};

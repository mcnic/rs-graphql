import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library.js';
import { GraphQLObjectType, GraphQLString, GraphQLList } from 'graphql';
import { UUIDType } from './types/uuid.js';
import { addSubscribedToUser } from './subscribers.js';
import { addUserSubscribedTo } from './subscribers.js';
import {
  memberType,
  MemberTypeId,
  postType,
  userType,
  profileType,
} from './types/prismaTypes.js';

export const getRootQuery = (
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
) => {
  return new GraphQLObjectType({
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

          if (!user) return null;

          const injected1 = await addUserSubscribedTo(user, prisma);
          const inhected2 = await addSubscribedToUser(injected1, prisma);

          return inhected2;
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
};

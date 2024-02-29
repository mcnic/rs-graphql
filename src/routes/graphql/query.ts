import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library.js';
import { GraphQLObjectType, GraphQLString, GraphQLList, GraphQLFloat } from 'graphql';
import { UUIDType } from './types/uuid.js';
import { memberType, MemberTypeId, postType, profileType } from './types/prismaTypes.js';

export const getRootQuery = (
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
  UserType: GraphQLObjectType,
) => {
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

          return user;

          // const injected1 = await addUserSubscribedTo(user, prisma);
          // const inhected2 = await addSubscribedToUser(injected1, prisma);

          // return inhected2;
        },
      },
      userSubscribedTo: {
        type: UserType,
        args: {
          id: {
            type: UUIDType,
          },
        },
        async resolve(_parent, args: { [key: string]: string }) {
          console.log('userSubscribedTo', args);

          const { id } = args;
          const draftUserSubscribedTo = await prisma.user.findMany({
            where: {
              subscribedToUser: {
                some: {
                  subscriberId: id,
                },
              },
            },
            include: {
              userSubscribedTo: true,
              subscribedToUser: true,
            },
          });

          // if (!draftUserSubscribedTo.length) return null;

          // const injected1 = await addUserSubscribedTo(user, prisma);
          // const inhected2 = await addSubscribedToUser(injected1, prisma);

          return draftUserSubscribedTo;
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

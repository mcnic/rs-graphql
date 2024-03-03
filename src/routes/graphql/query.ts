import { GraphQLObjectType, GraphQLString, GraphQLList } from 'graphql';
import { UUIDType } from './types/uuid.js';
import {
  ContextType,
  MemberType,
  MemberTypeId,
  ParamsWithId,
  PostType,
  ProfileType,
  UserType,
} from './types/prismaTypes.js';

export const rootQuery = new GraphQLObjectType({
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
      async resolve(_parent, _args, context: ContextType) {
        const { prisma } = context;

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
      async resolve(_parent, { id }: ParamsWithId, context: ContextType) {
        const { prisma } = context;

        return await prisma.memberType.findUnique({
          where: { id },
        });
      },
    },
    posts: {
      type: new GraphQLList(PostType),
      async resolve(_parent, _args, context: ContextType) {
        const { prisma } = context;

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
      async resolve(_parent, { id }: ParamsWithId, context: ContextType) {
        const { prisma } = context;
        // console.log('=== info post');

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
      resolve(_parent, _args, context: ContextType) {
        const { prisma } = context;

        return prisma.user.findMany({
          // take: 10,
          include: {
            profile: {
              include: {
                memberType: true,
              },
            },
            posts: true,
            subscribedToUser: true,
            userSubscribedTo: true,
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
      async resolve(_parent, { id }: ParamsWithId, context: ContextType) {
        const { prisma } = context;

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
      async resolve(_parent, _args, context: ContextType) {
        const { prisma } = context;
        // console.log('=== info profiles');

        return prisma.profile.findMany({
          include: {
            memberType: true,
          },
        });
      },
    },
    profile: {
      type: ProfileType,
      args: {
        id: {
          type: UUIDType,
        },
      },
      async resolve(_parent, { id }: ParamsWithId, context: ContextType) {
        const { prisma } = context;
        // console.log('=== info profile');

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

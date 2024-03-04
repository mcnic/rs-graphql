import { GraphQLObjectType, GraphQLString, GraphQLList } from 'graphql';
import { UUIDType } from './types/uuid.js';
import {
  ContextType,
  MemberType,
  MemberTypeId,
  ParamsWithId,
  PostType,
  ProfileType,
  TFields,
  UserType,
  getAllUsers,
} from './types/prismaTypes.js';
import {
  ResolveTree,
  parseResolveInfo,
  simplifyParsedResolveInfoFragmentWithType,
} from 'graphql-parse-resolve-info';

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
      async resolve(_parent, _args, context: ContextType, info) {
        const { prisma } = context;

        if (!context.users.length) {
          const parsedResolveInfoFragment = parseResolveInfo(info) as ResolveTree;
          const fields: TFields = simplifyParsedResolveInfoFragmentWithType(
            parsedResolveInfoFragment,
            info.returnType,
          ).fields;
          const include = {
            profile: true,
            posts: true,
          };
          if (fields.subscribedToUser) include['subscribedToUser'] = true;
          if (fields.userSubscribedTo) include['userSubscribedTo'] = true;

          context.users = await getAllUsers(prisma, include);
        }

        return context.users;
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
            profile: true,
            posts: true,
            subscribedToUser: true,
            userSubscribedTo: true,
          },
        });
      },
    },
    profiles: {
      type: new GraphQLList(ProfileType),
      async resolve(_parent, _args, context: ContextType) {
        const { prisma } = context;

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

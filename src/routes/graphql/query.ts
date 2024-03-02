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
// import DataLoader from 'dataloader';
// import {
//   parseResolveInfo,
//   simplifyParsedResolveInfoFragmentWithType,
// } from 'graphql-parse-resolve-info';

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
        // console.log('=== info users');

        // const parsedResolveInfoFragment = parseResolveInfo(info);
        // const simplifiedFragment = simplifyParsedResolveInfoFragmentWithType(
        //   parsedResolveInfoFragment,
        //   info.returnType,
        // );
        // console.log('===fields', simplifiedFragment.fields);

        // const { dataloaders } = context;
        // const dl: DataLoader<string, unknown, string> | undefined = dataloaders.get(id);
        // console.log('=== dataloaders', dataloaders, dl);
        // let dl: DataLoader<string, unknown, string> | undefined = dataloaders.get(id);
        // if (!dl) {
        // const dl = new DataLoader<string, Object>(getUserData);
        // return dl.load(id);
        // dataloaders.set(id, dl);
        // }

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

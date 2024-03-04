import { PrismaClient } from '@prisma/client';
import {
  GraphQLObjectType,
  GraphQLFloat,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLInputObjectType,
} from 'graphql';
import { UUIDType } from './uuid.js';
import DataLoader from 'dataloader';

export type UserContextType = {
  id: string;
  name: string;
  profile?: {
    id: string;
    isMale: boolean;
    yearOfBirth: number;
    userId: string;
    memberTypeId: string;
  } | null;
  posts?: {
    id: string;
    title: string;
    content: string;
    authorId: string;
  }[];
  userSubscribedTo?: {
    subscriberId: string;
    authorId: string;
  }[];
  subscribedToUser?: {
    subscriberId: string;
    authorId: string;
  }[];
};

export type ContextType = {
  prisma: PrismaClient;
  dataloaders: WeakMap<WeakKey, DataLoader<unknown, unknown, unknown>>;
  users: UserContextType[];
};

export const UserType: GraphQLObjectType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: UUIDType },
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
    profile: {
      type: ProfileType,
    },
    posts: {
      type: new GraphQLList(PostType),
      /** need for loader test! */
      resolve({ id }: ParamsWithId, _args, context: ContextType, info) {
        const { prisma, dataloaders } = context;

        let dl = dataloaders.get(info.fieldNodes);

        if (!dl) {
          // console.log('=== info User post');

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          dl = new DataLoader(async (ids: any): Promise<[]> => {
            const rows = await prisma.post.findMany({
              where: {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                authorId: { in: ids },
              },
              include: {
                author: true,
              },
            });

            // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            return ids.map((id) => rows.filter((x) => x.authorId === id));
          });

          dataloaders.set(info.fieldNodes, dl);
        }

        return dl.load(id);
      },
    },
    userSubscribedTo: {
      type: new GraphQLList(UserType),
      resolve: async ({ id }: ParamsWithId, _args, context: ContextType, info) => {
        const { prisma, dataloaders } = context;
        let dl = dataloaders.get(info.fieldNodes);

        if (!dl) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          dl = new DataLoader(async (ids: any): Promise<[]> => {
            /* const rows = await prisma.user.findMany({
              where: {
                subscribedToUser: {
                  some: {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    subscriberId: { in: ids },
                  },
                },
              },
              include: {
                userSubscribedTo: true,
                subscribedToUser: true,
              },
            });

            // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            const res = ids.map((id) =>
              rows.filter(
                (row) =>
                  row.subscribedToUser.filter((el) => el.subscriberId === id).length,
              ),
            ); */

            if (!context.users.length) {
              const include = {
                userSubscribedTo: true,
                subscribedToUser: true,
              };

              context.users = await getAllUsers(prisma, include);
            }

            // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            return ids.map((id) =>
              context.users
                .find((row) => row.id === id)
                ?.userSubscribedTo?.map((e) => {
                  return context.users.find((u) => u.id === e.authorId);
                }),
            );
          });

          dataloaders.set(info.fieldNodes, dl);
        }

        return dl.load(id);
      },
    },
    subscribedToUser: {
      type: new GraphQLList(UserType),
      resolve: async ({ id }: ParamsWithId, _args, context: ContextType, info) => {
        // console.log('=== info User subscribedToUser', id);

        // const parsedResolveInfoFragment = parseResolveInfo(resolveInfo) as ResolveTree;
        // const { fields } = simplifyParsedResolveInfoFragmentWithType(
        //   parsedResolveInfoFragment,
        //   resolveInfo.returnType,
        // );
        // console.log('=== fields', fields, parsedResolveInfoFragment);
        // /*
        // [App] === fields { id: { name: 'id', alias: 'id', args: {}, fieldsByTypeName: {} } } {
        // [App]   name: 'subscribedToUser',
        // [App]   alias: 'subscribedToUser',
        // [App]   args: {},
        // [App]   fieldsByTypeName: { User: { id: [Object] } }
        // [App] }
        // */

        const { prisma, dataloaders } = context;
        let dl = dataloaders.get(info.fieldNodes);

        if (!dl) {
          // console.log('=== info User subscribedToUser', id);

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          dl = new DataLoader(async (ids: any): Promise<[]> => {
            /* const rows = await prisma.user.findMany({
              where: {
                userSubscribedTo: {
                  some: {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    authorId: { in: ids },
                  },
                },
              },
              include: {
                userSubscribedTo: true,
                subscribedToUser: true,
              },
            });

            // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            const res = await ids.map((id) =>
              rows.filter(
                (row) => row.userSubscribedTo.filter((el) => el.authorId === id).length,
              ),
            ); */

            if (!context.users.length) {
              const include = {
                userSubscribedTo: true,
                subscribedToUser: true,
              };

              context.users = await getAllUsers(prisma, include);
            }

            // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            return ids.map((id) =>
              context.users
                .find((row) => row.id === id)
                ?.subscribedToUser?.map((e) => {
                  return context.users.find((u) => u.id === e.subscriberId);
                }),
            );
          });

          dataloaders.set(info.fieldNodes, dl);
        }

        return dl.load(id);
      },
    },
  }),
});

export const MemberType = new GraphQLObjectType({
  name: 'MemberType',
  fields: () => ({
    id: { type: MemberTypeId },
    discount: { type: GraphQLFloat },
    postsLimitPerMonth: { type: GraphQLInt },
  }),
});

export const PostType = new GraphQLObjectType({
  name: 'PostType',
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

export const ProfileType = new GraphQLObjectType({
  name: 'ProfileType',
  fields: () => ({
    id: { type: UUIDType },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    userId: { type: UUIDType },
    memberTypeId: { type: MemberTypeId },
    memberType: {
      type: MemberType,
      /** need for loader test! */
      resolve: async (
        { memberTypeId }: { memberTypeId: string },
        _args,
        context: ContextType,
        info,
      ) => {
        const { prisma, dataloaders } = context;

        let dl = dataloaders.get(info.fieldNodes);

        if (!dl) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          dl = new DataLoader(async (ids: any): Promise<[]> => {
            // console.log('=== info MemberType');

            const rows = await prisma.memberType.findMany({
              where: {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                id: { in: ids },
              },
            });
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            return ids.map((id) => rows.find((x) => x.id === id));
          });

          dataloaders.set(info.fieldNodes, dl);
        }
        return dl.load(memberTypeId);
      },
    },
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

export type TFields = { [key: string]: any };

export const getAllUsers = async (prisma: PrismaClient, include = {}) => {
  return await prisma.user.findMany({
    // take: 5,
    include,
  });
};

export type ParamsWithId = { id: string };

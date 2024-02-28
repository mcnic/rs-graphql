import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library.js';
import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLID,
  GraphQLArgs,
  graphql,
} from 'graphql';
import { UUIDType } from './types/uuid.js';

let prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>;

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
  }),
});

const SubscriberType = new GraphQLObjectType({
  name: 'SubscriberType',
  fields: () => ({
    id: { type: UUIDType },
    name: { type: GraphQLString },
    userSubscribedTo: { type: new GraphQLList(SubscriberType) },
    subscribedToUser: { type: new GraphQLList(SubscriberType) },
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
    posts: { type: new GraphQLList(postType) },
    userSubscribedTo: { type: new GraphQLList(SubscriberType) },
    subscribedToUser: { type: new GraphQLList(SubscriberType) },
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

        const injected1 = await addUserSubscribedTo(user);
        const inhected2 = await addSubscribedToUser(injected1);

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

export const schema = new GraphQLSchema({
  query: RootQuery,
  // mutation: Mutations
});

export const myGraphQlQuery = async (
  gqlArgs: Partial<GraphQLArgs>,
  realPrisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
) => {
  prisma = realPrisma;
  return await graphql({
    schema,
    source: gqlArgs.source!,
    variableValues: gqlArgs.variableValues,
  });
};

const addUserSubscribedTo = async (user: {
  id: string;
  name: string;
  balance: number;
}) => {
  const draftUserSubscribedTo = await prisma.user.findMany({
    where: {
      subscribedToUser: {
        some: {
          subscriberId: user.id,
        },
      },
    },
    include: {
      userSubscribedTo: true,
      subscribedToUser: true,
    },
  });

  const userSubscribedTo = draftUserSubscribedTo.map((el) => ({
    ...el,
    subscribedToUser: el.subscribedToUser.map((el2) => ({
      id: el2.subscriberId,
    })),
  }));

  return {
    ...user,
    userSubscribedTo,
  };
};

const addSubscribedToUser = async (user: {
  id: string;
  name: string;
  balance: number;
}) => {
  const draftSubscribedToUser = await prisma.user.findMany({
    where: {
      userSubscribedTo: {
        some: {
          authorId: user.id,
        },
      },
    },
    include: {
      subscribedToUser: true,
      userSubscribedTo: true,
    },
  });

  const subscribedToUser = draftSubscribedToUser.map((el) => ({
    ...el,
    userSubscribedTo: el.userSubscribedTo.map((el2) => ({
      id: el2.authorId,
    })),
  }));

  return {
    ...user,
    subscribedToUser,
  };
};

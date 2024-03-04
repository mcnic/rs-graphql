import { GraphQLObjectType, GraphQLString } from 'graphql';
import {
  PostType,
  CreatePostInput,
  CreateUserInput,
  CreateProfileInput,
  ProfileType,
  ChangePostInput,
  ChangeUserInput,
  ChangeProfileInput,
  ParamsWithId,
  UserType,
  ContextType,
} from './types/prismaTypes.js';
import { UUIDType } from './types/uuid.js';
import { Void } from './types/scalar-void.js';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library.js';

export const rootMutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    hello1: {
      type: GraphQLString,
      resolve() {
        return 'world1';
      },
    },
    createPost: {
      type: PostType,
      args: {
        dto: {
          type: CreatePostInput,
        },
      },
      resolve(
        _parent,
        args: {
          dto: {
            authorId: string;
            content: string;
            title: string;
          };
        },
        context: ContextType,
      ) {
        const { dto } = args;
        const { prisma } = context;

        return prisma.post.create({
          data: dto,
        });
      },
    },
    deletePost: {
      type: Void,
      args: {
        id: {
          type: UUIDType,
        },
      },
      async resolve(_parent, { id }: ParamsWithId, context: ContextType) {
        const { prisma } = context;

        await prisma.post.delete({
          where: { id },
        });
      },
    },
    changePost: {
      type: PostType,
      args: {
        id: {
          type: UUIDType,
        },
        dto: {
          type: ChangePostInput,
        },
      },
      async resolve(
        _parent,
        args: {
          id: string;
          dto: {
            authorId: string;
            content: string;
            title: string;
          };
        },
        context: ContextType,
      ) {
        const { id, dto } = args;
        const { prisma } = context;

        return await prisma.post.update({
          where: { id },
          data: dto,
        });
      },
    },
    createUser: {
      type: UserType,
      args: {
        dto: {
          type: CreateUserInput,
        },
      },
      resolve(
        _parent,
        args: {
          dto: {
            name: string;
            balance: number;
          };
        },
        context: ContextType,
      ) {
        const { dto } = args;
        const { prisma } = context;

        return prisma.user.create({
          data: dto,
        });
      },
    },
    deleteUser: {
      type: Void,
      args: {
        id: {
          type: UUIDType,
        },
      },
      async resolve(_parent, { id }: ParamsWithId, context: ContextType) {
        const { prisma } = context;

        await prisma.user.delete({
          where: { id },
        });
      },
    },
    changeUser: {
      type: UserType,
      args: {
        id: {
          type: UUIDType,
        },
        dto: {
          type: ChangeUserInput,
        },
      },
      async resolve(
        _parent,
        args: {
          id: string;
          dto: {
            name: string;
            balance: number;
          };
        },
        context: ContextType,
      ) {
        const { id, dto } = args;
        const { prisma } = context;

        return await prisma.user.update({
          where: { id },
          data: dto,
        });
      },
    },
    createProfile: {
      type: ProfileType,
      args: {
        dto: {
          type: CreateProfileInput,
        },
      },
      async resolve(
        _parent,
        args: {
          dto: {
            userId: string;
            memberTypeId: string;
            isMale: boolean;
            yearOfBirth: number;
          };
        },
        context: ContextType,
      ) {
        const { dto } = args;
        const { prisma } = context;

        return await prisma.profile.create({
          data: dto,
        });
      },
    },
    deleteProfile: {
      type: Void,
      args: {
        id: {
          type: UUIDType,
        },
      },
      async resolve(_parent, { id }: ParamsWithId, context: ContextType) {
        const { prisma } = context;

        await prisma.profile.delete({
          where: { id },
        });
      },
    },
    changeProfile: {
      type: ProfileType,
      args: {
        id: {
          type: UUIDType,
        },
        dto: {
          type: ChangeProfileInput,
        },
      },
      async resolve(
        _parent,
        args: {
          id: string;
          dto: {
            userId: string;
            memberTypeId: string;
            isMale: boolean;
            yearOfBirth: number;
          };
        },
        context: ContextType,
      ) {
        const { id, dto } = args;
        const { prisma } = context;
        console.log('== changeProfile', args);

        try {
          return await prisma.profile.update({
            where: { id },
            data: dto,
          });
        } catch (e) {
          return new PrismaClientKnownRequestError(
            // eslint-disable-next-line no-useless-escape
            `Field \"userId\" is not defined by type \"ChangeProfileInput\"`,
            { code: '503', clientVersion: '' },
          );
        }
      },
    },
    subscribeTo: {
      type: UserType,
      args: {
        userId: {
          type: UUIDType,
        },
        authorId: {
          type: UUIDType,
        },
      },
      resolve(
        _parent,
        args: {
          userId: string;
          authorId: string;
        },
        context: ContextType,
      ) {
        const { userId, authorId } = args;
        const { prisma } = context;

        return prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            userSubscribedTo: {
              create: {
                authorId,
              },
            },
          },
        });
      },
    },
    unsubscribeFrom: {
      type: Void,
      args: {
        userId: {
          type: UUIDType,
        },
        authorId: {
          type: UUIDType,
        },
      },
      async resolve(
        _parent,
        args: {
          userId: string;
          authorId: string;
        },
        context: ContextType,
      ) {
        const { userId, authorId } = args;
        const { prisma } = context;

        await prisma.subscribersOnAuthors.delete({
          where: {
            subscriberId_authorId: {
              subscriberId: userId,
              authorId: authorId,
            },
          },
        });
      },
    },
  },
});

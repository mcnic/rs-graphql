import { Prisma, PrismaClient } from '@prisma/client';
import {
  DefaultArgs,
  PrismaClientKnownRequestError,
} from '@prisma/client/runtime/library.js';
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
} from './types/prismaTypes.js';
import { UUIDType } from './types/uuid.js';
import { Void } from './types/scalar-void.js';

export const getRootMutation = (
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
  UserType: GraphQLObjectType,
) => {
  return new GraphQLObjectType({
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
        async resolve(
          _parent,
          args: {
            dto: {
              authorId: string;
              content: string;
              title: string;
            };
          },
        ) {
          const { dto } = args;

          return await prisma.post.create({
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
        async resolve(_parent, args: { [key: string]: string }) {
          const { id } = args;
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
        ) {
          const { id, dto } = args;

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
        async resolve(
          _parent,
          args: {
            dto: {
              name: string;
              balance: number;
            };
          },
        ) {
          const { dto } = args;

          return await prisma.user.create({
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
        async resolve(_parent, args: { [key: string]: string }) {
          const { id } = args;
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
        ) {
          const { id, dto } = args;

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
        ) {
          const { dto } = args;

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
        async resolve(_parent, args: { [key: string]: string }) {
          const { id } = args;
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
        ) {
          const { id, dto } = args;
          try {
            return await prisma.profile.update({
              where: { id },
              data: dto,
            });
          } catch (e) {
            throw new PrismaClientKnownRequestError(
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
        async resolve(
          _parent,
          args: {
            userId: string;
            authorId: string;
          },
        ) {
          const { userId, authorId } = args;
          return await prisma.user.update({
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
        ) {
          const { userId, authorId } = args;
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
};

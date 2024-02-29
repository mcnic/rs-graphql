import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library.js';
import { GraphQLObjectType, GraphQLString } from 'graphql';
import {
  postType,
  CreatePostInput,
  CreateUserInput,
  CreateProfileInput,
  profileType,
  userType,
} from './types/prismaTypes.js';
import { UUIDType } from './types/uuid.js';
import { Void } from './types/scalar-void.js';

export const getRootMutation = (
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
) => {
  return new GraphQLObjectType({
    name: 'RootMutationType',
    fields: {
      hello1: {
        type: GraphQLString,
        resolve() {
          return 'world1';
        },
      },
      createPost: {
        type: postType,
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
      createUser: {
        type: userType,
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
      createProfile: {
        type: profileType,
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
    },
  });
};

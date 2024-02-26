import { buildSchema } from 'graphql';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const schema = buildSchema(`
  type memberType {
    id: ID
    discount: Float
    postsLimitPerMonth: Int
  }
  
  enum MemberTypeId {
    basic
    business
  }

  type postType {
    id: ID
    title: String
    content: String
    authorId:String
  }

  type userType {
    id: ID
    name: String
    balance: Float
  }

  type profileType {
    id: ID
    isMale: Boolean
    yearOfBirth: Int
  }

  type Query {
    hello: String
    memberTypes(): [memberType]
    memberType(id: MemberTypeId!): memberType

    posts(): [postType]
    users(): [userType]
    profiles(): [profileType]
  }
`);

export const rootValue = {
  hello: () => {
    return 'Hello world!';
  },
  memberTypes: () => {
    return prisma.memberType.findMany();
  },
  memberType: async (args: { [key: string]: string }) => {
    const { id } = args;
    const memberType = await prisma.memberType.findUnique({
      where: { id },
    });
    return memberType;

    /*
    resolve: async ({}, { input }) => {
          if (input.email && !isEmail(input.email)) {
              throw new Error('Email is not in valid format');
          }
          return createUser(input);
      },
    */
  },
  posts: () => {
    return prisma.post.findMany();
  },
  users: () => {
    return prisma.user.findMany();
  },
  profiles: () => {
    return prisma.profile.findMany();
  },
};

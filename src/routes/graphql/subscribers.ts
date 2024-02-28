import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library.js';

export const addSubscribedToUser = async (
  user: {
    id: string;
  },
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
) => {
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

export const addUserSubscribedTo = async (
  user: {
    id: string;
  },
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
) => {
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

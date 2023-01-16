import { z } from "zod";

import { router, publicProcedure } from "../trpc";

export const pollRouter = router({
  newPoll: publicProcedure
    .input(
      z
        .object({
          user: z.string(),
          question: z.string(),
          answer: z.array(z.object({ title: z.string() })),
        })
        .strict()
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.poll.create({
        data: {
          userId: input.user,
          question: {
            create: {
              title: input.question,
            },
          },
          answer: {
            create: [...input.answer],
          },
        },
      });
      return {
        input,
      };
    }),
  newAnswer: publicProcedure
    .input(
      z
        .object({
          pollId: z.string(),
          answerId: z.string(),
          userIp: z.string(),
          userId: z.string(),
        })
        .strict()
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.votes.create({
        data: {
          userId: input.userId,
          userIp: input.userIp,
          answerId: input.answerId,
          pollId: input.pollId,
        },
      });
      return {
        input,
      };
    }),

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.poll.findMany({
      orderBy: [
        {
          created_at: "desc",
        },
      ],
      include: {
        question: true,
        answer: true,
        User: {
          select: {
            name: true,
          },
        },
        votes: true,
      },
    });
  }),
  getOne: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.poll.findFirst({
        where: {
          id: {
            equals: input.id,
          },
        },
        include: {
          question: true,
          answer: true,
          User: {
            select: {
              name: true,
            },
          },
          votes: true,
        },
      });
    }),
});

export type PollRouter = typeof pollRouter;

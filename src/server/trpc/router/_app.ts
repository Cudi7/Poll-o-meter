import { router } from "../trpc";
import { authRouter } from "./auth";
import { pollRouter } from "./poll";

export const appRouter = router({
  auth: authRouter,
  poll: pollRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

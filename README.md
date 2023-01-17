# Poll-o-meter

This is an app bootstrapped according to the [init.tips](https://init.tips) stack, also known as the T3-Stack.

LIVE DEMO: https://poll-o-meter.vercel.app/

## What are the different technologies used?

I tried to keep this project as simple as possible, the main technologies are:

- [Next.js](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Next-Auth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [TailwindCSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)
- [Zod](https://zod.dev/)
- [PlanetScale](https://planetscale.com/)

## What can I do and how does this app works?

You can create a poll, share it and vote it.
You can view all the polls created at /polls
You can sign in/out with Google

- The app works with a serverless MySQL database using Prisma, tRPC and PlanetScale
- Zod for type validation
- Next.js and TypeScript as a core
- Tailwindcss for all the styling
- NextAuth for the authentication with google

## How do I try this?

Clone, fork or download, then inside the folder run
`npm install` && `npm run dev`

You'll need to generate following keys inside your .env:

- prisma DATABASE_URL
- NEXTAUTH_SECRET
- NEXTAUTH_URL
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET

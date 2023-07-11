import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type Account,
  type DefaultSession,
  type NextAuthOptions,
  type Profile,
} from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { env } from "~/env.mjs";
import { prisma } from "~/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

type PotentialInvitee = {
  email: string;
  userId: string;
  providerName: string;
  providerAccountId: string;
};
/**
 * Sometimes we want to build something and keep it to ourself, or we want to share by allowing access
 * on an invitation only basis, this accomplishes that.
 *
 * Checks if given user is on the list (Invitee table) with enabled flag set to true.
 *
 * If someone attempts to log in, we upsert them into the Invitee table and set the enabled
 * flag to false so it only takes a word from the individual to yous' and yous' flipsis the switch, somehows...
 *
 * @see https://next-auth.js.org/configuration/callbacks#sign-in-callback
 */
const isInvited = async ({
  // user,
  account,
  profile,
}: {
  // user: User | AdapterUser;
  account: Account | null;
  profile?: Profile | undefined;
  // email?:
  //   | {
  //       verificationRequest?: boolean | undefined;
  //     }
  //   | undefined;
  // credentials?: unknown | undefined;
}) => {
  if (!profile) {
    console.log("isInvited was not passed a profile from Auth");
    return false;
  }

  if (!account) {
    console.log("isInvited was not passed an account from Auth");
    return false;
  }

  if (!profile.email) {
    console.log(
      "isInvited was expecting profile.email to be defined but it was not"
    );
    return false;
  }

  if (!profile.name) {
    console.log(
      "isInvited was expecting profile.name to be defined but it was not"
    );
    return false;
  }

  const potentialInvitee: PotentialInvitee = {
    email: profile.email,
    userId: profile.name,
    providerName: account.provider,
    providerAccountId: account.providerAccountId,
  };

  let invitee = await getInvitee(potentialInvitee);
  if (!invitee) {
    invitee = await addInviteeForPossibleFutureAccess(potentialInvitee);
  }
  // console.log("isInvited?", invitee.enabled);
  return invitee.enabled;
};

const getInvitee = (potentialInvitee: PotentialInvitee) => {
  const invitee = prisma.invitee.findUnique({
    where: {
      email_userId_providerName_providerAccountId: {
        email: potentialInvitee.email,
        userId: potentialInvitee.userId,
        providerName: potentialInvitee.providerName,
        providerAccountId: potentialInvitee.providerAccountId,
      },
    },
  });
  return invitee;
};

const addInviteeForPossibleFutureAccess = async (
  potentialInvitee: PotentialInvitee
) => {
  const possibleFutureInvitee = await prisma.invitee.upsert({
    where: {
      email_userId_providerName_providerAccountId: {
        email: potentialInvitee.email,
        userId: potentialInvitee.userId,
        providerName: potentialInvitee.providerName,
        providerAccountId: potentialInvitee.providerAccountId,
      },
    },
    create: {
      email: potentialInvitee.email,
      userId: potentialInvitee.userId,
      providerName: potentialInvitee.providerName,
      providerAccountId: potentialInvitee.providerAccountId,
    },
    update: {
      email: potentialInvitee.email,
      userId: potentialInvitee.userId,
      providerName: potentialInvitee.providerName,
      providerAccountId: potentialInvitee.providerAccountId,
    },
  });

  return possibleFutureInvitee;
};

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    signIn: isInvited,
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: env.NEXTAUTH_GITHUB_CLIENT_ID,
      clientSecret: env.NEXTAUTH_GITHUB_CLIENT_SECRET,
    }),
    GoogleProvider({
      clientId: env.NEXTAUTH_GOOGLE_CLIENT_ID,
      clientSecret: env.NEXTAUTH_GOOGLE_CLIENT_SECRET,
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};

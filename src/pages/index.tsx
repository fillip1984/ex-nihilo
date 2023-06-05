import { type NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";

const Home: NextPage = () => {
  const { data: sessionData } = useSession();
  return (
    <>
      <Head>
        <title>ex-nihilo</title>
        <meta name="description" content="Agenda and time tracker" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center bg-gradient-to-tr from-slate-600 to-slate-800 font-bold text-white">
        <div className="mt-8">
          {sessionData ? (
            <h3>Hello {sessionData.user.name as string}</h3>
          ) : (
            <h3>
              Please{" "}
              <button
                className="rounded-full bg-white/10 px-4 py-2 font-semibold text-white no-underline transition hover:bg-white/20"
                onClick={() => void signIn()}>
                {sessionData ? "Sign out" : "Sign in"}
              </button>
            </h3>
          )}
        </div>
      </main>
    </>
  );
};

export default Home;

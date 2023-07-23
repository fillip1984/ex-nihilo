import { type NextPage } from "next";
import { signIn, useSession } from "next-auth/react";
import Head from "next/head";
import TimelinePage from "~/components/timeline/Timeline";

const Home: NextPage = () => {
  const { data: sessionData } = useSession();
  return (
    <>
      <Head>
        <title>ex-nihilo</title>
        <meta name="description" content="Agenda and time tracker" />
        {/* <link rel="icon" href="/favicon.ico" /> */}
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest"></link>
      </Head>

      {sessionData ? <SignedInView /> : <NotSignedInView />}
    </>
  );
};

const SignedInView = () => {
  return <TimelinePage />;
};

const NotSignedInView = () => {
  return (
    <div className="flex h-screen flex-col items-center pt-8">
      <div className="flex flex-col items-center gap-4 rounded-lg border-2 border-white/40 px-8 py-4">
        <h3 className="mb-2">Please sign in</h3>

        <button
          type="button"
          onClick={() => void signIn("github")}
          className="flex w-full items-center gap-4 rounded border-gray-300 bg-white p-3 font-medium text-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="images/github-mark.png"
            alt="Google logo"
            className="h-8 w-8"
          />
          Sign in with GitHub
        </button>

        <button
          type="button"
          onClick={() =>
            void signIn("google", { callbackUrl: "http://localhost:3000" })
          }
          className="flex w-full items-center gap-4 rounded border-gray-300 bg-white p-3 font-medium text-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="images/google_G.png"
            alt="Google logo"
            className="h-8 w-8"
          />
          Sign in with google
        </button>
      </div>
    </div>
  );
};

export default Home;

import { type NextPage } from "next";
import { type Session } from "next-auth";
import { signIn, useSession } from "next-auth/react";
import Head from "next/head";
import { FaHourglassStart } from "react-icons/fa";
import TimelinePage from "~/components/timeline/Timeline";

const Home: NextPage = () => {
  const { data: sessionData } = useSession();
  return (
    <>
      <Head>
        <title>ex-nihilo</title>
        <meta name="description" content="Agenda and time tracker" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {sessionData ? (
        <SignedInView sessionData={sessionData} />
      ) : (
        <NotSignedInView />
      )}
    </>
  );
};

const SignedInView = ({ sessionData }: { sessionData: Session }) => {
  return (
    <>
      <div className="flex flex-col items-center">
        <h3 className="mt-4 font-bold">
          Hello {sessionData.user.name as string}
        </h3>
      </div>
      <TimelinePage />
    </>
  );
};

const NotSignedInView = () => {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-8">
      <h3>
        Please{" "}
        <button
          className="rounded-full bg-white/10 px-4 py-2 font-semibold text-white no-underline transition hover:bg-white/20"
          onClick={() => void signIn()}>
          Sign in
        </button>
      </h3>
      <FaHourglassStart className="h-32 w-32" />
      <h2>ex nihilo</h2>
    </div>
  );
};

export default Home;

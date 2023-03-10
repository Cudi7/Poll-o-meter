import { type NextPage } from "next";
import Head from "next/head";

import Navbar from "../components/Navbar";
import { cardData } from "../utils/cardData";
import { type cardDataInterface } from "../utils/interface";
import { useState } from "react";
import PollForm from "../components/PollForm";

const Home: NextPage = () => {
  const [hasStarted, setHasStarted] = useState(false);

  const handleStart = () => setHasStarted((prev) => !prev);

  return (
    <>
      <Head>
        <title>Poll-o-Meter</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar />
      <main className="flex min-h-screen flex-col items-center ">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 lg:mt-10 ">
          {hasStarted ? (
            <PollForm onStart={handleStart} />
          ) : (
            <>
              <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
                Poll <span className="text-[hsl(280,100%,70%)]">-o-</span> Meter
              </h1>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8 lg:grid-cols-3">
                {cardData.map((card, i) => (
                  <Card key={i} {...card} />
                ))}
              </div>
              <div className="flex flex-col items-center gap-2">
                {/* <p className="text-2xl text-white">
              {hello.data ? hello.data.greeting : "Loading tRPC query..."}
            </p> */}
                <button
                  onClick={handleStart}
                  className="rounded-full bg-white/40 px-10 py-3 text-2xl font-semibold text-white no-underline transition hover:bg-white/30"
                >
                  START
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
};

export default Home;

const Card = (card: cardDataInterface): JSX.Element => {
  return (
    <div className="flex max-w-xs  flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20">
      <h3 className="text-xl font-bold">{card.title}</h3>
    </div>
  );
};

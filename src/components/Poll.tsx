import { Poll } from "@prisma/client";
import type { Answer, Question, Votes } from "@prisma/client";
import React, { useMemo } from "react";
import { useSession } from "next-auth/react";
import { trpc } from "../utils/trpc";
import { useLocalStorage } from "usehooks-ts";
import { v4 as uuidv4 } from "uuid";
import Link from "next/link";
import { useRouter } from "next/router";

interface PollProps {
  pollData:
    | (Poll & {
        User: {
          name: string | null;
        } | null;
        question: Question | null;
        answer: Answer[];
        votes: Votes[];
      })
    | undefined;
  ip?: string;
}

interface NewVote {
  pollId: string;
  answerId: string;
  userIp: string;
  userId: string;
}

const Poll = ({ pollData, ip }: PollProps) => {
  const { data: sessionData } = useSession();
  const mutation = trpc.poll.newAnswer.useMutation();
  const customId = uuidv4();
  const utils = trpc.useContext();
  const router = useRouter();

  const [isCustomId, setIsCustomId] = useLocalStorage(
    "poll-o-meter-id",
    sessionData?.user?.id ? sessionData?.user?.id : ""
  );

  const handleInputChange = (pollId: string, answerId: string) => {
    // const pollId = e.target.name;
    // const answerId = e.target.value;
    const userIp = ip as string;

    const userId = sessionData?.user?.id
      ? sessionData?.user?.id
      : isCustomId.length
      ? isCustomId
      : handleNewId();

    console.log("hay usuario registrado?");
    console.log("su id en sistema es: " + sessionData?.user?.id);
    console.log("su id en aplicacion para BD es: " + userId);

    const data: NewVote = { pollId, answerId, userIp, userId };

    console.table(data);

    console.table(data);
    mutation.mutate(data, {
      onSuccess() {
        utils.poll.getAll.invalidate();
      },
    });
  };

  const handleNewId = (): string => {
    setIsCustomId(customId);
    return customId;
  };

  const handleVotesNumber = (answerId: string): number => {
    const currentVotes: number =
      pollData?.votes.reduce(
        (a, b) => (b.answerId === answerId ? a + 1 : a),
        0
      ) || 0;

    const totalVotes: number = pollData?.votes.length || 0;
    const C: number = (currentVotes / totalVotes) * 100;

    return isNaN(C) ? 0 : C;
  };

  const userHasAlreadyVoted: boolean = useMemo(() => {
    return pollData?.votes.find((el) => el.userId === isCustomId)
      ? true
      : false;
  }, [isCustomId, pollData?.votes]);

  console.log("ya he votado? " + userHasAlreadyVoted);
  console.log("estos son los votos...");
  pollData?.votes.forEach((el) => console.log(el.userId + isCustomId));

  const userIdVote: string | undefined = useMemo(() => {
    return pollData?.votes.filter((el) => el.userId === isCustomId)[0]
      ?.answerId;
  }, [isCustomId, pollData?.votes]);

  console.log(userIdVote + " this is the user id vote inside pollData (votes)");
  console.log("this is my current Id: " + isCustomId);

  const copyLink = () => {
    const base = "https://poll-o-meter.vercel.app/polls/";
    navigator.clipboard.writeText(`${base}${pollData?.id}`);
  };

  return (
    <div className="   min-w-[18rem]  p-4 md:h-full">
      <div className="relative h-full w-full max-w-sm md:h-auto 2xl:max-w-md">
        {/* Modal content */}
        <div className="relative rounded-lg  bg-gray-700 shadow">
          {/* Modal header */}
          <Link
            href={
              router.pathname === "/polls/[id]"
                ? `${pollData?.id}`
                : `polls/${pollData?.id}`
            }
          >
            <div className="rounded-t border-b px-6 py-4 dark:border-gray-600">
              <h3 className="text-base font-semibold  text-white lg:text-xl">
                {pollData?.question?.title}
              </h3>
            </div>
          </Link>
          {/* Modal body */}
          <div className="p-6">
            <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
              {/* Ends in: {pollData?.expires_at ? pollData.expires_at : "never"} */}
              Total Votes: {pollData?.votes.length}
              {userIdVote ? (
                <>
                  {" "}
                  <br /> You voted for:{" "}
                  {
                    pollData?.answer.filter((el) => el.id === userIdVote)[0]
                      ?.title
                  }{" "}
                </>
              ) : null}
            </p>
            <ul className="my-4 space-y-3">
              {pollData?.answer.map((el) => (
                <li
                  key={el.id}
                  id={el.id}
                  onClick={() => handleInputChange(el.pollId, el.id)}
                >
                  <div
                    className={` ${
                      userHasAlreadyVoted
                        ? "cursor-not-allowed bg-gray-700 text-white"
                        : "cursor-pointer bg-gray-600 text-white hover:bg-gray-500 hover:shadow"
                    } ${
                      userIdVote === el.id
                        ? "  bg-gradient-to-r from-slate-400 to-slate-400 bg-left-bottom bg-no-repeat    "
                        : "bg-gradient-to-r from-slate-400 to-slate-400 bg-left-bottom bg-no-repeat"
                    } group flex items-center rounded-lg   p-3 text-base   font-bold  `}
                    style={{
                      backgroundSize: `${Math.round(
                        handleVotesNumber(el.id)
                      )}% 100%`,
                    }}
                  >
                    <input
                      type="radio"
                      name={el.pollId}
                      // onChange={handleInputChange}
                      value={el.id}
                      disabled={userHasAlreadyVoted}
                    />
                    <span className={`ml-3 flex-1     `}>{el.title}</span>
                    <span className="ml-3 inline-flex items-center justify-center rounded bg-red-200 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                      {Math.round(handleVotesNumber(el.id))}%
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap justify-between gap-5  text-slate-500">
              <a
                href="#"
                onClick={copyLink}
                className="inline-flex items-center gap-1 text-xs font-normal text-gray-500 hover:underline dark:text-gray-400"
              >
                Copy and Share it!
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 00-9-9z"
                  />
                </svg>
              </a>
              {/* <a
                href="#"
                className="inline-flex items-center gap-1 text-xs font-normal text-gray-500 hover:underline dark:text-gray-400"
              >
                Comments
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                  />
                </svg>
              </a> */}
              <a
                href="#"
                className="inline-flex items-center gap-3 text-xs font-normal text-gray-500 hover:underline dark:text-gray-400"
              >
                Made by{" "}
                {` ${
                  (pollData?.User?.name?.split(" ")[0] as string)
                    .slice(0, 1)
                    .concat(
                      (pollData?.User?.name?.split(" ")[1] as string).slice(
                        0,
                        1
                      )
                    ) || "Anonymus"
                }`}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Poll;

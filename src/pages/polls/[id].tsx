import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Poll from "../../components/Poll";
import { trpc } from "../../utils/trpc";

const SinglePoll = () => {
  const [currentId, setCurrentId] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (router.query.id) setCurrentId(router.query.id as string);
  }, [router.query.id]);

  const { data } = trpc.poll.getOne.useQuery({ id: currentId });

  return (
    <>
      {" "}
      <Navbar />
      <div className="container mx-auto flex max-w-7xl flex-wrap justify-center">
        {data ? <Poll pollData={data} /> : null}
      </div>
    </>
  );
};

export default SinglePoll;

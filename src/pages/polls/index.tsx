import Loader from "../../components/Loader";
import Navbar from "../../components/Navbar";
import Poll from "../../components/Poll";
import { trpc } from "../../utils/trpc";

const Polls = () => {
  const { data, isLoading } = trpc.poll.getAll.useQuery();
  const ip = "test";
  return (
    <>
      <Navbar />
      <div className="container mx-auto flex max-w-7xl flex-wrap justify-center">
        {data && !isLoading ? (
          data.map((el, i) => <Poll key={i} pollData={el} ip={ip} />)
        ) : (
          <Loader />
        )}
      </div>
      ;
    </>
  );
};

export default Polls;

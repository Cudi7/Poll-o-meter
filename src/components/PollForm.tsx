import { useSession } from "next-auth/react";
import type { ChangeEvent, FormEvent } from "react";
import { useEffect } from "react";
import React, { useRef, useState } from "react";
import { fromZodError } from "zod-validation-error";
import { trpc } from "../utils/trpc";
import { questionSchema, answerSchema } from "../utils/validations";
import Alert from "./Alert";
import { useRouter } from "next/router";

interface Props {
  onStart: () => void;
}
interface OptionValues {
  name: string;
  value: string;
}

const PollForm = ({ onStart }: Props) => {
  const mutation = trpc.poll.newPoll.useMutation();
  const router = useRouter();

  const [optionValues, setOptionValues] = useState<OptionValues[]>([]);
  const [displayOptions, setDisplayOptions] = useState<boolean>(false);
  const [btnDisabled, setBtnDisabled] = useState<boolean>(true);
  const [displayAlert, setDisplayAlert] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string[]>([]);
  const [alertType, setAlertType] = useState<string>("");

  const questionInput = useRef<HTMLInputElement>(null);
  const questionInputValue = questionInput.current?.value.trim();

  const { data: sessionData } = useSession();

  useEffect(() => {
    if (mutation.isSuccess) router.push("/polls");
  }, [mutation.isSuccess, router]);

  const handleClose = (): void => {
    setDisplayOptions((prev) => !prev);
    onStart();
  };

  const displayQuestions = (): void => {
    setDisplayOptions(true);
    setOptionValues([{ name: "option_1", value: "" }]);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.value && !displayOptions) displayQuestions();

    const allInputsHaveLength = incrementAnswerInput(getFilteredValues(e));

    setBtnDisabled(allInputsHaveLength < 2);
  };

  const getFilteredValues = (e: ChangeEvent<HTMLInputElement>) => {
    const filteredValues = optionValues
      .map((el) =>
        el.name === e.target.name ? { ...el, value: e.target.value } : el
      )
      .filter((el) => el.value !== "")
      //.sort((a, b) => // Not necessary anymore***********************************
      // Number(a.name.split("_")[1]) > Number(b.name.split("_")[1]) ? 1 : -1
      //)
      .map((el, i) => ({ ...el, name: `option_${i + 1}` }));

    return filteredValues;
  };

  const incrementAnswerInput = (filteredValues: OptionValues[]): number => {
    const allInputsHaveLength = filteredValues.reduce(
      (a, b) => (b.value.length ? a + 1 : a),
      0
    );

    if (allInputsHaveLength === Number(filteredValues.length)) {
      setOptionValues([
        ...filteredValues,
        {
          name: `option_${allInputsHaveLength + 1}`,
          value: "",
        },
      ]);
    } else {
      setOptionValues(filteredValues);
    }
    return allInputsHaveLength;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const errorMessage: string[] = [];
    const filteredOptions = optionValues.filter((el) => el.value.trim().length);

    const questionResponse = questionSchema.safeParse(questionInputValue);

    if (!questionResponse.success)
      errorMessage.push(fromZodError(questionResponse.error).message);

    filteredOptions.forEach((el) => {
      const optionResponse = answerSchema.safeParse(el.value);

      if (!optionResponse.success)
        errorMessage.push(fromZodError(optionResponse.error).message);
    });

    const foundErrors = new Set(errorMessage);
    if (foundErrors.size > 0) return displayErrorMessage(foundErrors);

    mutation.mutate({
      user: sessionData?.user?.id || "",
      question: questionInputValue || "",
      answer: filteredOptions.map((el) => ({ title: el.value })),
    });
  };

  const displayErrorMessage = (foundErrors: Set<string>) => {
    setAlertType("error");
    foundErrors.forEach((el) => setAlertMessage([...alertMessage, el]));
    setDisplayAlert(true);

    setTimeout(() => {
      setDisplayAlert(false);
      setAlertType("");
      setAlertMessage([]);
    }, 5000);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className=" container mx-auto mt-6 mb-0 max-w-xl space-y-4 rounded-lg bg-white/10 p-8 shadow-2xl"
    >
      <div className="flex justify-between text-white">
        {" "}
        <p className="text-lg font-medium">Create Poll</p>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-6 w-6 cursor-pointer transition hover:scale-105 "
          onClick={handleClose}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>
      {displayAlert ? <Alert message={alertMessage} type={alertType} /> : null}

      <div>
        <label htmlFor="email" className="text-sm font-medium text-white">
          Question
        </label>

        <div className="relative mt-1">
          <input
            type="text"
            id="question"
            name="question"
            className="w-full rounded-lg border-gray-200 p-4 pr-12 text-sm shadow-sm"
            placeholder="Ask question"
            ref={questionInput}
            onChange={handleInputChange}
          />

          <span className="absolute inset-y-0 right-4 inline-flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-6 w-6 text-gray-700"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
              />
            </svg>
          </span>
        </div>
      </div>

      <div id="options">
        {displayOptions ? (
          <>
            <label htmlFor="options" className="text-sm font-medium text-white">
              Options
            </label>

            <ul>
              {optionValues.map((el) => (
                <li key={el.name} className="relative mt-1 animate-wiggle  ">
                  <input
                    type="text"
                    name={el.name}
                    className="w-full rounded-lg border-gray-200 p-4 pr-12 text-sm shadow-sm"
                    placeholder="+ Add"
                    value={el.value}
                    onChange={handleInputChange}
                  />
                  <span className="absolute inset-y-0 right-4 inline-flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="h-6 w-6 text-gray-700"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>
      {mutation.status === "loading" ? (
        <button
          disabled
          type="button"
          className="block w-full rounded-lg bg-indigo-600 px-5  py-3 text-sm font-medium text-white "
        >
          <svg
            role="status"
            className="mr-3 inline h-4 w-4 animate-spin text-white"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="#E5E7EB"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentColor"
            />
          </svg>
          Loading...
        </button>
      ) : (
        <button
          type="submit"
          className={`${
            btnDisabled
              ? "bg-indigo-200 text-gray-700"
              : "bg-indigo-600 text-white"
          } block w-full rounded-lg  px-5 py-3 text-sm font-medium `}
          disabled={btnDisabled}
        >
          Create
        </button>
      )}
    </form>
  );
};

export default PollForm;

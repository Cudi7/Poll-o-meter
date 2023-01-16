import React from "react";

const Alert = ({ message, type }: { message: string[]; type: string }) => {
  return (
    <>
      {message.map((el, i) => (
        <p
          key={i}
          className={`${
            type === "error"
              ? "bg-red-200 text-red-700"
              : " bg-green-200 text-green-700"
          }mb-3 rounded-lg  py-5 px-6 text-base `}
          role="alert"
        >
          <span
            className={`${
              type === "error" ? "text-red-800" : " text-green-800"
            } font-bold `}
          >
            {el.slice(0, el.indexOf(":") + 1)}
          </span>
          {el.slice(el.indexOf(":") + 1)}
        </p>
      ))}
    </>
  );
};

export default Alert;

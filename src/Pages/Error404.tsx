import * as React from "react";
import CABBaseLayout from "../Views/CABBaseLayout";
import "../App.css";
import { useParams } from "react-router-dom";

export const Error404: React.FC = () => {
  return (
    <CABBaseLayout
      loginable={false}
      contents={
        <>
          <h1>HTTP Error 404</h1>
          <p>The page you specified is not existed.</p>
        </>
      }
    />
  );
};

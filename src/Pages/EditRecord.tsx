import * as React from "react";
import CABBaseLayout from "../Views/CABBaseLayout";
import "../App.css";
import { useParams } from "react-router-dom";

export const EditRecord: React.FC = () => {
  //export class Test1 extends React.Component{
  let { bookId, recId } = useParams();

  return (
    <CABBaseLayout
      loginable={true}
      contents={
        <>
          <p>This is the page for editing record.</p>
          <p>bookId = {bookId}</p>
          <p>recId = {recId}</p>
        </>
      }
    />
  );
};

import * as React from "react";
import CABBaseLayout from "../Views/CABBaseLayout";
import "../App.css";
import { useParams } from "react-router-dom";

export const Test1: React.FC = () => {
  //export class Test1 extends React.Component{
  let { category, id } = useParams();
  //  const { id } = useParams();
  if (category === null) category = "null";
  else if (category === "") category = "empty";

  return (
    <CABBaseLayout loginable={true}>
      <>
        <p>This is the test page #1.</p>
        <p>Category = {category}</p>
        <p>ID = {id}</p>
      </>
    </CABBaseLayout>
  );
};

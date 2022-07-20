import React from "react";
import { Header, Footer } from "../components/Framing";
import "../App.css";
import { UserContextProvider } from "../Account";
import { useParams } from "react-router-dom";

export const Test1: React.FC = (props: {}) => {
  //export class Test1 extends React.Component{
  let { category, id } = useParams();
  //  const { id } = useParams();
  if (category === null) category = "null";
  else if (category === "") category = "empty";
  else category = typeof category;
  return (
    <div className="App">
      <UserContextProvider>
        <Header appTitle="Cloud Address-Book" subTitle=" test page1" />
        <div id="outer">
          <div id="contents-frame">
            <div id="contents" className="dsp80pc">
              <p>This is the test page #1.</p>
              <p>Category = {category}</p>
              <p>ID = {id}</p>
              <Footer />
            </div>
          </div>
        </div>
      </UserContextProvider>
    </div>
  );
};

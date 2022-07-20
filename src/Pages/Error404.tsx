import React from "react";
import { Header, Footer } from "../components/Framing";
import "../App.css";
import { UserContextProvider } from "../Account";

export const Error404: React.FC = (props: any) => {
  return (
    <div className="App">
      <UserContextProvider>
        <Header appTitle="Cloud Address-Book" subTitle=" test page1" />
        <div id="outer">
          <div id="contents-frame">
            <div id="contents" className="dsp80pc">
              <h1>HTTP Error 404</h1>
              <p>The page you specified is not existed.</p>
              <Footer />
            </div>
          </div>
        </div>
      </UserContextProvider>
    </div>
  );
};

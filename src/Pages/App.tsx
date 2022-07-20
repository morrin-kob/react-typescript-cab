import React, { Component } from "react";
import { Header, Footer } from "../components/Framing";
import { CABContents, CABCtrlBar } from "../Views/CloudAB";
import { CABSidebar } from "../Views/Sidebar";
import "../App.css";
import { UserContextProvider } from "../Account";
import { ContentsPropsType } from "../AppSettings";

export const App: React.FC = (props: any) => {
  const refControlbar = React.createRef<CABCtrlBar>();

  const fromHamberger = (info: ContentsPropsType) => {
    refControlbar.current.setData(info);
  };

  const getSidebar = () => {
    return <CABSidebar dir="left" handlerHamberger={fromHamberger} />;
  };

  return (
    <div className="App">
      <UserContextProvider>
        <Header
          appTitle="Cloud Address-Book"
          subTitle=" anytime, anywhere"
          handlerGetSidebar={getSidebar}
        />
        <div id="outer">
          <div id="contents-frame">
            <div id="contents" className="dsp80pc">
              <CABCtrlBar
                ref={refControlbar}
                abook={{ filter: "", tags: "", id: "", name: "" }}
              >
                <CABContents filter="" tags="" id="" name="" />
              </CABCtrlBar>
              <Footer />
            </div>
          </div>
        </div>
      </UserContextProvider>
    </div>
  );
};

//export default App;

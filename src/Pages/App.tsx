import * as React from "react";
//import { Footer } from "../components/Framing";
import { CABContents, CABCtrlBar } from "../Views/CloudAB";
import { CABSidebar } from "../Views/Sidebar";
import "../App.css";
import { ContentsPropsType } from "../AppSettings";
import CABBaseLayout from "../Views/CABBaseLayout";

export const App: React.FC = () => {
  const refControlbar = React.createRef<CABCtrlBar>();

  const fromHamberger = (info: ContentsPropsType) => {
    if (refControlbar.current) refControlbar.current.setData(info);
  };

  const getSidebar = () => {
    return <CABSidebar dir="left" handlerHamberger={fromHamberger} />;
  };

  const initialData: ContentsPropsType = {
    filter: "",
    tags: "",
    dataType: "abook",
    id: "",
    name: ""
  };

  const contents = (
    <CABCtrlBar ref={refControlbar} abook={initialData}>
      {/* it's going to get set data when it clones */}
      <CABContents abook={initialData} />
    </CABCtrlBar>
  );

  return (
    <CABBaseLayout
      getSidebar={getSidebar}
      loginable={true}
      contents={contents}
    />
  );
};

//export default App;

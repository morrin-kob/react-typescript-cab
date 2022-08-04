import * as React from "react";
//import { Footer } from "../components/Framing";
import { CABContents, CABCtrlBar } from "../Views/CloudAB";
import { CABSidebar, SBParamsType } from "../Views/Sidebar";
import { RecordType, ABEditRecord } from "../Views/ABRecord";
import "../App.css";
import { ContentsPropsType } from "../AppSettings";
import CABBaseLayout from "../Views/CABBaseLayout";
import { useParams } from "react-router-dom";
import { createBrowserHistory } from "history";
import Button from "@mui/material/Button";

let editingRec: RecordType = { id: "" };

export const App: React.FC = () => {
  let { abId, recId } = useParams();

  const [mode, setMode] = React.useState<"list" | "edit">("list");

  const refControlbar = React.createRef<CABCtrlBar>();

  const fromHamberger = (info: ContentsPropsType) => {
    if (refControlbar.current) refControlbar.current.setData(info);
  };

  const params: SBParamsType = { abId: abId || "", recId: recId || "" };

  const onEditRecord = (params: RecordType) => {
    editingRec = { ...params };
    setMode("edit");
  };

  const onEndEditRecord = () => {
    setMode("list");
  };

  // const initialData: ContentsPropsType = {
  //   filter: "",
  //   tags: "",
  //   id: abId || "",
  //   name: "",
  //   use: "private",
  //   editing: recId
  // };
  const emptyData: ContentsPropsType = {
    filter: "",
    tags: "",
    id: "",
    name: "",
    use: "private",
    editing: ""
  };

  const history = createBrowserHistory();

  const getSidebar = () => {
    if (mode === "list") {
      return (
        <CABSidebar
          dir="left"
          params={params}
          handlerHamberger={fromHamberger}
        />
      );
    } else if (mode === "edit") {
      return <></>;
    }
    return <></>;
  };

  const getContents = () => {
    if (mode === "list") {
      return (
        <CABCtrlBar
          ref={refControlbar}
          history={history}
          abook={{ ...emptyData }}
        >
          {/* it's going to get set data when it clones */}
          <CABContents abook={{ ...emptyData }} onEditRecord={onEditRecord} />
        </CABCtrlBar>
      );
    } else if (mode === "edit") {
      return <ABEditRecord rec={editingRec} onEndEdit={onEndEditRecord} />;
    }
    return <></>;
  };

  return (
    <CABBaseLayout getSidebar={getSidebar} loginable={true}>
      {getContents()}
    </CABBaseLayout>
  );
};

//export default App;

import * as React from "react";
//import { Footer } from "../components/Framing";
import { CABContents } from "../Views/CloudAB";
import { CABSidebar, SBParamsType } from "../Views/Sidebar";
import { RecordType } from "../CABDataTypes";
import { ABRecEditStateType, ABEditRecord } from "../Views/EditRecord";
import "../App.css";
import { ContentsPropsType } from "../AppSettings";
import CABBaseLayout from "../Views/CABBaseLayout";
import { useParams } from "react-router-dom";
import { createBrowserHistory } from "history";

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

let editingRec: ABRecEditStateType = { abid: "", recid: "", name: "" };

export const App: React.FC = () => {
  let { abId, recId } = useParams();

  const [mode, setMode] = React.useState<"list" | "edit">("list");
  const [abbar, setAbbar] = React.useState<ContentsPropsType>({ ...emptyData });

  const fromHamberger = (info: ContentsPropsType) => {
    console.log(`fromHamberger(info.name=${info.name})`);
    abId = info.id;
    recId = "";
    setAbbar({ ...info });
  };

  const params: SBParamsType = { abId: abId || "", recId: recId || "" };

  const onEditRecord = (abookId: string, rec: RecordType) => {
    editingRec.abid = abookId;
    editingRec.recid = rec.id;
    editingRec.data = rec;
    setMode("edit");
  };

  const onEndEditRecord = () => {
    //todo

    setMode("list");
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

  return (
    <CABBaseLayout getSidebar={getSidebar} loginable={true}>
      {mode === "list" && (
        <CABContents abook={{ ...abbar }} onEditRecord={onEditRecord} />
      )}
      {mode === "edit" && (
        <ABEditRecord rec={editingRec} onEndEdit={onEndEditRecord} />
      )}
    </CABBaseLayout>
  );
};

//export default App;

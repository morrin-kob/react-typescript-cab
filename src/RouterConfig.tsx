import * as React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { App } from "./Pages/App";
import { Test1 } from "./Pages/testpage1";
import { Test1_mob } from "./Pages/testpage1_mob";
//import { EditRecord } from "./Views/EditRecord";
import { Error404 } from "./Pages/Error404";
import { BrowserView, MobileView } from "react-device-detect";
import { isMobile } from "react-device-detect";

export const RouterConfig: React.FC = () => {
  const Test1Conts = isMobile ? Test1_mob : Test1;
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route index element={<App />} />
          <Route path="ab/:abId" element={<App />} />
          <Route path="ab/:abId/:recId" element={<App />} />
          {/* <Route path="edit/:bookId/:recId" element={<EditRecord />} /> */}
          <Route path="test1/:id" element={<Test1Conts />} />
          <Route path="test1/:category/:id" element={<Test1Conts />} />
          <Route path="*" element={<Error404 />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

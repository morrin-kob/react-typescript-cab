import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { App } from "./Pages/App";
import { Test1 } from "./Pages/testpage1";
import { Error404 } from "./Pages/Error404";

export const RouterConfig: React.FC = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route index element={<App />} />
          <Route path="test1/:id" element={<Test1 />} />
          <Route path="test1/:category/:id" element={<Test1 />} />
          <Route path="*" element={<Error404 />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

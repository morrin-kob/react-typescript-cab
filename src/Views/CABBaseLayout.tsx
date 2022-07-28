//import React from 'react';
import * as React from "react";
import { Component, ReactNode, useContext } from "react";
import AppHeader, { linkType } from "../components/AppHeader";
import AppFooter from "../components/AppFooter";
import { AccountButton } from "../components/AccountPalette";
import "../App.css";
import { UserContextProvider } from "../Account";
import { AppVal, ContentsPropsType } from "../AppSettings";
import LogoImage from "../assets/images/logo.png";
import InfoIcon from "@mui/icons-material/Info";
import HelpIcon from "@mui/icons-material/Help";
import { SvgIcon } from "@mui/material";
import { isMobile } from "react-device-detect";
import { ReferencedSymbol } from "typescript";

export type CABBaseProps = {
  getSidebar?: () => JSX.Element;
  loginable: boolean;
  contents: ReactNode;
};

const CABBaseLayout: React.FC<CABBaseProps> = (props) => {
  let links: linkType[] = [
    {
      href: "https://cloud.fudemame.jp/support/guide/address",
      text: "ご利用ガイド",
      icon: InfoIcon
    },
    {
      href: "https://cloud.fudemame.jp/support/faq/address-f",
      text: "FAQ",
      icon: HelpIcon
    }
  ];

  return (
    <div className="App">
      <UserContextProvider>
        <AppHeader
          appLogo={LogoImage}
          appTitle={AppVal.Header.pageTitle()}
          subTitle={AppVal.Header.subTitle()}
          handlerGetSidebar={props.getSidebar}
          noLogIn={!props.loginable}
          accButton={props.loginable && <AccountButton />}
          cxLogo={120}
          links={isMobile ? undefined : links}
        />
        <div id="outer">
          <div id="contents-frame">
            <div id="contents">
              {props.contents}
              <AppFooter text={AppVal.Footer.copyright()} />
            </div>
          </div>
        </div>
      </UserContextProvider>
    </div>
  );
};

export default CABBaseLayout;

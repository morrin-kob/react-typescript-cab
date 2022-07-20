//import React from 'react';
import React, { Component, useContext } from "react";
import { AppVal, ContentsPropsType } from "../AppSettings";
import { LoginButton, AccountButton } from "./AccountPalette";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { UserContext } from "../Account";

import { ReferencedSymbol } from "typescript";

export type HeaderPropType = {
  appTitle: string;
  subTitle: string;
  handlerGetSidebar?: () => object;
  noLogIn?: boolean;
};

function HeaderLeft(props: HeaderPropType) {
  let subtitle = "";
  /*
    if( props.subTitle.length !==0 ){
        subtitle = `- ${props.subTitle} -`;
    }
    */

  const user = useContext(UserContext);

  if (user.isUserLoggedIn()) {
    // subtitle = user.getUserName();
    //subtitle += "'s colletion";
  }

  const sidebar = props.handlerGetSidebar ? props.handlerGetSidebar() : <></>;
  let block = (
    <>
      {sidebar}
      <span className="app-title">{props.appTitle}</span>&nbsp;&nbsp;
      <span className="">{subtitle}</span>
    </>
  );

  return <div className="head-left">{block}</div>;
}

function HeaderRight(props: {}) {
  const user = useContext(UserContext);

  let rightblock = null;
  if (user.isUserLoggedIn() === false) {
    if (user.isUserLoggInable()) {
      rightblock = <LoginButton text="ログイン" user={user} />;
    }
  } else {
    rightblock = (
      <AccountButton
        userId={user.getUserId()}
        userName={user.getUserName()}
        logoff={user.Logoff}
      />
    );
  }

  return <div className="head-right">{rightblock}</div>;
}

function Header(props: HeaderPropType) {
  const user = useContext(UserContext);
  if (props.noLogIn) {
    user.SetUserLoggInable(false);
  }
  return (
    <AppBar position="static">
      <Toolbar variant="dense">
        <div className="dsp100pc">
          <HeaderLeft
            appTitle={props.appTitle}
            subTitle={props.subTitle}
            handlerGetSidebar={props.handlerGetSidebar}
          />
          <HeaderRight />
        </div>
      </Toolbar>
    </AppBar>
  );
}

class Footer extends Component {
  render() {
    return <footer>{AppVal.Footer.copyright()}</footer>;
  }
}

export { Header, Footer };

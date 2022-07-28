import * as React from "react";
import { Component, ReactNode, useContext } from "react";
import { UserContext } from "../Account";
import { AccountButton } from "./AccountPalette";
import AppBar from "@mui/material/AppBar";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import { SvgIcon } from "@mui/material";

export type linkType = {
  href: string;
  text: string;
  icon: typeof SvgIcon;
};

export type HeaderPropType = {
  appLogo?: HTMLImageElement;
  cxLogo?: number;
  appTitle: string;
  subTitle: string;
  handlerGetSidebar?: () => JSX.Element;
  noLogIn?: boolean;
  accButton?: ReactNode;
  links?: linkType[] | undefined;
};

const getLeftWidth = (props: HeaderPropType) => {
  let cxLeft = props.handlerGetSidebar ? 40 : 0;
  cxLeft +=
    props.appLogo && props.cxLogo ? props.cxLogo : props.appTitle.length * 12;
  cxLeft += 4;

  return cxLeft;
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

  let cxLeft = getLeftWidth(props);

  const logoStyle = { width: props.cxLogo };

  return (
    <Grid
      item
      pt={1}
      width={cxLeft}
      sx={{
        minWidth: { cxLeft }
      }}
    >
      <Grid container wrap="nowrap" width="100%">
        <Grid item sx={{ width: "2em" }}>
          {sidebar}
        </Grid>
        <Grid item>
          {props.appLogo ? (
            <img src={props.appLogo} style={logoStyle} alt="" />
          ) : (
            <span className="app-title">{props.appTitle}</span>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
}

function HeaderRight(props: HeaderPropType) {
  const user = useContext(UserContext);

  let rightblock = null;
  if (user.isUserLoggInable()) {
    rightblock = <AccountButton />;
  }

  const cxRest = `calc( 100% - ${getLeftWidth(props)}px )`;

  return (
    <Grid item width={cxRest} sx={{ minWidth: "26em" }}>
      <Grid container alignItems="end">
        <Grid item sx={{ flexGrow: 1 }} />
        {props.links &&
          props.links.map((link) => {
            return (
              <Grid item mb={1} pt={0.5} px={0.5}>
                <Link
                  pr={1}
                  color="#ffffff"
                  underline="none"
                  target="fcabow"
                  href={link.href}
                >
                  <IconButton
                    sx={{
                      marginRight: 1,
                      backgroundColor: "white",
                      width: "18px",
                      height: "18px"
                    }}
                    disabled={false}
                  >
                    <link.icon sx={{ color: "#c00000" }} />
                  </IconButton>
                  {link.text}
                </Link>
              </Grid>
            );
          })}
        <Grid item mt={0}>
          {rightblock}
        </Grid>
      </Grid>
    </Grid>
  );
}

export default function AppHeader(props: HeaderPropType) {
  const user = useContext(UserContext);
  if (props.noLogIn) {
    user.SetUserLoggInable(false);
  }
  return (
    <AppBar position="static" sx={{ backgroundColor: "#303030", height: 43 }}>
      <Grid container columnSpacing={0} wrap="nowrap" sx={{ fontSize: "90%" }}>
        <HeaderLeft {...props} />
        <HeaderRight {...props} />
      </Grid>
    </AppBar>
  );
}

import React, { useContext, useEffect, useMemo } from "react";
import "../App.css";
import { ajaxGet, ContentsPropsType } from "../AppSettings";
import { UserContext } from "../Account";
import { useRef } from "react";

//import * as React from 'react';
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import ImageListItemBar from "@mui/material/ImageListItemBar";
import InfoIcon from "@mui/icons-material/Info";
import PaletteIcon from "@mui/icons-material/Palette";
import LinearProgress from "@mui/material/LinearProgress";

import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";

import { CABBookList, CABAddressList } from "../Views/CloudAB";

let itemData = null;
let loading = false;

function Contents(props: ContentsPropsType) {
  const [selItem, setSelItem] = React.useState();
  const [loaded, setLoaded] = React.useState(false);
  const user = useContext(UserContext);

  function getContents() {
    let cont = null;
    if (user.isUserLoggedIn()) {
      itemData = null;
      cont = <CABAddressList abook={props} />;
    } else {
      itemData = null;
      loading = false;

      cont = (
        <div className="App-header">
          <p>
            Hey! what are you doing?
            <br />
            Just sign-in!
            <br />
            Come on! Rack'n'Roll!
          </p>
        </div>
      );
    }
    return cont;
  }

  let conts = getContents();
  return conts;
}

export { Contents };

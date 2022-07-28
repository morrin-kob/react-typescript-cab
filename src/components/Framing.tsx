//import React from 'react';
import * as React from "react";
import { Component, useContext } from "react";
import AppHeader, { HeaderPropType, linkType } from "./AppHeader";
import AppFooter from "./AppFooter";
import { AppVal, ContentsPropsType } from "../AppSettings";
import { LoginButton, AccountButton } from "./AccountPalette";
import AppBar from "@mui/material/AppBar";
import { UserContext } from "../Account";
import InfoIcon from "@mui/icons-material/Info";
import HelpIcon from "@mui/icons-material/Help";
import { SvgIcon } from "@mui/material";

import { ReferencedSymbol } from "typescript";

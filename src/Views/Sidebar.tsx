import * as React from "react";
import { useContext, useEffect, useMemo } from "react";
import "../App.css";
import { UserContext } from "../Account";
import {
  AppVal,
  ajaxGet,
  ajaxPost,
  fetchGet,
  reformResponse,
  ContentsPropsType,
  getHomeAddressID,
  isHomeAddress
} from "../AppSettings";
import { useNavigate } from "react-router-dom";
import { useQuery } from "react-query";

import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Grid from "@mui/material/Grid";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import DialogContentText from "@mui/material/DialogContentText";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import MenuItem from "@mui/material/MenuItem";
import SourceIcon from "@mui/icons-material/Source";
import PostAddIcon from "@mui/icons-material/PostAdd";
import FolderSharedIcon from "@mui/icons-material/FolderShared";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Badge from "@mui/material/Badge";
import { ABIcon } from "./ABIcons";

function WarningBlock(props: { message: string }) {
  let alert = null;
  if (props.message && props.message.length) {
    alert = (
      <Box sx={{ width: "100%", mt: 20 }}>
        <Alert severity="error">{props.message}</Alert>
      </Box>
    );
  } else {
    alert = <p>&nbsp;</p>;
  }
  return alert;
}

function CircleProgress(props: any) {
  return (
    <Box sx={{ width: "100%", mt: 20, textAlign: "center" }}>
      <CircularProgress />
    </Box>
  );
}

export type SBParamsType = {
  abId: string;
  recId: string;
};

//
// サイドバーに並べる住所録リスト
//
function CABBookList(props: {
  handleSetABook: (info: ContentsPropsType) => void;
}) {
  const user = useContext(UserContext);
  const [rlcounter, setRlcounter] = React.useState(0);

  const { isLoading, isFetching, isError, data, error } = useQuery(
    "groups_list",
    () => {
      let endpoint = `${user.getEpt()}/groups/list`;

      let params = {
        atk: user.getAToken(),
        ept: user.getEpm(),
        uag: user.getUag()
      };
      return fetchGet(endpoint, params);
    },
    { staleTime: 3000, cacheTime: 1000000 }
  );

  let cont = <></>;
  if (isError) {
    const load = reformResponse(error || "ロードエラーです");
    let errormess = load["error"] || load["statusText"] || "ロードエラーです";
    cont = <WarningBlock message={errormess} />;
  } else if (isLoading || isFetching) {
    cont = <CircleProgress />;
  } else {
    //if (data && "data" in data) {
    if ("data" in data === false) {
      if (parseInt(data["statusCode"], 10) === 401) {
        user.RefreshToken((res: {}) => {
          if (res["a_token"]) {
            setRlcounter(rlcounter + 1);
          }
        });
      }
      cont = <CircleProgress />;
    } else {
      cont = (
        <List>
          {data["data"].map((info: any, index: number) => (
            <MenuItem
              onClick={() => {
                let ab: ContentsPropsType = info;
                props.handleSetABook(ab);
              }}
              key={index}
              sx={{ height: 42 }}
              divider={true}
            >
              <Grid container columns={12}>
                <Grid container={true} item xs={11}>
                  <ABIcon name={info.icon} sx={{ mr: 1, color: info.color }} />
                  {info.name}
                </Grid>
                <Grid item xs={1}>
                  <Badge
                    max={99999}
                    sx={{ mb: 2 }}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "right"
                    }}
                    color="info"
                    badgeContent={info["summary"].count}
                  >
                    &nbsp;
                  </Badge>
                </Grid>
              </Grid>
            </MenuItem>
          ))}
        </List>
      );
    }
  }
  return cont;
}

function CABSidebar(props: {
  dir: "left" | "top" | "right" | "bottom";
  params: SBParamsType;
  handlerHamberger: (info: ContentsPropsType) => void;
}) {
  const [state, setState] = React.useState({
    top: false,
    left: false,
    bottom: false,
    right: false
  });

  const [abook, setABook] = React.useState<ContentsPropsType>({
    id: props.params.abId,
    name: "",
    use: "private"
  });

  const user = useContext(UserContext);

  const nav = useNavigate();

  // サイドバー内のメニューから何か選択された時
  const handleSel = (key: ContentsPropsType) => {
    //console.log(`selected:${JSON.stringify(key)}`);
    setABook(key);
  };

  // fire on choosed ab
  useEffect(() => {
    if (abook.id) {
      nav(`/ab/${abook.id}`);
      props.handlerHamberger({ ...abook });
    }
  }, [abook]);

  const toggleDrawer = (anchor: string, open: boolean) => (event: any) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }

    setState({ ...state, [anchor]: open });
  };

  // CABコンテンツ
  const cab_list = (anchor: string) => (
    <Box
      sx={{
        width: anchor === "top" || anchor === "bottom" ? "auto" : 250
      }}
      role="presentation"
    >
      <CABBookList
        handleSetABook={(info: ContentsPropsType) => {
          handleSel(info);
          setState({ ...state, [anchor]: false });
        }}
      />
    </Box>
  );

  if (!user.isUserLoggedIn()) {
    return <></>;
  } else if (props.params.abId && !abook.name) {
    let endpoint = `${user.getEpt()}/group/${props.params.abId}`;

    let params = {
      atk: user.getAToken(),
      ept: user.getEpm(),
      uag: user.getUag()
    };
    ajaxGet(endpoint, params, (json) => {
      //console.log(`get <group:>${JSON.stringify(json)}`);
      if ("statusCode" in json && parseInt(json["statusCode"], 10) === 401) {
        user.RefreshAndRetry(endpoint, "GET", params, (json: {}) => {
          if ("data" in json) {
            setABook({ ...json["data"] });
          } else {
            props.params.abId = "";
            setABook({ ...abook, id: "" });
          }
        });
      } else if ("data" in json) {
        setABook({ ...json["data"] });
      } else {
        props.params.abId = "";
        setABook({ ...abook, id: "" });
      }
    });
    return <></>;
  }
  return (
    <>
      <React.Fragment key={props.dir}>
        <IconButton
          onClick={toggleDrawer(props.dir, true)}
          edge="start"
          size="medium"
          style={{ backgroundColor: "transparent" }}
          aria-label="menu"
          sx={{ color: "white", mr: 1, mt: -1 }}
        >
          <MenuIcon />
        </IconButton>

        <Drawer
          anchor={props.dir}
          open={state[props.dir]}
          onClose={toggleDrawer(props.dir, false)}
          onKeyDown={toggleDrawer(props.dir, false)}
        >
          <DialogTitle sx={{ m: 0, p: 2 }}>
            {"住所録グループ"}
            <IconButton
              aria-label="close"
              onClick={toggleDrawer(props.dir, false)}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                color: "white"
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <div id="ablist">{cab_list(props.dir)}</div>
          <div>
            <Divider />
            <Button
              variant="contained"
              color="primary"
              startIcon={<PostAddIcon />}
            >
              {"住所録を追加　▼"}
            </Button>
            <Divider />
            <MenuItem
              onClick={() => {
                props.handlerHamberger({
                  id: getHomeAddressID(),
                  name: "マイプロフィール",
                  use: "private"
                });
              }}
              color="error"
              sx={{ height: "32px" }}
              divider={true}
            >
              <FolderSharedIcon color="error" />
              &nbsp;マイプロフィール
            </MenuItem>
          </div>
        </Drawer>
      </React.Fragment>
    </>
  );
}

export { CABSidebar };

import * as React from "react";
import { useContext, useEffect, useMemo } from "react";
import "../App.css";
import { UserContext } from "../Account";
import { AppVal, ajaxGet, ajaxPost, ContentsPropsType } from "../AppSettings";

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

function WarningBlock(props: { message: string }) {
  let alert = null;
  if (props.message && props.message.length) {
    alert = <Alert severity="error">{props.message}</Alert>;
  } else {
    alert = <p>&nbsp;</p>;
  }
  return <>{alert}</>;
}

//
// サイドバーに並べる住所録リスト
//
function CABBookList(props: {
  handleSetABook: (info: ContentsPropsType) => void;
}) {
  const [abooks, setABooks] = React.useState<ContentsPropsType[]>([]);
  const [abook, setABook] = React.useState<ContentsPropsType>({
    dataType: "abook",
    id: "",
    name: ""
  });
  const [error, setError] = React.useState<string>("");

  const user = useContext(UserContext);

  const fetchAddressBooks = () => {
    let endpoint = `${user.getEpt()}/groups/list`;

    let params = {
      atk: user.getAToken(),
      ept: user.getEpm(),
      uag: user.getUag()
    };
    ajaxGet(endpoint, params, (json) => {
      //console.log( JSON.stringify(json) );
      if ("statusCode" in json && parseInt(json["statusCode"], 10) === 401) {
        user.RefreshAndRetry(endpoint, "GET", params, (json: {}) => {
          if ("data" in json) {
            setError("");
            setABooks(json["data"]);
          } else setError(json["error"] || json["message"] || "load error");
        });
      } else {
        if ("data" in json) {
          setError("");
          setABooks(json["data"]);
        } else
          setError(
            json["error"] ||
              json["message"] ||
              `load error:${JSON.stringify(json)}`
          );
      }
    });
  };

  return (
    <>
      {(() => {
        if (error.length) {
          return (
            <DialogContentText>
              <WarningBlock message={error} />
            </DialogContentText>
          );
        } else if (abooks.length === 0) {
          fetchAddressBooks();
          return (
            <Box sx={{ width: "100%", mt: 20, textAlign: "center" }}>
              <CircularProgress />
            </Box>
          );
        } else {
          return (
            <List>
              {abooks.map((info, index) => (
                <>
                  <MenuItem
                    onClick={() => {
                      let ab: ContentsPropsType = info;
                      ab.dataType = "abook";
                      props.handleSetABook(ab);
                    }}
                    key={index}
                    sx={{ height: 42 }}
                    divider={true}
                  >
                    <Grid container columns={12}>
                      <Grid container={true} item xs={11}>
                        <SourceIcon sx={{ mr: 1 }} color="info" />
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
                </>
              ))}
            </List>
          );
        }
      })()}
    </>
  );
}

function CABSidebar(props: {
  dir: "left" | "top" | "right" | "bottom";
  handlerHamberger: (info: ContentsPropsType) => void;
}) {
  const [state, setState] = React.useState({
    top: false,
    left: false,
    bottom: false,
    right: false
  });

  const [all, setAll] = React.useState(true);

  const [abook, setABook] = React.useState<ContentsPropsType>({
    dataType: "abook",
    id: "",
    name: ""
  });

  const user = useContext(UserContext);

  // サイドバー内のメニューから何か選択された時
  const handleSel = (key: ContentsPropsType) => {
    setABook(key);
  };

  // Tag指定に変化があった時に発火
  useEffect(() => {
    props.handlerHamberger(abook);
  }, [all, abook]);

  const toggleDrawer = (anchor, open) => (event) => {
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
                  dataType: "profile",
                  id: "homeaddresses",
                  name: "マイプロフィール"
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

import * as React from "react";
import { useContext, useEffect, useMemo } from "react";
import "../App.css";
import { UserContext } from "../Account";
import {
  AppVal,
  fetchGet,
  reformResponse,
  ContentsPropsType,
  getHomeAddressID,
  isHomeAddress
} from "../AppSettings";
import MessageBox, { MessageBoxProps } from "../components/MessageBox";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "react-query";

import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Grid from "@mui/material/Grid";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import PopupProgress from "../components/PopupProgress";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import MenuItem from "@mui/material/MenuItem";
import PostAddIcon from "@mui/icons-material/PostAdd";
import FolderSharedIcon from "@mui/icons-material/FolderShared";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Badge from "@mui/material/Badge";
import { ABIcon } from "./ABIcons";
import { FieldEditBox } from "../components/EditParts";

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

function AddNewDialog(props: {
  open: boolean;
  handleClose: (added: boolean) => void;
}) {
  const [open, setOpen] = React.useState(props.open);
  const [inperror, setInperror] = React.useState(false);
  const [data, setData] = React.useState({ name: "" });
  const [progress, setProgress] = React.useState(false);
  const [msgbox, setMsgbox] = React.useState<MessageBoxProps>({
    open: false,
    caption: "",
    message: ""
  });

  const user = useContext(UserContext);
  let added: boolean = false;

  if (open !== props.open) {
    setOpen(props.open);
  }

  const cancelMsgBox = () => {
    setMsgbox({ ...msgbox, open: false });
  };
  const dispError = (json: {}) => {
    let error: string = json["error"] || json["statusText"] || "load error";
    let mbinfo: MessageBoxProps = {
      open: true,
      caption: "追加に失敗しました",
      message: error,
      icon: "error",
      options: [
        {
          text: "OK",
          handler: cancelMsgBox
        }
      ],
      onCancel: cancelMsgBox
    };
    setMsgbox(mbinfo);
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        setInperror(false);
        props.handleClose(added);
      }}
    >
      <DialogTitle sx={{ width: "18em" }}>
        住所録を追加
        <IconButton
          aria-label="close"
          onClick={() => {
            setOpen(false);
            props.handleClose(false);
          }}
          sx={{
            color: "white",
            position: "absolute",
            right: 8,
            top: 8
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Grid container>
          <div style={{ width: "15em" }}>
            <FieldEditBox
              label="住所録名"
              field="name"
              rec={data}
              onChangeField={(field: string, value: string | null) => {
                setInperror(false);
                let renew = { ...data };
                renew[field] = value;
                setData(renew);
              }}
            />
          </div>
          <Button
            variant="contained"
            color="primary"
            sx={{ py: 0, mt: 1 }}
            onClick={() => {
              if (!data["name"]) setInperror(true);
              else {
                setProgress(true);
                let url = `${user.getEpt()}/group`;
                let params = {};
                user.FetchWithRefreshedRetry(
                  url,
                  "POST",
                  (json) => {
                    setProgress(false);
                    if ("data" in json) {
                      added = true;
                      setData({ name: "" });
                      setOpen(false);
                      props.handleClose(true);
                    } else {
                      dispError(json);
                    }
                  },
                  {
                    params: params,
                    postdata: {
                      name: data.name,
                      use: "private"
                    }
                  }
                );
              }
            }}
          >
            追加
          </Button>
        </Grid>
        {inperror && <Alert severity="error">住所録名を入力してください</Alert>}
      </DialogContent>
      <MessageBox {...msgbox} />
      <PopupProgress open={progress} type="circle" />
    </Dialog>
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
  reload: number;
  handleSetABook: (info: ContentsPropsType) => void;
}) {
  const user = useContext(UserContext);
  const [reload, setReload] = React.useState(props.reload);
  const [rlcounter, setRlcounter] = React.useState(0);

  const queryClient = useQueryClient();

  if (reload !== props.reload) {
    setReload(props.reload);
    queryClient.resetQueries("groups_list");
  }

  let params = {
    ept: user.getEpm(),
    uag: user.getUag()
  };

  const { isLoading, isFetching, isError, data, error } = useQuery(
    "groups_list",
    () => {
      let endpoint = `${user.getEpt()}/groups/list`;

      return fetchGet(endpoint, params, { "X-atk": user.getAToken() });
    },
    { staleTime: 3000, cacheTime: 1000000 }
  );

  let cont = <></>;
  if (isError) {
    const load = reformResponse(error || "ロードエラーです");
    let errormess = load["error"] || load["statusText"] || "ロードエラーです";
    cont = (
      <div className="ablist">
        <WarningBlock message={errormess} />
      </div>
    );
  } else if (isLoading || isFetching) {
    cont = (
      <div className="ablist">
        <CircleProgress />
      </div>
    );
  } else {
    //if (data && "data" in data) {
    if ("data" in data === false) {
      if (parseInt(data["statusCode"], 10) === 401) {
        user.RefreshToken((res: {}) => {
          if (res["a_token"]) {
            queryClient.resetQueries("groups_list");
            setRlcounter(rlcounter + 1);
          }
        });
      }
      cont = (
        <div className="ablist">
          <CircleProgress />
        </div>
      );
    } else {
      cont = (
        <>
          <div className="ablist">
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
                      <ABIcon
                        name={info.icon}
                        sx={{ mr: 1, color: info.color }}
                      />
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
          </div>
        </>
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
  const [fetching, setFetching] = React.useState(false);
  const [msgbox, setMsgbox] = React.useState<MessageBoxProps>({
    open: false,
    caption: "",
    message: ""
  });
  const [adddlgopen, setAdddlgopen] = React.useState(false);
  const [reload, setReload] = React.useState(0);

  const addNewAB = () => {
    setAdddlgopen(true);
  };

  const user = useContext(UserContext);

  const nav = useNavigate();

  const cancelMsgBox = () => {
    setMsgbox({ ...msgbox, open: false });
  };

  // サイドバー内のメニューから何か選択された時
  const handleSel = (key: ContentsPropsType) => {
    //console.log(`selected:${JSON.stringify(key)}`);
    setABook(key);
    setState({ ...state, [props.dir]: false });
  };

  // fire on choosed ab
  useEffect(() => {
    if (abook.id) {
      nav(`/ab/${abook.id}`);
      //console.log(`effected:handleHamberger()`);
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
        reload={reload}
        handleSetABook={(info: ContentsPropsType) => {
          handleSel(info);
          //setState({ ...state, [anchor]: false });
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
          // onKeyDown={toggleDrawer(props.dir, false)}
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
          {cab_list(props.dir)}
          <Divider />
          <Button
            variant="contained"
            color="primary"
            startIcon={<PostAddIcon />}
            onClick={() => {
              addNewAB();
            }}
          >
            {"住所録を追加　▼"}
          </Button>
          <AddNewDialog
            open={adddlgopen}
            handleClose={(added) => {
              if (added) {
                setReload(reload + 1);
              }
              setAdddlgopen(false);
            }}
          />
          <Divider />
          <MenuItem
            onClick={() => {
              handleSel({
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
        </Drawer>
      </React.Fragment>
      <MessageBox {...msgbox} />
    </>
  );
}

export { CABSidebar };

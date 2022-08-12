import * as React from "react";
import { useContext, ReactNode, Children } from "react";
import { UserContext, UserContextType } from "../Account";
import ABRecDialog, {
  RecordType,
  ABRecEditStateType,
  ReformName
} from "./ABRecord";
import CheckableEditableTable, {
  CETColumnType
} from "../components/TableWithCheck";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import DeleteIcon from "@mui/icons-material/Delete";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import InputBase from "@mui/material/InputBase";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import ExpandCircleDownOutlinedIcon from "@mui/icons-material/ExpandCircleDownOutlined";
import SearchIcon from "@mui/icons-material/Search";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import TuneIcon from "@mui/icons-material/Tune";
import ShareIcon from "@mui/icons-material/Share";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import AccountCircle from "@mui/icons-material/AccountCircle";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import PulldownMenu, {
  PulldownMenuItem
} from "../components/PulldownMenuButton";
import {
  AppVal,
  ajaxGet,
  ajaxPost,
  ContentsPropsType,
  isHomeAddress
} from "../AppSettings";
import LinearProgress from "@mui/material/LinearProgress";
import { useRef } from "react";
import { BrowserHistory } from "history";

type ABInfoType = {
  loaded: boolean;
  addressData: Array<{}>;
  abloading: boolean;
  currentabook: string;
  abookname: string;
  error: string;
};

function loadAddress(
  user: UserContextType,
  abook: ContentsPropsType,
  whenLoad: (data: {}) => void
) {
  // addresses/[group_id]/list
  let url = user.getEpt();
  if (isHomeAddress(abook.id)) {
    url += "/homeaddresses/list";
  } else {
    url += `/addresses/${abook.id}/list`;
  }
  // console.log(
  //   `ajaxGet( ${url}, { access_token: ${user.getAToken()}, groupid: ${abook["id"]} } )`
  // );
  let params = {
    atk: user.getAToken(),
    ept: user.getEpm(),
    uag: user.getUag()
  };
  //console.log(`ajaxGet(${url}, ${JSON.stringify(params)})`);
  ajaxGet(url, params, (json) => {
    if ("data" in json) {
      whenLoad(json);
    } else {
      if (parseInt(json["statusCode"], 10) === 401) {
        console.log("loadAddress() RefreshToken!");
        user.RefreshAndRetry(url, "GET", params, whenLoad);
      } else {
        whenLoad(json);
      }
    }
  });
}

function get_liner_Progress() {
  return (
    <Box sx={{ width: "100%", mt: 20 }}>
      <LinearProgress />
    </Box>
  );
}

let abinfo: ABInfoType = {
  loaded: false,
  addressData: [],
  abloading: false,
  currentabook: "",
  abookname: "",
  error: ""
};

function CABAddressList(props: {
  abook: ContentsPropsType;
  onEditRecord: (abookId: string, rec: RecordType) => void;
}) {
  const user = useContext(UserContext);
  //const [loaded, setLoaded] = React.useState(false);
  const [rlcounter, setRlcounter] = React.useState(0);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);

  const handleRowSelection = (e: {}) => {
    alert(JSON.stringify(e));
  };
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  //  const recdlg = useRef(null);
  const recdlg = useRef<ABRecDialog>(null);

  const handleOnEdit = (key: string, label: string) => {
    props.onEditRecord(props.abook.id, { id: key });
    // if (recdlg && recdlg.current) {
    //   recdlg.current.setState({
    //     recid: key,
    //     name: label,
    //     open: true
    //   });
    // }
  };
  const handleOnShowDetail = (key: string, label: string) => {
    if (recdlg && recdlg.current) {
      recdlg.current.setState({
        ...recdlg.current.state,
        //status: "loading",
        recid: key,
        name: label,
        open: true
      });
    }
  };

  let cont = null;
  if (props.abook.id && props.abook.id.length) {
    if (abinfo.loaded) {
      if (
        abinfo.currentabook !== props.abook.id ||
        abinfo.abookname !== props.abook.name
      ) {
        abinfo.currentabook = props.abook.id;
        abinfo.abookname = props.abook.name;
        abinfo.addressData = [];
        abinfo.abloading = false;
        //setLoaded(false);
        abinfo.loaded = false;
      }
    } else {
      abinfo.currentabook = props.abook.id;
      if (abinfo.abookname !== props.abook.name) {
        abinfo.abloading = false;
        abinfo.abookname = props.abook.name;
      }
    }
  }

  if (abinfo.addressData.length === 0) {
    if (abinfo.abloading === false) {
      if (abinfo.currentabook) {
        abinfo.abloading = true;
        abinfo.error = "";

        if (abinfo.abookname) {
          loadAddress(user, props.abook, (load) => {
            //console.log("loadAddress: " + JSON.stringify(load));
            if (load && "data" in load && Array.isArray(load["data"])) {
              abinfo.addressData = load["data"];
              //console.log(`loadAddress(): ${JSON.stringify(load)}`);
            } else {
              //console.log(`load-error:${JSON.stringify(load)}`);
              abinfo.error =
                load["error"] || load["statusText"] || "ロードエラーです";
            }
            //abinfo.abloading = false;
            // console.log(
            //   `loading has finished: length=${abinfo.addressData.length}`
            // );
            abinfo.loaded = true;
            //setLoaded(true);
            setRlcounter(rlcounter + 1);
            setPage(0);
          });
        }
      }
    }
    if (!abinfo.loaded) {
      if (abinfo.abloading) {
        cont = get_liner_Progress();
        //console.log(`progress`);
      } else {
        cont = (
          <Box sx={{ width: "100%", mt: 20 }}>
            <p>Choose Address-Book from the hamburger-menu.</p>
          </Box>
        );
      }
    } else {
      cont = (
        <Box sx={{ width: "100%", mt: 20 }}>
          {abinfo.error && <p>{abinfo.error}</p>}
        </Box>
      );
    }
  } else {
    const columns_home: CETColumnType[] = [
      // : GridColDef[]
      {
        id: "name",
        label: "氏名",
        minWidth: 80,
        maxWidth: 80
      },
      {
        id: "address",
        label: "住所",
        minWidth: 120
      },
      {
        id: "telephone",
        label: "電話番号",
        minWidth: 60,
        maxWidth: 100
      }
    ];
    const columns_org: CETColumnType[] = [
      // : GridColDef[]
      {
        id: "name",
        label: "氏名",
        minWidth: 80,
        maxWidth: 80
      },
      {
        id: "organizationName",
        label: "勤務先",
        minWidth: 80,
        maxWidth: 80
      },
      {
        id: "address",
        label: "住所",
        minWidth: 120
      },
      {
        id: "telephone",
        label: "電話番号",
        minWidth: 60,
        maxWidth: 100
      }
    ];

    const orgPriority = props.abook.use ? props.abook.use === "corp" : false;
    const columns = orgPriority ? columns_org : columns_home;

    /*
    let rows: GridRowsProp = [
      //: GridRowsProp
    ];
    */
    const rows: {
      [key: string]: any;
    }[] = [];

    let name = "";
    abinfo.addressData.map((rec: RecordType, index) => {
      name = ReformName(rec);
      let address = "";
      let tel = "";

      let org = rec.organization ? rec.organization.name || "" : "";

      if (rec.addresses && rec.addresses.length) {
        let fa = rec.addresses[0];
        const addrEmpty =
          !fa.zipcode && !fa.region && !fa.city && !fa.street && !fa.building;
        //for( let index in rec.addresses ){
        if (addrEmpty || orgPriority) {
          for (let index = 0; index < rec.addresses.length; index++) {
            const adr = rec.addresses[index];
            if (
              (org.length && adr.kindof === "office") ||
              (org.length === 0 && adr.kindof === "home")
            ) {
              fa = rec.addresses[index];
              break;
            }
          }
        }
        if (!fa["zipcode"]) fa["zipcode"] = "";
        if (!fa["street"]) fa["street"] = "";
        if (!fa["building"]) fa["building"] = "";
        address = `〒${fa.zipcode} ${fa.region}${fa.city}${fa.street} ${fa.building}`;
      }

      if (rec.telephones && rec.telephones.length) {
        let ft = rec.telephones[0];
        //for( let index in rec.telephones ){
        for (let index = 0; index < rec.telephones.length; index++) {
          const ti = rec.telephones[index];
          if (ti.number.length) {
            if (org.length) {
              if (ti.kindof === "offtel" || ti.kindof === "offcell") {
                ft = rec.telephones[index];
                break;
              }
            } else {
              if (ti.kindof === "cell" || ti.kindof === "tel") {
                ft = rec.telephones[index];
                break;
              }
            }
          }
        }
        try {
          tel = ft.number;
        } catch (e) {
          console.log(JSON.stringify(ft));
        }
      }

      rows.push({
        name: name,
        organizationName: org,
        address: address,
        telephone: tel,
        id: rec["id"],
        index: index
      });

      return rec["id"];
    });

    //if (!props.abook.name) props.abook.name = "temporary";
    if (rows.length === 0) {
      cont = <></>;
    } else {
      cont = (
        <div style={{ height: "100%", width: "100%" }}>
          <CheckableEditableTable
            tableTitle={props.abook.name}
            columns={columns}
            rowHSize="small"
            rowPerPageOptions={[25, 50, 100]}
            keyField="id"
            labelField="name"
            rows={rows}
            onEdit={(key: string, label: string) => {
              handleOnEdit(key, label);
            }}
            onDetail={(key: string, label: string) => {
              handleOnShowDetail(key, label);
            }}
            checkTarget={{
              icon: DeleteIcon,
              commandTip: "削除",
              onClick: (sels: readonly string[]) => {
                alert("削除");
              }
            }}
          />

          <ABRecDialog
            user={user}
            abook={props.abook}
            onEdit={props.onEditRecord}
            ref={recdlg}
          />
        </div>
      );
    }
    //console.log(`out address list:${props.abook.name}`);
    // if( props.abook.name === 'temporary' ){
    //   const element = document.getElementById('addrlist');
    //   ReactDOM.render( cont, element );
    //   return null;
    // }
  }

  return cont;
}

export type CABCtrlBarProps = {
  ref?: object;
  history: BrowserHistory;
  abook: ContentsPropsType;
  children: ReactNode;
};

const settingItems: PulldownMenuItem[] = [
  {
    text: "住所録の設定",
    icon: TuneIcon,
    handler: () => {
      alert("住所録の設定 を選択");
    }
  },
  {
    text: "住所録の共有",
    icon: ShareIcon,
    handler: () => {
      alert("住所録の共有 を選択");
    }
  },
  {
    text: "",
    handler: () => {}
  },
  {
    text: "インポート",
    icon: UploadFileIcon,
    handler: () => {
      alert("インポート を選択");
    }
  },
  {
    text: "エクスポート",
    icon: FileDownloadIcon,
    handler: () => {
      alert("エクスポート を選択");
    }
  },
  {
    text: "",
    handler: () => {}
  },
  {
    text: "住所録の削除",
    icon: DeleteForeverIcon,
    handler: () => {
      alert("住所録の削除 を選択");
    }
  }
];

// typescript 導入したら class 宣言がややこしくなった
class CABCtrlBar extends React.Component<CABCtrlBarProps, ContentsPropsType> {
  constructor(props: CABCtrlBarProps) {
    super(props);
    //this.state = props.abook;
    this.state = { ...props.abook };
  }
  tid: number = 0;

  //static contextType = UserContext; ← typescript 導入前
  // ↓ typescript 導入後　　こんなん分かるかー！
  static contextType = UserContext;
  context!: React.ContextType<typeof UserContext>;

  setData(data: ContentsPropsType) {
    if (data.tags && data.tags.length) {
      if (this.tid) clearTimeout(this.tid);
      this.tid = setTimeout(() => {
        this.setState({ tags: data.tags });
        this.tid = 0;
      }, 1000);
    } else {
      //console.log(`setData(${JSON.stringify(data)})`);
      this.setState({ ...data });
    }
  }

  addNewRecord() {
    alert("新規追加　が選択された");
  }

  render() {
    let controls = null;

    if (this.context.isUserLoggedIn() === false) {
      controls = <span className="explain">ログインしてください</span>;
    } else {
      const cxAddBtn = "8em"; //[()+新規作成]
      const cxGearBtn = "3em"; //歯車アイコン
      const cxMiddle = `calc( 100% - calc( ${cxAddBtn} + ${cxGearBtn} ))`;
      controls = (() => {
        return this.state.id ? (
          <Box sx={{ width: "100%" }}>
            <Grid container>
              <Grid item width={cxAddBtn}>
                <Button
                  variant="contained"
                  sx={{ fontSize: "95%" }}
                  onClick={(e) => {
                    this.addNewRecord();
                  }}
                >
                  <PersonAddAlt1Icon />
                  新規作成
                </Button>
              </Grid>
              <Grid item width={cxMiddle}>
                <Grid container columns={10}>
                  <Grid item xs={4}>
                    <Paper
                      component="form"
                      sx={{
                        p: "2px 2px",
                        mr: 1,
                        display: "flex",
                        alignItems: "center"
                      }}
                    >
                      <InputBase
                        sx={{ ml: 1, flex: 1 }}
                        placeholder="タグでフィルタ"
                        inputProps={{ "aria-label": "search" }}
                      />
                      <IconButton
                        type="submit"
                        sx={{ p: "5px" }}
                        aria-label="search"
                      >
                        <ExpandCircleDownOutlinedIcon />
                      </IconButton>
                    </Paper>
                  </Grid>
                  <Divider />
                  <Grid item xs={6}>
                    <Paper
                      component="form"
                      sx={{
                        p: "2px 2px",
                        display: "flex",
                        alignItems: "center"
                      }}
                    >
                      <InputBase
                        sx={{ ml: 1, flex: 1 }}
                        placeholder="検索"
                        inputProps={{ "aria-label": "search" }}
                      />
                      <IconButton
                        type="submit"
                        sx={{ p: "5px" }}
                        aria-label="search"
                      >
                        <SearchIcon />
                      </IconButton>
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item width={cxGearBtn}>
                <PulldownMenu
                  tipText="住所録の設定"
                  popupId={"setting-menu"}
                  icon={SettingsOutlinedIcon}
                  items={settingItems}
                />
              </Grid>
            </Grid>
          </Box>
        ) : null;
      })();
    }
    // 制御エリアで設定した値をコンテンツに反映できるように、
    // CABCtrlBarの下にコンテンツコンポーネントを置き、CABCtrlBarのrender()内で子供（コンテンツ）を
    // 按配するようにした　つまり、下記 div id="contents-inner" はここでしないと、親子関係を結んだ
    // 状態では外からはできないため
    // ※ 単に {children} だと変更したpropsが渡せないので、下記のように { React.Children.map(...)} のようにした
    const childrenWithProps = Children.map(this.props.children, (child) => {
      switch (typeof child) {
        case "string":
          return child;
        case "object":
          return React.cloneElement(
            child as React.ReactElement<{ abook: ContentsPropsType }>,
            { abook: { ...this.state } }
          );
        default:
          //console.log(`child type=${typeof child}`);
          return null;
      }
    });
    return (
      <>
        {controls}
        {childrenWithProps}
      </>
    );
  }
}

function CABContents(props: {
  abook: ContentsPropsType;
  onEditRecord: (abookId: string, rec: RecordType) => void;
}) {
  const user = useContext(UserContext);

  let cont = null;

  //console.log(`----CABContents(${JSON.stringify(props.abook)})`);
  if (user.isUserLoggedIn()) {
    cont = (
      <CABAddressList abook={props.abook} onEditRecord={props.onEditRecord} />
    );
  } else {
    cont = (
      <div className="App-header">
        <p>
          Hey! What are you doing?
          <br />
          Just sign in!
          <br />
          Come on! Rack'n'Roll!
        </p>
      </div>
    );
  }
  return cont;
}

export type CABEditCtrlBarProps = {
  rec: ABRecEditStateType;
  onEndEdit: () => void;
  children: ReactNode;
};
const CABEditCtrlBar = (props: CABEditCtrlBarProps) => {
  // const childrenWithProps = Children.map(props.children, (child) => {
  //   switch (typeof child) {
  //     case "string":
  //       return child;
  //     case "object":
  //       return React.cloneElement(
  //         child as React.ReactElement<{
  //           rec: ABRecEditStateType;
  //         }>,
  //         { rec: props.rec }
  //       );
  //     default:
  //       //console.log(`child type=${typeof child}`);
  //       return null;
  //   }
  // });
  return (
    <>
      <Box sx={{ width: "100%", align: "left" }}>
        <Button
          variant="outlined"
          onClick={(e) => {
            props.onEndEdit();
          }}
        >
          戻る
        </Button>
        <Button color="info">保存</Button>
        <Button variant="outlined">保存して新規作成</Button>
        <Button variant="outlined">
          <DeleteForeverIcon />
        </Button>
      </Box>
      <Box>
        <h3>レコードの編集</h3>
      </Box>
      {props.children}
    </>
  );
};

export { CABContents, CABAddressList, CABCtrlBar, CABEditCtrlBar };

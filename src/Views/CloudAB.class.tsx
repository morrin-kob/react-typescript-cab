import * as React from "react";
import { useContext, ReactNode, Children } from "react";
import { UserContext, UserContextType } from "../Account";
import { useQuery } from "react-query";
import ABRecDialog, {
  RecordType,
  ABRecEditStateType,
  ReformName
} from "./ABRecord";
import ABSettings from "./ABFunctions";
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
  fetchGet,
  reformResponse,
  ContentsPropsType,
  isHomeAddress
} from "../AppSettings";
import LinearProgress from "@mui/material/LinearProgress";
import { BrowserHistory } from "history";
import DefPersonImg from "../assets/images/person.png";

type ABInfoType = {
  loaded: boolean;
  addressData: Array<{}>;
  abloading: boolean;
  currentabook: string;
  abookname: string;
  error: string;
};

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

type RecdlgState = {
  open: boolean;
  rec: {
    id: string;
    name: string;
  };
};

function CABAddressList(props: {
  abook: ContentsPropsType;
  onEditRecord: (abookId: string, rec: RecordType) => void;
}) {
  const user = useContext(UserContext);
  //const [loaded, setLoaded] = React.useState(false);
  const [rlcounter, setRlcounter] = React.useState(0);
  const [recdlg, setRecdlg] = React.useState<RecdlgState>({
    open: false,
    rec: { id: "", name: "" }
  });
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);

  const { isLoading, isFetching, isError, data, error } = useQuery(
    props.abook.id,
    () => {
      console.log(`loading:${props.abook.id}`);

      let url = user.getEpt();
      if (isHomeAddress(props.abook.id)) {
        url += "/homeaddresses/list";
      } else {
        url += `/addresses/${props.abook.id}/list`;
      }
      let params = {
        atk: user.getAToken(),
        ept: user.getEpm(),
        uag: user.getUag()
      };
      return fetchGet(url, params);
    },
    { staleTime: 3000, cacheTime: 1000000 }
  );

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

  const closeRecDialog = () => {
    setRecdlg({ ...recdlg, open: false });
  };

  const handleOnEdit = (key: string, label: string) => {
    props.onEditRecord(props.abook.id, { id: key });
  };
  const handleOnShowDetail = (key: string, label: string) => {
    setRecdlg({ open: true, rec: { id: key, name: label } });
  };

  const onDeleteRecord = (abid: string, rec: RecordType) => {
    closeRecDialog();
  };

  const onCopyRecord = (abid: string, rec: RecordType) => {};

  const onSendRecord = (abid: string, rec: RecordType) => {};

  let cont = null;

  if (isError) {
    const load = reformResponse(error || { error: "ロードエラーです" });
    abinfo.error = load["error"] || load["statusText"] || "ロードエラーです";
    cont = (
      <Box sx={{ width: "100%", mt: 20 }}>
        {abinfo.error && <p>{abinfo.error}</p>}
      </Box>
    );
  } else if (isLoading || isFetching) {
    cont = get_liner_Progress();
  } else if (data) {
    if ("data" in data === false) {
      if (parseInt(data["statusCode"], 10) === 401) {
        user.RefreshToken((res: {}) => {
          if (res["a_token"]) {
            setRlcounter(rlcounter + 1);
          }
        });
      }
      cont = get_liner_Progress();
    } else {
      abinfo.addressData = data["data"];
      console.log(`loaded:${props.abook.name}`);

      const columns_home: CETColumnType[] = [
        // : GridColDef[]
        {
          id: "face_picture",
          label: "",
          sortable: false,
          minWidth: "36px",
          maxWidth: "36px",
          image: true
        },
        {
          id: "name",
          label: "氏名",
          sortable: true,
          minWidth: "4.5em",
          maxWidth: "8em"
        },
        {
          id: "address",
          label: "住所",
          sortable: false,
          minWidth: "10em",
          maxWidth: "100em"
        },
        {
          id: "telephone",
          label: "電話番号",
          sortable: true,
          minWidth: "5.5em",
          maxWidth: "8em"
        }
      ];
      const columns_org: CETColumnType[] = [
        // : GridColDef[]
        {
          id: "face_picture",
          label: "",
          sortable: false,
          minWidth: "36px",
          maxWidth: "36px",
          image: true
        },
        {
          id: "name",
          label: "氏名",
          sortable: true,
          minWidth: "4.5em",
          maxWidth: "8em"
        },
        {
          id: "organizationName",
          label: "勤務先",
          sortable: true,
          minWidth: "5em",
          maxWidth: "12em"
        },
        {
          id: "address",
          label: "住所",
          sortable: false,
          minWidth: "10em",
          maxWidth: "100em"
        },
        {
          id: "telephone",
          label: "電話番号",
          sortable: true,
          minWidth: "5.5em",
          maxWidth: "8em"
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
        let facepict = `${DefPersonImg}`;

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
          face_picture: facepict,
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

            {recdlg.open && (
              <ABRecDialog
                recid={recdlg.rec.id}
                name={recdlg.rec.name}
                user={user}
                abook={props.abook}
                onEdit={props.onEditRecord}
                onDelete={onDeleteRecord}
                onCopy={onCopyRecord}
                onSend={onSendRecord}
                onClose={() => {
                  closeRecDialog();
                }}
              />
            )}
          </div>
        );
      }
    }
    //console.log(`out address list:${props.abook.name}`);
    // if( props.abook.name === 'temporary' ){
    //   const element = document.getElementById('addrlist');
    //   ReactDOM.render( cont, element );
    //   return null;
    // }
  } else {
    cont = <Box sx={{ width: "100%", mt: 20 }}>{<p>no data</p>}</Box>;
  }

  return cont;
}

export type CABCtrlBarProps = {
  ref?: object;
  history: BrowserHistory;
  abook: ContentsPropsType;
  children: ReactNode;
};

// typescript 導入したら class 宣言がややこしくなった
class CABCtrlBar extends React.Component<CABCtrlBarProps, ContentsPropsType> {
  settingdlg: React.RefObject<ABSettings>;
  constructor(props: CABCtrlBarProps) {
    super(props);
    this.state = { ...props.abook };
    this.settingdlg = React.createRef<ABSettings>();
  }
  tid: number = 0;

  //static contextType = UserContext; ← typescript 導入前
  // ↓ typescript 導入後　　こんなん分かるかー！
  static contextType = UserContext;
  context!: React.ContextType<typeof UserContext>;

  setData = (data: ContentsPropsType) => {
    if (data.tags && data.tags.length) {
      if (this.tid) clearTimeout(this.tid);
      this.tid = setTimeout(() => {
        this.setState({ ...this.state, tags: data.tags });
        this.tid = 0;
      }, 1000);
    } else {
      if (this.state.command !== data.command) {
        this.setState({ ...this.state, command: data.command });
      } else {
        //console.log(`setData(${JSON.stringify(data)})`);
        this.setState({ ...data });
      }
    }
  };

  //settingdlg = useRef<ABSettings>(null);
  changeSettings = (abook: ContentsPropsType) => {
    let newval = { ...abook };
    this.setState({
      ...this.state,
      name: abook.name,
      color: abook.color,
      icon: abook.icon,
      use: abook.use
    });
    //this.setData( newval );
  };

  openSetting = () => {
    if (this.settingdlg && this.settingdlg.current) {
      this.settingdlg.current.handleOpen(
        { ...this.state },
        this.changeSettings
      );
    }
  };

  addNewRecord = () => {
    //alert("新規追加　が選択された");
    this.setData({ ...this.state, command: "newrec" });
  };

  settingItems: PulldownMenuItem[] = [
    {
      text: "住所録の設定",
      icon: TuneIcon,
      handler: () => {
        this.openSetting();
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

  render() {
    let controls = null;

    //console.log(`render()use:${this.state.use}`);
    if (this.context.isUserLoggedIn() === false) {
      controls = <span className="explain">ログインしてください</span>;
    } else {
      const cxAddBtn = "8em"; //[()+新規作成]
      const cxGearBtn = "3em"; //歯車アイコン
      const cxMiddle = `calc( 100% - calc( ${cxAddBtn} + ${cxGearBtn} ))`;
      controls = (() => {
        return this.state.id ? (
          <>
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
                    items={this.settingItems}
                  />
                </Grid>
              </Grid>
            </Box>
            <ABSettings
              ref={this.settingdlg}
              abook={this.state}
              user={this.context}
            />
          </>
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
    if (props.abook.id) {
      cont = (
        <CABAddressList abook={props.abook} onEditRecord={props.onEditRecord} />
      );
    } else {
      cont = (
        <Box sx={{ width: "100%", mt: 20 }}>
          <p>Choose Address-Book from the hamburger-menu.</p>
        </Box>
      );
    }
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
          sx={{ mr: 1 }}
          variant="outlined"
          onClick={(e) => {
            props.onEndEdit();
          }}
        >
          戻る
        </Button>
        <Button color="info" variant="contained" sx={{ mr: 1 }}>
          保存
        </Button>
        <Button variant="outlined" sx={{ mr: 1 }}>
          保存して新規作成
        </Button>
        <Button variant="outlined" sx={{ px: 0 }}>
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

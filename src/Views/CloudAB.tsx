import * as React from "react";
import { useContext, ReactNode, Children } from "react";
import { UserContext, UserContextType } from "../Account";
import { useQuery, useQueryClient } from "react-query";
import { RecordType } from "../CABDataTypes";
import ABRecDialog, { ReformName } from "./ABRecDialog";
import ABSettings, { ABSettingDialogPropsType } from "./ABFunctions";
import ImportDialog from "./ImportDialog";
import CheckableEditableTable, {
  CETColumnType
} from "../components/TableWithCheck";
import PopupProgress from "../components/PopupProgress";
import MessageBox, { MessageBoxProps } from "../components/MessageBox";
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
  fetchGet,
  reformResponse,
  ContentsPropsType,
  isHomeAddress
} from "../AppSettings";
import LinearProgress from "@mui/material/LinearProgress";
import DefPersonImg from "../assets/images/person.png";
import { SvgIcon } from "@mui/material";

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

const CABAddressList = (props: {
  abook: ContentsPropsType;
  onEditRecord: (abookId: string, rec: RecordType) => void;
}) => {
  const [abook, setAbook] = React.useState({ ...props.abook });
  //const [loaded, setLoaded] = React.useState(false);
  const [rlcounter, setRlcounter] = React.useState(0);
  const [recdlg, setRecdlg] = React.useState<RecdlgState>({
    open: false,
    rec: { id: "", name: "" }
  });
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const [progress, setProgress] = React.useState(false);
  const [msgbox, setMsgbox] = React.useState<MessageBoxProps>({
    open: false,
    caption: "",
    message: ""
  });

  const user = useContext(UserContext);

  const cancelMsgBox = () => {
    setMsgbox({ ...msgbox, open: false });
  };

  let params = {
    ept: user.getEpm(),
    uag: user.getUag()
  };
  const queryClient = useQueryClient();
  const { isLoading, isFetching, isError, data, error } = useQuery(
    abook.id,
    () => {
      // console.log(`loading:${abook.id}`);

      let url = user.getEpt();
      if (isHomeAddress(abook.id)) {
        url += "/homeaddresses/list";
      } else {
        url += `/addresses/${abook.id}/list`;
      }
      return fetchGet(url, params, { "X-atk": user.getAToken() });
    },
    { staleTime: 3000, cacheTime: 1000000 }
  );

  if (abook.id !== props.abook.id) {
    setAbook({ ...props.abook });
    return <></>;
  }

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
    props.onEditRecord(abook.id, { id: key });
  };
  const handleOnShowDetail = (key: string, label: string) => {
    setRecdlg({ open: true, rec: { id: key, name: label } });
  };

  const onRecordDeleted = (abid: string, rec: RecordType) => {
    queryClient.resetQueries(abook.id);

    closeRecDialog();
  };

  // plural
  const DeleteRecords = (sels: readonly string[]) => {
    if (progress === true) return;
    setProgress(true);
    let postdata: {}[] = [];
    let url = `${user.getEpt()}/addres`;
    sels.forEach(function (recid) {
      postdata.push({
        uri: `${url}/${recid}`,
        method: "DELETE",
        headers: {
          "Content-Type": "application/json; charset=UTF-8;"
        }
      });
    });

    user.FetchWithRefreshedRetry(
      `${user.getEpt()}/batch`,
      "POST",
      (json) => {
        setProgress(false);
        if ("data" in json) {
          queryClient.resetQueries(abook.id);
        } else {
          let error: string =
            json["error"] || json["statusText"] || "load error";
          let mbinfo: MessageBoxProps = {
            open: true,
            caption: "削除エラー",
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
        }
      },
      { postdata: postdata }
    );
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
            params["atk"] = res["a_token"];
            setRlcounter(rlcounter + 1);
            queryClient.resetQueries(abook.id);
          }
        });
      }
      cont = get_liner_Progress();
    } else {
      abinfo.addressData = data["data"];
      //console.log(`loaded:${abook.name}`);

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

      const orgPriority = abook.use ? abook.use === "corp" : false;
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

      //if (!abook.name) abook.name = "temporary";
      if (rows.length === 0) {
        cont = (
          <>
            <Box sx={{ py: 2, textAlign: "center" }}>
              レコードが登録されてません
            </Box>
            <hr />
          </>
        );
      } else {
        cont = (
          <div style={{ height: "100%", width: "100%" }}>
            <CheckableEditableTable
              tableTitle={abook.name}
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
                onClick: DeleteRecords
              }}
            />
            <PopupProgress open={progress} type="circle" />
            <MessageBox {...msgbox} />
            {recdlg.open && (
              <ABRecDialog
                recid={recdlg.rec.id}
                name={recdlg.rec.name}
                user={user}
                abook={abook}
                onEdit={props.onEditRecord}
                onDeleted={onRecordDeleted}
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
    //console.log(`out address list:${abook.name}`);
  } else {
    cont = <Box sx={{ width: "100%", mt: 20 }}>{<p>no data</p>}</Box>;
  }

  return cont;
};

const CABContentsInner = (props: {
  abook: ContentsPropsType;
  onEditRecord: (abookId: string, rec: RecordType) => void;
}) => {
  const [abook, setAbook] = React.useState({ ...props.abook });

  const user = useContext(UserContext);

  if (user.isUserLoggedIn()) {
    if (abook.id !== props.abook.id) {
      setAbook({ ...props.abook });
      return <></>;
    }
    if (abook.id) {
      //console.log(`<CABAddressList ${abook.name} />`);
      return (
        <CABAddressList
          abook={{ ...abook }}
          onEditRecord={props.onEditRecord}
        />
      );
    } else {
      return (
        <Box sx={{ width: "100%", mt: 20 }}>
          <p>Choose Address-Book from the hamburger-menu.</p>
        </Box>
      );
    }
  } else {
    return (
      <div className="App-header">
        <p>
          Hey! What are you doing?
          <br />
          Just sign in!
          <br />
          Come on! Rock'n'Roll!
        </p>
      </div>
    );
  }
};

const CABContents = (props: {
  abook: ContentsPropsType;
  onEditRecord: (abookId: string, rec: RecordType) => void;
}) => {
  const [abook, setAbook] = React.useState({ ...props.abook });
  const [settingdlg, setSettingDlg] = React.useState(false);
  const [importdlg, setImportDlg] = React.useState(false);
  const [msgbox, setMsgbox] = React.useState<MessageBoxProps>({
    open: false,
    caption: "",
    message: ""
  });
  const cancelMsgBox = () => {
    setMsgbox({ ...msgbox, open: false });
  };

  const user = useContext(UserContext);

  if (props.abook.id !== abook.id) {
    console.log(`CABCtrlBar:abook changed! ${abook.name}➖${props.abook.name}`);
    setAbook({ ...props.abook });
    return <></>;
  }

  const openSetting = () => {
    setSettingDlg(true);
  };

  const saveSetting = (abook: ContentsPropsType) => {
    setAbook({ ...abook });
  };

  const execDeleteABook = () => {
    let url = `${user.getEpt()}/group/${abook.id}`;
    user.FetchWithRefreshedRetry(url, "DELETE", (json) => {
      //todo
    });
  };
  const deleteABook = () => {
    let mbinfo: MessageBoxProps = {
      open: true,
      caption: "確認",
      message: `この住所録「${abook.name}」を削除します
                削除すると元には戻せません
                　
                よろしいですか？`,
      icon: "question",
      options: [
        {
          text: "削除",
          handler: () => {
            alert("todo:実際の削除作業");
          }
        },
        {
          text: "キャンセル",
          handler: cancelMsgBox
        }
      ],
      onCancel: cancelMsgBox
    };
    setMsgbox(mbinfo);
  };

  const addNewRecord = () => {
    props.onEditRecord(abook.id, { id: "new" });
    // todo
  };

  const settingItems: PulldownMenuItem[] = [
    {
      text: "住所録の設定",
      icon: TuneIcon,
      handler: openSetting
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
        setImportDlg(true);
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
      handler: deleteABook
    }
  ];

  let controls = <></>;

  //console.log(`render()use:${this.state.use}`);
  if (user.isUserLoggedIn() === false) {
    controls = <span className="explain">ログインしてください</span>;
  } else {
    const cxAddBtn = "8em"; //[()+新規作成]
    const cxGearBtn = "3em"; //歯車アイコン
    const cxMiddle = `calc( 100% - calc( ${cxAddBtn} + ${cxGearBtn} ))`;

    if (abook.id) {
      //console.log(`CABCtrlBar:rendering:${abook.name}`);
      controls = (
        <>
          <Box sx={{ width: "100%" }}>
            <Grid container>
              <Grid item width={cxAddBtn}>
                <Button
                  variant="contained"
                  sx={{ fontSize: "95%" }}
                  onClick={(e) => {
                    addNewRecord();
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
                  tipText={`住所録の設定`}
                  popupId={"setting-menu"}
                  icon={SettingsOutlinedIcon}
                  items={settingItems}
                />
              </Grid>
            </Grid>
          </Box>
          <ABSettings
            open={settingdlg}
            abook={{ ...abook }}
            onSave={saveSetting}
            onClose={() => {
              setSettingDlg(false);
            }}
          />
          <MessageBox {...msgbox} />
          {importdlg && (
            <ImportDialog
              abook={{ ...abook }}
              onClose={(added: boolean) => {
                setImportDlg(false);
              }}
            />
          )}
        </>
      );
    } else {
      controls = <></>;
    }
  }

  return (
    <>
      {controls}
      <CABContentsInner abook={abook} onEditRecord={props.onEditRecord} />
    </>
  );
};

CABContents.defaultProps = {
  abook: { id: "", name: "", use: "private" },
  onEditRecord: () => {}
};

export { CABContents, CABAddressList };

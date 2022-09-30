import * as React from "react";
import { useContext, useRef, ReactNode, Children } from "react";
import { UserContext, UserContextType } from "../Account";
import { RecordType, loadRecord, PersonalPicture } from "../CABDataTypes";
import Encoding from "encoding-japanese";
import ParseCXML from "../ParseCXML";
import ParseVCard from "../ParseVCard";
import ParseJADR from "../ParseJADR";
import ParseCSV from "../ParseCSV";

import MessageBox, { MessageBoxProps } from "../components/MessageBox";

import {
  EditFieldTitle,
  SquareIconButton,
  FieldEditBox,
  FieldTextArea,
  FieldComboBox,
  FieldDatePicker,
  ReformField
} from "../components/EditParts";

import Paper from "@mui/material/Paper";
import Dialog from "@mui/material/Dialog";
import Modal from "@mui/material/Modal";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Backdrop from "@mui/material/Backdrop";
import PopupProgress from "../components/PopupProgress";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import AddLocationAltOutlinedIcon from "@mui/icons-material/AddLocationAltOutlined";
import Grid from "@mui/material/Grid";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import TablePagination from "@mui/material/TablePagination";
import Divider from "@mui/material/Divider";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import ReadMoreIcon from "@mui/icons-material/ReadMore";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import FileOpenIcon from "@mui/icons-material/FileOpen";
import { Typography } from "@mui/material";
import Alert from "@mui/material/Alert";
import Tooltip from "@mui/material/Tooltip";

import {
  ContentsPropsType,
  isHomeAddress,
  reformText,
  reformResponse
} from "../AppSettings";
import CircularProgress from "@mui/material/CircularProgress";
import { SvgIcon } from "@mui/material";
import { isMobile } from "react-device-detect";
import { BrowserView, MobileView } from "react-device-detect";

import { ThemeProvider, createTheme } from "@mui/material/styles";

const mfields = {
  //external_ids?: ExternalIDBlock[];
  //pictures?: PictureBlock[];
  //created_at?: string;
  //updated_at: "更新日",
  //created_by?: string;
  //updated_by?: string;
  //face_picture?: PictureBlock;
  //deleted?: boolean;
  lastname: "姓",
  firstname: "名",
  lastkana: "姓フリガナ",
  firstkana: "名フリガナ",
  suffix: "敬称",
  gender: "性別",
  birthdate: "誕生日",
  tags: "タグ",
  code: "顧客コード",
  memo: "メモ",

  "joint_names.0.lastname": "連名1：姓",
  "joint_names.0.firstname": "連名1：名",
  "joint_names.0.lastkana": "連名1：フリガナ姓",
  "joint_names.0.firstkana": "連名1：フリガナ名",
  "joint_names.0.suffix": "連名1：敬称",
  "joint_names.0.gender": "連名1：性別",
  "joint_names.0.birthdate": "連名1：誕生日",

  "joint_names.1.lastname": "連名2：姓",
  "joint_names.1.firstname": "連名2：名",
  "joint_names.1.lastkana": "連名2：フリガナ姓",
  "joint_names.1.firstkana": "連名2：フリガナ名",
  "joint_names.1.suffix": "連名2：敬称",
  "joint_names.1.gender": "連名2：性別",
  "joint_names.1.birthdate": "連名2：誕生日",

  "joint_names.2.lastname": "連名3：姓",
  "joint_names.2.firstname": "連名3：名",
  "joint_names.2.lastkana": "連名3：フリガナ姓",
  "joint_names.2.firstkana": "連名3：フリガナ名",
  "joint_names.2.suffix": "連名3：敬称",
  "joint_names.2.gender": "連名3：性別",
  "joint_names.2.birthdate": "連名3：誕生日",

  "joint_names.3.lastname": "連名4：姓",
  "joint_names.3.firstname": "連名4：名",
  "joint_names.3.lastkana": "連名4：フリガナ姓",
  "joint_names.3.firstkana": "連名4：フリガナ名",
  "joint_names.3.suffix": "連名4：敬称",
  "joint_names.3.gender": "連名4：性別",
  "joint_names.3.birthdate": "連名4：誕生日",

  "joint_names.4.lastname": "連名5：姓",
  "joint_names.4.firstname": "連名5：名",
  "joint_names.4.lastkana": "連名5：フリガナ姓",
  "joint_names.4.firstkana": "連名5：フリガナ名",
  "joint_names.4.suffix": "連名5：敬称",
  "joint_names.4.gender": "連名5：性別",
  "joint_names.4.birthdate": "連名5：誕生日",

  "organization.name": "会社名",
  "organization.kana": "会社名フリガナ",
  "organization.dept1": "部署名1",
  "organization.dept2": "部署名2",
  "organization.title": "役職名",

  //addresses.kindof?: "home" | "office" | null;
  // 0:home, 1:office, 2:other
  "addresses.0.zipcode": "郵便番号",
  "addresses.0.region": "都道府県",
  "addresses.0.city": "市郡区",
  "addresses.0.street": "町村地番",
  "addresses.0.building": "アパート・マンション名",
  "addresses.0.station": "最寄り駅",
  //addresses.label?: string;
  "addresses.0.geolocation": "緯度経度",

  "addresses.1.zipcode": "郵便番号(会社)",
  "addresses.1.region": "都道府県(会社)",
  "addresses.1.city": "市郡区(会社)",
  "addresses.1.street": "町村地番(会社)",
  "addresses.1.building": "建物名(会社)",
  "addresses.1.station": "最寄り駅(会社)",
  //addresses.label?: string;
  "addresses.1.geolocation": "緯度経度(会社)",

  "addresses.2.zipcode": "郵便番号(その他)",
  "addresses.2.region": "都道府県(その他)",
  "addresses.2.city": "市郡区(その他)",
  "addresses.2.street": "町村地番(その他)",
  "addresses.2.building": "建物名(その他)",
  "addresses.2.station": "最寄り駅(その他)",
  "addresses.2.geolocation": "緯度経度(その他)",
  "addresses.2.label": "「その他」の名称",

  //emails: EmailBlock[];
  // 0:home, 1:office, 2:cell, 3:other
  //kindof: "cell" | "home" | "office" | null;
  "emails.0.address": "メールアドレス",
  "emails.1.address": "メールアドレス(仕事)",
  "emails.2.address": "メールアドレス(携帯)",
  "emails.3.address": "メールアドレス(その他1)",
  "emails.3.label": "その他1の名称",
  "emails.4.address": "メールアドレス(その他2)",
  "emails.4.label": "その他2の名称",
  "emails.5.address": "メールアドレス(その他3)",
  "emails.5.label": "その他3の名称",

  //telephones: TelephoneBlock[];
  //kindof: "tel" | "fax" | "cell" | "offtel" | "offfax" | "offcell" | null;
  // 0:tel, 1:cell, 2:offtel, 3:offcell, 4:fax, 5:offfax 6:others
  "telephones.0.number": "TEL(自宅)",
  "telephones.1.number": "TEL(携帯)",
  "telephones.2.number": "TEL(会社)",
  "telephones.3.number": "TEL(仕事携帯)",
  "telephones.4.number": "FAX(自宅)",
  "telephones.5.number": "FAX(会社)",
  "telephones.6.number": "TEL(その他1)",
  "telephones.6.label": "TELその他1の名称",
  "telephones.7.number": "TEL(その他2)",
  "telephones.7.label": "TELその他2の名称",
  "telephones.8.number": "TEL(その他3)",
  "telephones.8.label": "TELその他3の名称",

  //weburls: WebUrlBlock[];
  //kindof: "profile" | "blog" | "hp" | "office" | null;
  // 0:hp, 1:office, 2:blog, 3:profile, 4:others
  "weburls.0.url": "URL(HP)",
  "weburls.1.url": "URL(会社HP)",
  "weburls.2.url": "URL(Blog)",
  "weburls.3.url": "URL(profile)",
  "weburls.4.url": "URL(その他1)",
  "weburls.4.label": "URLその他1の名称",
  "weburls.5.url": "URL(その他2)",
  "weburls.5.label": "URLその他2の名称",
  "weburls.6.url": "URL(その他3)",
  "weburls.6.label": "URLその他3の名称",

  //extendprops: ExtendPropsBlock[];
  "extendprops.0.data.marks": "",
  "extendprops.0.data.primaryName": "",
  "extendprops.0.data.prntaddr": "",
  "extendprops.0.data.corpMemo": "",
  "extendprops.0.family0.bloodtype": "",
  "extendprops.0.family0.ext": "",
  "extendprops.0.family0.relation": "",
  "extendprops.0.family0.prName": "",
  "extendprops.0.family0.eudc": "",
  "extendprops.0.family1.bloodtype": "",
  "extendprops.0.family1.ext": "",
  "extendprops.0.family1.relation": "",
  "extendprops.0.family1.prName": "",
  "extendprops.0.family1.eudc": "",
  "extendprops.0.family2.bloodtype": "",
  "extendprops.0.family2.ext": "",
  "extendprops.0.family2.relation": "",
  "extendprops.0.family2.prName": "",
  "extendprops.0.family2.eudc": "",
  "extendprops.0.family3.bloodtype": "",
  "extendprops.0.family3.ext": "",
  "extendprops.0.family3.relation": "",
  "extendprops.0.family3.prName": "",
  "extendprops.0.family3.eudc": "",
  "extendprops.0.family4.bloodtype": "",
  "extendprops.0.family4.ext": "",
  "extendprops.0.family4.relation": "",
  "extendprops.0.family4.prName": "",
  "extendprops.0.family4.eudc": "",
  "extendprops.0.family5.bloodtype": "",
  "extendprops.0.family5.ext": "",
  "extendprops.0.family5.relation": "",
  "extendprops.0.family5.prName": "",
  "extendprops.0.family5.eudc": "",
  "extendprops.0.data.extra1": "",
  "extendprops.0.data.extra2": "",
  "extendprops.0.data.extra3": "",
  "extendprops.0.data.extra4": "",
  "extendprops.0.data.extra5": "",
  "extendprops.0.data.srdata1": "",
  "extendprops.0.data.srdata2": "",
  "extendprops.0.data.srdata3": "",
  "extendprops.0.data.srdata4": "",
  "extendprops.0.data.srdata5": "",
  "extendprops.0.data.srdata6": ""
};

const refField = (rec: RecordType, field: string) => {
  if (field.search(".") !== -1) {
    //console.log(`ReformField:field=${rp.field}`);
    let inners = field.split(/\]\.|\.|\[/);
    field = inners.pop() || "";
    inners.forEach((name) => {
      if (name in rec === false || rec[name] === null) {
        rec[name] = {};
      }
      rec = rec[name];
    });
  }
  return rec[field];
};

const handleParseABFiles = (
  user: UserContextType,
  file: Blob,
  filename: string,
  parsed: (json: {}) => void
) => {
  let fext = filename.split(".").pop()?.toLowerCase();
  const reader = new FileReader();
  reader.onload = (e: any) => {
    const codes = new Uint8Array(e.target.result);
    const encoding = Encoding.detect(codes);
    const unicodeString = Encoding.convert(codes, {
      to: "unicode",
      from: encoding,
      type: "string"
    });
    if (fext === "csv") {
      ParseCSV(user, unicodeString, parsed);
      // parse(unicodeString, {
      //   header: true,
      //   dynamicTyping: true,
      //   skipEmptyLines: true,
      //   complete: (results: {}) => {
      //     //console.log(`${JSON.stringify(results)}`);
      //     parsed(results);
      //   }
      // });
      // } else if (fext === "json") {
      //   let json = JSON.parse(unicodeString);
      //   parsed(json);
    } else if (fext === "xml") {
      ParseCXML(unicodeString, parsed);
    } else if (fext === "vcf") {
      ParseVCard(unicodeString, parsed);
    } else if (fext === "jad") {
      ParseJADR(unicodeString, parsed);
    }
  };
  reader.readAsArrayBuffer(file);
};

type AttachFieldsType = {
  mfield: string;
  attach: string;
  records: any[];
  recno: number;
  ifields: string[];
  selected: (mfield: string, attach: string) => void;
};
const AttachFields = (props: AttachFieldsType) => {
  const [open, setOpen] = React.useState(true);
  const [sheet, setSheet] = React.useState({
    recno: props.recno,
    reccount: props.records.length
  });

  const handleSelect = (mfield: string, attach: string) => {
    setOpen(false);
    props.selected(mfield, attach);
  };
  const handleCancel = () => {
    setOpen(false);
    props.selected("", "");
  };

  let cxDlg = isMobile ? "calc( 100vw )" : "calc( 60vw )";
  const listHeight = "calc( 100vh - 25.00em )";

  const columns: { type: string; title: string; width: string }[] = [
    { type: "field", title: "項目", width: "4em" },
    { type: "check", title: "", width: "2em" },
    { type: "data", title: "データ", width: "calc( 100% - 6em )" }
  ];

  let message = "";
  if (props.attach) {
    message = `現在 項目${props.attach} が割り付けられています`;
    message += "\n行をクリックすることで割付を変更できます";
  } else {
    message = `現在どの項目も割り付けられていません`;
    message += "\n行をクリックすることで割付を設定できます";
  }

  let rec = props.records[sheet.recno];
  return (
    <>
      <Dialog open={open} onClose={handleCancel} sx={{ fontSize: "12pt" }}>
        <Grid container sx={{ p: 0, mb: 0 }}>
          <Grid item sx={{ flexGrow: 1 }}>
            {/* <Typography variant="h3" sx={{ px: 1 }}>
              住所録項目: {mfields[props.mfield]}
            </Typography> */}
            <h2 style={{ marginBottom: 0 }}>
              住所録項目: {mfields[props.mfield]}
            </h2>
          </Grid>
          <Grid item>
            <IconButton
              aria-label="close"
              onClick={handleCancel}
              size="small"
              sx={{
                color: "white",
                p: 0,
                m: 0,
                position: "absolute",
                right: 8,
                top: 8
              }}
            >
              <CloseIcon />
            </IconButton>
          </Grid>
        </Grid>
        <Divider />

        <DialogContent sx={{ p: 1 }}>
          <div style={{ fontSize: "90%", color: "var(--col-explain)" }}>
            {message.split(/\n|<br>|<br \/>/i).map((str) => {
              return <div>{str}</div>;
            })}
          </div>
        </DialogContent>
        <DialogContent
          sx={{ p: 0, width: cxDlg, minWidth: "20em", maxWidth: 1200 }}
        >
          <TableContainer
            sx={{
              height: listHeight,
              mb: 1,
              border: "solid #e0e0e0",
              borderWidth: "0 1px 1px 0"
            }}
          >
            <Table
              stickyHeader
              sx={{ minWidth: 250 }}
              aria-labelledby="a-tableTitle"
            >
              <TableHead>
                <TableRow sx={{}}>
                  {columns.map((column, index) => (
                    <TableCell
                      sx={{
                        py: 0,
                        px: 1,
                        width: column.width,
                        backgroundColor: "#a0c0f0"
                      }}
                      key={column.type}
                      align="left"
                      padding="normal"
                    >
                      {column.title}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              {/* ------------------------- */}
              <TableBody>
                {props.ifields.map((ifield) => (
                  <TableRow
                    sx={{
                      "&:hover": {
                        backgroundColor: "#e0e0ff"
                      }
                    }}
                    onClick={() => {
                      handleSelect(props.mfield, ifield);
                    }}
                  >
                    {columns.map((column, index) => {
                      let bgcol = column.type === "data" ? "" : "#f0f0f0";
                      let currSel = false;
                      if (ifield === props.attach) {
                        currSel = true;
                        bgcol = "#f8f0f0";
                      }

                      return (
                        <TableCell
                          sx={{
                            py: 0.5,
                            px: 1,
                            fontSize: "90%",
                            backgroundColor: bgcol
                          }}
                        >
                          <>
                            {column.type === "field" && ifield}
                            {column.type === "check" && currSel && "✔"}
                            {column.type === "data" && rec[ifield]}
                          </>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ pt: 0, pb: 0.5 }}>
          <Grid container>
            <Grid item sx={{ fontSize: "80%", mt: 0, flexGrow: 1 }}>
              {props.attach && (
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  onClick={(e) => {
                    handleSelect(props.mfield, "");
                  }}
                >
                  割付を解除
                </Button>
              )}
            </Grid>
            <Grid
              item
              sx={{ fontSize: "80%", height: "1.5em", mt: 0.5, pr: 1 }}
            >
              表示レコード:No.{sheet.recno}
            </Grid>
            <Grid item sx={{ mt: 0 }}>
              {sheet.recno === 1 && (
                <SquareIconButton
                  size="small"
                  sx={{ mt: 0 }}
                  id="move_prev"
                  disabled={true}
                >
                  <ArrowLeftIcon />
                </SquareIconButton>
              )}
              {sheet.recno > 1 && (
                <SquareIconButton
                  size="small"
                  sx={{ mt: 0 }}
                  id="move_prev"
                  variant="text"
                  color="primary"
                  onClick={(id) => {
                    let prev = sheet.recno - 1;
                    if (prev) setSheet({ ...sheet, recno: prev });
                  }}
                >
                  <ArrowLeftIcon />
                </SquareIconButton>
              )}
              {sheet.recno === sheet.reccount && (
                <SquareIconButton
                  size="small"
                  sx={{ mt: 0 }}
                  id="move_next"
                  disabled={true}
                >
                  <ArrowRightIcon />
                </SquareIconButton>
              )}
              {sheet.recno < sheet.reccount && (
                <SquareIconButton
                  size="small"
                  sx={{ mt: 0 }}
                  id="move_next"
                  variant="text"
                  color="primary"
                  onClick={(id) => {
                    let next = sheet.recno + 1;
                    if (next <= sheet.reccount)
                      setSheet({ ...sheet, recno: next });
                  }}
                >
                  <ArrowRightIcon />
                </SquareIconButton>
              )}
            </Grid>
          </Grid>
        </DialogActions>
      </Dialog>
    </>
  );
};

const ImportDialog = (props: {
  abook: ContentsPropsType;
  onClose: (added: boolean) => void;
}) => {
  const [open, setOpen] = React.useState(true);
  const [data, setData] = React.useState<{
    filename: string;
    file: any;
    filetype: string;
    status: string;
    afields: {}; // attached
    fids: string[]; // field-id of inported file
    records: {}[];
    errorText?: string;
  }>({
    filename: "",
    file: null,
    filetype: "vcf",
    status: "",
    afields: {},
    fids: [],
    records: [],
    errorText: ""
  });
  const [sheet, setSheet] = React.useState({
    recno: 1,
    reccount: 0,
    fields: {}
  });
  const [progress, setProgress] = React.useState(false);
  const [attachdlg, setAttachdlg] = React.useState<{
    mfield: string;
    attach: string;
  }>({ mfield: "", attach: "" });
  const [added, setAdded] = React.useState(false);
  const [msgbox, setMsgbox] = React.useState<MessageBoxProps>({
    open: false,
    caption: "",
    message: ""
  });

  const dialogHeight = "calc( 100vh - 25.00em )";

  // const fileOpenRef = React.useRef<HTMLDivElement>(null);
  const user = useContext(UserContext);

  const handleClose = () => {
    setOpen(false);
    props.onClose(added);
  };
  const execInport = () => {
    alert("インポート実行のてい");
    handleClose();
  };

  const cancelMsgBox = () => {
    setMsgbox({ ...msgbox, open: false });
  };

  const dispError = (caption: string, json: {}) => {
    let error: string =
      json["error"] || json["errorText"] || json["statusText"] || "load error";
    let mbinfo: MessageBoxProps = {
      open: true,
      caption: caption,
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

  if (data.file) {
    if (!data.status) {
      setData({ ...data, status: "loading" });
      handleParseABFiles(user, data.file, data.filename, (json: {}) => {
        //console.log(`json:${JSON.stringify(json)}`);
        setData({
          ...data,
          status: "loaded",
          afields: json["attach"] || {},
          fids: json["fids"] || [],
          records: json["data"] || [],
          errorText: json["error"]
        });

        if ("data" in json) {
          setSheet({ ...sheet, recno: 1, reccount: json["data"].length - 1 });
        }
      });
    }
  }

  let cxDlg = isMobile ? "calc( 100vw )" : "calc( 80vw )";

  let message = "この住所録に別の住所録形式ファイルのデータを取り込みます。";

  let controls = <></>;
  let dispdata = (
    <>
      <Box sx={{ height: dialogHeight }}></Box>
    </>
  );
  let buttons = (
    <>
      <Divider sx={{ mb: 1 }} />
      <Grid container>
        <Grid sx={{ flexGrow: 1 }}></Grid>
        <Grid>
          <Button
            variant="outlined"
            color="primary"
            sx={{ mr: 1 }}
            onClick={handleClose}
          >
            閉じる
          </Button>
        </Grid>
      </Grid>
    </>
  );
  if (data.status === "loading") {
    dispdata = (
      <Box
        sx={{
          height: dialogHeight,
          width: "100%",
          pt: 10,
          textAlign: "center"
        }}
      >
        <div className="textcenter">loading...</div>
        <CircularProgress />
      </Box>
    );
  } else if (data.status === "loaded") {
    if (data["errorText"]) {
      if (typeof data["errorText"] === "string") {
        dispdata = (
          <Box sx={{ height: dialogHeight }}>
            <Alert severity="error">
              {data["errorText"].split(/\n|<br>|<br \/>/i).map((str) => {
                return <div>{str}</div>;
              })}
            </Alert>
          </Box>
        );
      } else {
        dispdata = <>読み込みエラーが発生しました</>;
      }
      buttons = (
        <>
          <Divider sx={{ mb: 1 }} />
          <Grid container>
            <Grid sx={{ flexGrow: 1 }}></Grid>
            <Grid>
              <Button
                variant="outlined"
                color="primary"
                sx={{ mr: 1 }}
                onClick={handleClose}
              >
                閉じる
              </Button>
            </Grid>
          </Grid>
        </>
      );
    } else {
      let records = data.records;

      controls = (
        <Grid container>
          <Grid item sx={{ fontSize: "80%", mt: 2, flexGrow: 1 }}>
            レコード数:{records.length}
          </Grid>
          <Grid item sx={{ fontSize: "80%", height: "1.5em", mt: 2, pr: 1 }}>
            表示レコード:No.{sheet.recno}
          </Grid>
          <Grid item sx={{}}>
            {sheet.recno === 1 && (
              <SquareIconButton id="move_prev" disabled={true}>
                <ArrowLeftIcon />
              </SquareIconButton>
            )}
            {sheet.recno > 1 && (
              <SquareIconButton
                id="move_prev"
                variant="text"
                color="primary"
                onClick={(id) => {
                  let prev = sheet.recno - 1;
                  if (prev) setSheet({ ...sheet, recno: prev });
                }}
              >
                <ArrowLeftIcon />
              </SquareIconButton>
            )}
            {sheet.recno === sheet.reccount && (
              <SquareIconButton id="move_next" disabled={true}>
                <ArrowRightIcon />
              </SquareIconButton>
            )}
            {sheet.recno < sheet.reccount && (
              <SquareIconButton
                id="move_next"
                variant="text"
                color="primary"
                onClick={(id) => {
                  let next = sheet.recno + 1;
                  if (next <= sheet.reccount)
                    setSheet({ ...sheet, recno: next });
                }}
              >
                <ArrowRightIcon />
              </SquareIconButton>
            )}
          </Grid>
        </Grid>
      );

      let rec = records[sheet.recno] as RecordType;

      let fext = data.filename.split(".").pop()?.toLowerCase();

      // fixed format
      if (
        "afields" in data === false ||
        Object.keys(data.afields).length === 0
      ) {
        //if (fext && fext.search(/xml|vcf|jad/) !== -1) {
        const columns: { type: string; title: string; width: string }[] = [
          { type: "field", title: "住所録項目", width: "14em" },
          { type: "data", title: "データ", width: "calc( 100% - 14em )" }
        ];

        dispdata = (
          <TableContainer
            sx={{
              maxHeight: dialogHeight,
              mb: 2,
              border: "solid #e0e0e0",
              borderWidth: "0 1px 1px 0"
            }}
          >
            <Table
              stickyHeader
              sx={{ minWidth: 250 }}
              aria-labelledby="tableTitle"
            >
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f0f0f0" }}>
                  {columns.map((column, index) => (
                    <TableCell
                      sx={{
                        py: 1,
                        width: column.width,
                        backgroundColor: "#f0f0f0"
                      }}
                      key={column.type}
                      align="left"
                      padding="normal"
                    >
                      {column.title}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              {/* ------------------------- */}
              <TableBody>
                {Object.keys(mfields).map((mfield) =>
                  !mfields[mfield] ? null : (
                    <TableRow>
                      {columns.map((column, index) => {
                        let bgcol = column.type === "field" ? "#f0f0f4" : "";
                        let fs = column.type === "field" ? "90%" : "100%";
                        return (
                          <TableCell
                            sx={{ py: 1, fontSize: fs, backgroundColor: bgcol }}
                          >
                            <>
                              {column.type === "field" && mfields[mfield]}
                              {column.type === "data" && refField(rec, mfield)}
                            </>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>
        );
      }
      // asigning
      else {
        const columns: { type: string; title: string; width: string }[] = [
          { type: "field", title: "住所録項目", width: "14em" },
          { type: "target", title: "割付項目", width: "7em" },
          { type: "data", title: "データ", width: "calc( 100% - 19em )" }
        ];
        const attach = data["afields"];
        dispdata = (
          <>
            <TableContainer
              sx={{
                maxHeight: dialogHeight,
                mb: 2,
                border: "solid #e0e0e0",
                borderWidth: "0 1px 1px 0"
              }}
            >
              <Table
                stickyHeader
                sx={{ minWidth: 250 }}
                aria-labelledby="tableTitle"
              >
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f0f0f0" }}>
                    {columns.map((column, index) => (
                      <TableCell
                        sx={{
                          width: column.width,
                          py: 1,
                          backgroundColor: "#f0f0f0"
                        }}
                        key={column.type}
                        align="left"
                        padding="normal"
                      >
                        {column.title}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                {/* ------------------------- */}
                <TableBody>
                  {Object.keys(mfields).map((mfield) =>
                    !mfields[mfield] ? null : (
                      <TableRow>
                        {columns.map((column, index) => {
                          if (column.type === "target") {
                            return (
                              <TableCell
                                sx={{
                                  py: 1,
                                  fontSize: "90%",
                                  pl: 1,
                                  pr: 0.3,
                                  backgroundColor: "#f0f8f8"
                                }}
                                onClick={(e) => {
                                  //alert(`${mfields[mfield]}:${attach[mfield]}`);
                                  setAttachdlg({
                                    mfield: mfield,
                                    attach: attach[mfield]
                                  });
                                }}
                              >
                                <Grid container>
                                  <Grid item sx={{ flexGrow: 1 }}>
                                    {attach[mfield] ? (
                                      <div>{attach[mfield]}</div>
                                    ) : (
                                      <div
                                        style={{
                                          color: "silver",
                                          fontSize: "90%"
                                        }}
                                      >
                                        未割付
                                      </div>
                                    )}
                                  </Grid>
                                  <Grid item>
                                    <Tooltip title={"割付変更"}>
                                      <IconButton
                                        size="small"
                                        sx={{
                                          color: "#a0a0ff",
                                          p: 0,
                                          m: 0,
                                          width: "90%",
                                          height: "90%"
                                        }}
                                        id={`attach_${index}`}
                                        onClick={() => {}}
                                      >
                                        <ReadMoreIcon />
                                      </IconButton>
                                    </Tooltip>
                                  </Grid>
                                </Grid>
                              </TableCell>
                            );
                          } else {
                            let bgcol =
                              column.type === "field" ? "#f0f0f4" : "";
                            return (
                              <TableCell
                                sx={{
                                  maxWidth: column.width,
                                  py: 1,
                                  fontSize: "90%",
                                  backgroundColor: bgcol
                                }}
                              >
                                {column.type === "field" && mfields[mfield]}
                                {column.type === "data" && rec[attach[mfield]]}
                              </TableCell>
                            );
                          }
                        })}
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {attachdlg.mfield && (
              <Backdrop open={true}>
                <AttachFields
                  mfield={attachdlg.mfield}
                  attach={attachdlg.attach}
                  records={records}
                  recno={sheet.recno}
                  ifields={data["fids"]}
                  selected={(mfield, attach) => {
                    let attachInfo = { ...data["afields"] };
                    attachInfo[mfield] = attach;
                    setData({ ...data, afields: attachInfo });
                    setAttachdlg({ mfield: "", attach: "" });
                  }}
                />
              </Backdrop>
            )}
          </>
        );
      }
      buttons = (
        <>
          <Divider sx={{ mb: 1 }} />
          <Grid container>
            <Grid sx={{ flexGrow: 1 }}></Grid>
            <Grid>
              <Button
                variant="contained"
                color="primary"
                sx={{ mr: 1 }}
                onClick={execInport}
              >
                インポート
              </Button>
              <Button
                variant="outlined"
                color="primary"
                sx={{ mr: 1 }}
                onClick={handleClose}
              >
                閉じる
              </Button>
            </Grid>
          </Grid>
        </>
      );
    } //-----
  }

  let filename = "";
  if (data.filename) {
    filename = data.filename.split(/[/\\]/).pop() || "";
  }
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>
        インポート - {props.abook.name}
        <IconButton
          aria-label="close"
          onClick={handleClose}
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

      <DialogContent sx={{ width: cxDlg, minWidth: "20em", maxWidth: 1200 }}>
        <Box sx={{ mt: 1, color: "var(--col-explain)" }}>
          {message.split(/\n|<br>|<br \/>/i).map((str) => {
            return <p>{str}</p>;
          })}
        </Box>
        <Box>
          <FieldComboBox
            label=""
            data={data}
            id="filetype"
            editable={false}
            enableEmpty={true}
            onChange={(field: string, value: string | null) => {
              if (value) setData({ ...data, filetype: value });
            }}
            options={[
              { label: "vCard形式", value: "vcf" },
              { label: "Contact-XML 1.1形式", value: "xml" },
              { label: "JADDRESS形式", value: "jad" },
              { label: "CSV形式", value: "csv" }
            ]}
          />
        </Box>
        <FieldEditBox
          label="ファイル"
          data={data}
          id="filename"
          type="file"
          // ref={fileOpenRef}
          inputProps={{ accept: `.${data.filetype}` }}
          onChange={(field, value, event) => {
            if (!value || value.length === 0) return;
            let file = event.target.files[0];
            let filename = "";
            if (Array.isArray(value)) {
              filename = value[0];
            } else filename = value || "";

            setData({
              ...data,
              filename: filename,
              file: file,
              status: "",
              afields: {},
              fids: [],
              records: [],
              errorText: ""
            });
          }}
        />
        {/* <Divider /> */}
        <Box sx={{ mt: 1, minHeight: "5em" }}>
          {controls}
          {dispdata}
          {buttons}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ImportDialog;

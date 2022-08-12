//import React, { useContext, useEffect, useMemo } from "react";
import * as React from "react";
import { useContext, ReactNode, Children } from "react";
import { UserContext, UserContextType } from "../Account";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import AddLocationAltOutlinedIcon from "@mui/icons-material/AddLocationAltOutlined";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import ja from "date-fns/locale/ja";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import { useTheme } from "@mui/material/styles";

import {
  AppVal,
  ajaxGet,
  ajaxPost,
  ContentsPropsType,
  isHomeAddress
} from "../AppSettings";
import CircularProgress from "@mui/material/CircularProgress";
import { SvgIcon } from "@mui/material";
import DefPersonImg from "../assets/images/person.png";
import { isMobile } from "react-device-detect";
import { BrowserView, MobileView } from "react-device-detect";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import type {} from "@mui/x-date-pickers/themeAugmentation";

export type AddrBlock = {
  kindof: "home" | "office" | null;
  zipcode: string;
  region: string;
  city: string;
  street: string;
  building: string;
  station: string;
  label?: string;
  geolocation: object;
};
export type TelephoneBlock = {
  kindof: "tel" | "fax" | "cell" | "offtel" | "offfax" | "offcell" | null;
  number: string;
  label?: string;
};
export type EmailBlock = {
  kindof: "cell" | "home" | "office";
  address: string;
  label?: string;
};
export type OrganizationBlock = {
  name: string;
  title?: string;
  dept1?: string;
  dept2?: string;
  kana?: string;
};
export type WebUrlBlock = {
  kindof: "profile" | "blog" | "hp" | "office" | null;
  label?: string;
  url: string;
};
export type ExternalIDBlock = {
  id: string;
  client_id: string;
};
export type FamilyBlock = {
  lastname: string;
  firstname: string;
  lastkana: string;
  firstkana: string;
  suffix?: string;
  gender?: string;
  birthdate?: string;
};
export type ExtendPropsBlock = {
  client_id: string;
  data: {};
};

export type PictureBlock = {
  image: string; // 変なID　like 62d7aaeb4e79f804b678aff6
  exif: {
    taken: object | null;
  };
  thum_size: number[];
  image_size: number[];
};

export type RecordType = {
  id: string;
  code?: string;
  external_ids?: ExternalIDBlock[];
  pictures?: PictureBlock[];
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
  etag?: string;
  face_picture?: PictureBlock;
  owner_id?: string;
  tags?: string[];
  deleted?: boolean;

  firstname?: string;
  lastname?: string;
  firstkana?: string;
  lastkana?: string;
  suffix?: string;
  gender?: string;
  birthdate?: string;

  joint_names?: FamilyBlock[];
  organization?: OrganizationBlock;
  addresses?: AddrBlock[];
  emails?: EmailBlock[];
  telephones?: TelephoneBlock[];
  weburls?: WebUrlBlock[];
  memo?: string;

  extendprops?: ExtendPropsBlock[];
};

type ABRecDialogPropsType = {
  user: UserContextType;
  abook: ContentsPropsType;
  onEdit: (abookId: string, rec: RecordType) => void;
};

type ABRecDialogStateType = {
  open: boolean;
  recid: string;
  name: string;
  status: "loading" | "success" | "error";
  statusText: string;
  data: RecordType;
};
type ABRecEditStateType = {
  abid: string;
  recid: string;
  name: string;
  status?: "loading" | "success" | "error";
  statusText?: string;
  data?: RecordType;
};

export const ReformName = (rec: RecordType) => {
  let firstname = rec.firstname;
  let lastname = rec.lastname;

  if (lastname && firstname) {
    if (firstname.match(/[^a-zA-Z\-=:]/) || lastname.match(/[^a-zA-Z\-=:]/)) {
      firstname = rec.lastname;
      lastname = rec.firstname;
    }
  }

  let name = firstname || "";
  if (lastname) {
    if (name) name += " ";
    name += lastname;
  }
  return name;
};
export const ReformNameYomi = (rec: RecordType) => {
  let firstname = rec.firstname;
  let lastname = rec.lastname;
  let firstnameYomi = rec.firstkana;
  let lastnameYomi = rec.lastkana;

  if (lastname && firstname) {
    if (firstname.match(/[^a-zA-Z\-=:]/) || lastname.match(/[^a-zA-Z\-=:]/)) {
      firstnameYomi = rec.lastkana;
      lastnameYomi = rec.firstkana;
    }
  }

  let name = firstnameYomi || "";
  if (lastnameYomi) {
    if (name) name += " ";
    name += lastnameYomi;
  }
  return name;
};

type RecDataProps = {
  title: string;
  data: string;
  icon?: typeof SvgIcon | null;
  link?: string;
  command: string;
};

type createDataType = (
  title: string,
  data: string,
  icon?: typeof SvgIcon | null,
  link?: string,
  command?: string
) => RecDataProps;

const createData: createDataType = (
  title,
  data,
  icon = null,
  link = "",
  command = ""
) => {
  return { title, data, icon, link, command };
};

function PersonalPicture(props: {
  abId: string;
  rec: RecordType;
  cx: number;
  cy: number;
}) {
  const user = useContext(UserContext);

  const [imgurl, setImgurl] = React.useState("");
  let url = "";
  if (!imgurl && props.rec.face_picture && props.rec.face_picture.image) {
    url = `${user.getEpm()}/p/get_address_face/`; //get_address_pict
    if (isHomeAddress(props.abId)) {
      url += `homeaddress/${props.rec.id}`;
    } else {
      url += `${props.rec.id}/${props.rec.face_picture.image}.jpg?t=T`;
    }

    // setTimeout(() => {
    //   setImgurl(url);
    // }, 500);
  }
  //   let params = {
  //     t: "T",
  //     atk: user.getAToken(),
  //     ept: user.getEpm(),
  //     uag: user.getUag()
  //   };
  //   console.log(`ImageUrl-url:${url}`);
  //   ajaxGet(url, params, (json) => {
  //     setImgurl(JSON.stringify(json));
  //   });
  // }

  let cont = (
    <img
      src={DefPersonImg}
      style={{ width: props.cx, height: props.cy }}
      alt=""
    />
  );
  if (url) {
    cont = <img src={url} style={{ width: props.cx }} alt="" />;
  }

  return cont;
}

//
// 1レコードの詳細データの出力
//
const OutRecord = (rec: RecordType) => {
  const rows = [];

  if (rec.tags && rec.tags.length) {
    rows.push(createData("タグ", rec.tags.join(" ")));
  }

  const furigana = ReformNameYomi(rec);
  if (furigana) rows.push(createData("フリガナ", furigana));

  if (rec.organization) {
    if (rec.organization.name)
      rows.push(createData("勤務先", rec.organization.name));
    if (rec.organization.kana)
      rows.push(createData("勤務先（カナ）", rec.organization.kana));
    if (rec.organization.dept1)
      rows.push(createData("部署", rec.organization.dept1));
    if (rec.organization.dept2)
      rows.push(createData("部署2", rec.organization.dept2));
    if (rec.organization.title)
      rows.push(createData("役職", rec.organization.title));
  }
  if (rec.addresses && rec.addresses.length) {
    rec.addresses.map((address) => {
      let title = "住所";
      if (address.kindof === "home") {
        //"home" | "office"
        title += "[自宅]";
      } else if (address.kindof === "office") {
        //"home" | "office"
        title += "[勤務先]";
      } else {
        if (address.label) title += `[${address.label}]`;
        else title += "[その他]";
      }

      let addressData = "";
      let icon: typeof SvgIcon | null = null;
      let link = "";
      let command = "";
      if (address.zipcode && address.zipcode.length)
        addressData += `〒${address.zipcode}\n`;
      let addr = `${address.region ? address.region : ""}${
        address.city ? address.city : ""
      }${address.street ? address.street : ""}`;
      if (address.building) {
        if (addr) addr += "<br>";
        addr += address.building;
      }
      if (addr) addressData += addr;
      if (addressData) {
        link = addressData.replace(/\n/, "+").replace(/<br>/g, " ");
        link = `https://www.google.co.jp/maps/place/${encodeURIComponent(
          link
        )}`;
        icon = AddLocationAltOutlinedIcon;
      }

      rows.push(createData(title, addressData, icon, link, command));
      return "";
    });
    // 電話番号
    if (rec.telephones && rec.telephones.length) {
      let telData = {};
      let order: string[] = [];
      rec.telephones.map((tel) => {
        // 自宅TEL:tel/自宅FAX:fax/個人携帯:cell/会社TEL:offtel/会社FAX:offfax/会社携帯:offcell/その他:null
        let title =
          tel.kindof === "tel"
            ? "電話[自宅TEL]"
            : tel.kindof === "fax"
            ? "電話[自宅FAX]"
            : tel.kindof === "cell"
            ? "電話[個人携帯]"
            : tel.kindof === "offtel"
            ? "電話[会社TEL]"
            : tel.kindof === "offfax"
            ? "電話[会社FAX]"
            : tel.kindof === "offcell"
            ? "電話[会社携帯]"
            : tel.label
            ? `電話[${tel.label}]`
            : "電話[その他]";
        if (telData[title]) {
          telData[title].push(tel.number);
        } else {
          order.push(title);
          telData[title] = [tel.number];
        }

        return "";
      });

      order.map((title) => {
        let numbers = telData[title].join("\n");
        rows.push(createData(title, numbers));
        return "";
      });
    }

    // e-mail
    if (rec.emails && rec.emails.length) {
      let emailData = {};
      let order: string[] = [];
      rec.emails.map((email) => {
        // 携帯:cell/自宅:home/会社:office
        let title =
          email.kindof === "home"
            ? "Eメール[自宅]"
            : email.kindof === "cell"
            ? "Eメール[携帯]"
            : email.kindof === "office"
            ? "Eメール[会社]"
            : email.label
            ? `Eメール[${email.label}]`
            : "Eメール[その他]";
        if (emailData[title]) {
          emailData[title].push(email.address);
        } else {
          order.push(title);
          emailData[title] = [email.address];
        }

        return "";
      });

      order.map((title) => {
        let emails = emailData[title].join("\n");
        rows.push(createData(title, emails));
        return "";
      });
    }
    // 写真

    // 最終更新
  }

  return rows;
};

const loadRecord = (
  user: UserContextType,
  abId: string,
  recId: string,
  onLoad: (json: {}) => void
) => {
  let url = `${user.getEpt()}/`;
  if (isHomeAddress(abId)) {
    url += `homeaddress/${recId}`;
  } else {
    url += `address/${recId}`;
  }
  let params = {
    atk: user.getAToken(),
    ept: user.getEpm(),
    uag: user.getUag()
  };

  ajaxGet(url, params, (json) => {
    if ("data" in json) {
      onLoad(json);
    } else {
      if ("statusCode" in json && parseInt(json["statusCode"], 10) === 401) {
        user.RefreshAndRetry(url, "GET", params, onLoad);
      } else {
        onLoad(json);
      }
    }
  });
};

//
// １レコードの詳細を表示するダイアログ
//　編集はまた別の　ページorダイアログ
export default class ABRecDialog extends React.Component<
  ABRecDialogPropsType,
  ABRecDialogStateType
> {
  constructor(props: ABRecDialogPropsType) {
    super(props);
    //    this.user = useContext(UserContext);
    this.state = {
      open: false,
      recid: "",
      name: "",
      status: "loading",
      statusText: "",
      data: { id: "" }
    };
  }

  handleClose = () => {
    this.setState({ ...this.state, status: "loading", open: false });
  };

  handleEdit = () => {
    this.handleClose();
    console.log(`Edit:${JSON.stringify(this.state.data)}`);
    this.props.onEdit(this.props.abook.id, this.state.data);
  };

  render() {
    if (this.state.open === true && this.state.status === "loading") {
      if (this.state.data.id === this.state.recid) {
        if (this.state.recid) {
          this.setState({
            ...this.state,
            status: "success",
            statusText: "ok"
          });
        }
      } else {
        loadRecord(
          this.props.user,
          this.props.abook.id,
          this.state.recid,
          (json) => {
            if ("data" in json) {
              this.setState({
                ...this.state,
                data: json["data"],
                status: "success",
                statusText: "ok"
              });
            } else {
              let error: string =
                json["error"] ||
                json["statusMessage"] ||
                "ロードに失敗しました";
              this.setState({
                ...this.state,
                status: "error",
                statusText: error
              });
            }
          }
        );
      }
    }

    let name = this.state.name;
    let cont = <></>;
    if (this.state.status === "loading") {
      if (this.state.open) {
        cont = (
          <Box
            sx={{ width: "40em", maxWidth: "80%", mt: 10, textAlign: "center" }}
          >
            <div className="textcenter">loading...</div>
            <CircularProgress />
          </Box>
        );
      }
    } else if (this.state.status === "success") {
      const rec: RecordType = this.state.data;
      name = ReformName(rec);

      const rows = OutRecord(rec);

      //createData("name", name), createData("dessert", "Cupcake")];

      cont = (
        <div>
          <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={2}>
            <Box gridColumn="span 2">
              <PersonalPicture
                abId={this.props.abook.id}
                rec={rec}
                cx={64}
                cy={64}
              />
            </Box>
            <Box gridColumn="span 10">
              <Table aria-label="simple table">
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.title} sx={{ height: "1.2em" }}>
                      <TableCell
                        align="left"
                        sx={{ py: 1, width: "10em", height: "1.2em" }}
                      >
                        {row.title}
                      </TableCell>
                      <TableCell
                        size="medium"
                        align="left"
                        sx={{ py: 1, height: "1.2em" }}
                      >
                        {row.data.split(/\n|<br>|<br \/>/i).map((str) => {
                          return <div>{str}</div>;
                        })}
                      </TableCell>
                      <TableCell
                        size="medium"
                        align="left"
                        sx={{ py: 1, width: "2em" }}
                      >
                        {row.icon && row.link && (
                          <a href={row.link} target="cabhref">
                            <row.icon />
                          </a>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Box>
        </div>
      );
    } else if (this.state.status === "error") {
      cont = (
        <div style={{ width: "calc( 80vw )" }}>
          <h3>failed</h3>
          <p>{this.state.statusText}</p>
        </div>
      );
    }

    type DlgButtonProps = {
      caption: string;
      color:
        | "inherit"
        | "primary"
        | "secondary"
        | "success"
        | "error"
        | "info"
        | "warning";
      onclick: () => void;
    };

    type MakeButtonType = (
      caption: string,
      color:
        | "inherit"
        | "primary"
        | "secondary"
        | "success"
        | "error"
        | "info"
        | "warning",
      onclick: () => void
    ) => DlgButtonProps;

    const makeButton: MakeButtonType = (caption, color, onclick) => {
      return { caption: caption, color: color, onclick: onclick };
    };

    const buttons: DlgButtonProps[] = [];
    if (this.state.status === "success") {
      buttons.push(makeButton("削除", "warning", this.handleClose));
      buttons.push(makeButton("他のユーザに送信", "primary", this.handleClose));
      buttons.push(makeButton("コピー", "primary", this.handleClose));
      buttons.push(makeButton("編集", "success", this.handleEdit));
    }
    buttons.push(makeButton("閉じる", "primary", this.handleClose));

    let cxDlg = isMobile ? "100%" : "70%";
    return (
      <Dialog open={this.state.open} onClose={this.handleClose}>
        <DialogTitle sx={{ width: { cxDlg }, maxWidth: 600 }}>
          {name}
          <IconButton
            aria-label="close"
            onClick={this.handleClose}
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
        <DialogContent>{cont}</DialogContent>
        <DialogActions>
          {buttons.map((button) => {
            return (
              <Button
                color={button.color}
                variant="contained"
                onClick={button.onclick}
              >
                {button.caption}
              </Button>
            );
          })}
        </DialogActions>
      </Dialog>
    );
  }
}

const FieldTitle = (props: { title: string }) => {
  return (
    <h5 style={{ marginBottom: "2ex", marginTop: "2ex" }}>{props.title}</h5>
  );
};

type FieldEditProps = {
  label: string;
  field: string;
  rec: RecordType;
  options?: string[];
  onChangeField: (field: string, value: string) => void;
};

const FieldEditBox = (props: FieldEditProps) => {
  return (
    <Paper sx={{ width: "100%", mt: 1, mb: 0 }}>
      <TextField
        variant="outlined"
        sx={{ width: "100%", mt: -0.24 }}
        size="small"
        placeholder={props.label}
        value={props.rec[props.field]}
        onChange={(e) => props.onChangeField(props.field, e.target.value)}
      />
    </Paper>
  );
};

const FieldTextArea = (props: FieldEditProps) => {
  return (
    <Paper sx={{ width: "100%", mt: 1, mb: 0 }}>
      <TextField
        variant="outlined"
        sx={{ width: "100%", mt: -0.24 }}
        multiline
        rows={3}
        placeholder={props.label}
        value={props.rec[props.field]}
        onChange={(e) => props.onChangeField(props.field, e.target.value)}
      />
    </Paper>
  );
};

const FieldComboBox = (props: FieldEditProps) => {
  return (
    <Paper sx={{ width: "100%", mt: 1, mb: 0 }}>
      <Select
        variant="outlined"
        sx={{ width: "100%", mt: -0.24 }}
        size="small"
        value={props.rec[props.field]}
        onChange={(e) => props.onChangeField(props.field, e.target.value)}
        displayEmpty
        inputProps={{ "aria-label": "Without label" }}
      >
        <MenuItem value="">&nbsp;</MenuItem>
        {props.options &&
          props.options.map((option) => (
            <MenuItem value={option}>{option}</MenuItem>
          ))}
      </Select>
    </Paper>
  );
};
// sx={{ width: "100%", mt: 1, mb: 0, backgroundColor: "white" }}
// size="small"

const FieldDatePicker = (props: FieldEditProps) => {
  const baseTheme = useTheme();
  const theme = createTheme(
    { ...baseTheme },
    {
      components: {
        MuiDatePicker: {
          styleOverrides: {
            root: {
              backgroundColor: "red"
            }
          }
        }
      }
    }
  );

  const FullWidth = {
    display: "flex",
    "flex-direction": "column",
    width: "100%"
  };
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
      <Paper>
        <div style={FullWidth}>
          <ThemeProvider theme={theme}>
            <MobileDatePicker
              className="datepicker"
              leftArrowButtonText="前月"
              rightArrowButtonText="翌月"
              label={props.label}
              inputFormat="yyyy年MM月dd日"
              mask="____年__月__日"
              toolbarFormat="yyyy年MM月"
              value={props.rec[props.field]}
              onChange={(newValue: Date | null) =>
                props.onChangeField(props.field, `${newValue || ""}`)
              }
              renderInput={(params) => <TextField {...params} />}
            />
          </ThemeProvider>
        </div>
      </Paper>
    </LocalizationProvider>
  );
};

type EditBlockProp = {
  abid: string;
  rec: RecordType;
  onChangeField: (field: string, value: string) => void;
};

const PictWidth = 128;
const PictMargin = 4;
const PictAreaWidth = PictWidth + PictMargin;

const EditBlockName = (props: EditBlockProp) => {
  const [detail, setDetail] = React.useState<boolean>(false);

  return (
    <Grid container>
      <Grid item sx={{ width: `calc( 100% - ${PictAreaWidth}px )` }}>
        <Paper
          component="form"
          sx={{
            backgroundColor: "#f0f0f0"
          }}
        >
          <Grid container={true} columns={15}>
            {/* ------ 氏名の行 ------ */}
            <Grid item={true} xs={3} sx={{ pl: 2 }}>
              <FieldTitle title="氏名" />
            </Grid>
            <Grid item={true} xs={4} sx={{ px: 1 }}>
              <FieldEditBox
                rec={props.rec}
                label="姓"
                field="lastname"
                onChangeField={props.onChangeField}
              />
            </Grid>
            <Grid item={true} xs={4} sx={{ px: 1 }}>
              <FieldEditBox
                rec={props.rec}
                label="名"
                field="firstname"
                onChangeField={props.onChangeField}
              />
            </Grid>
            <Grid item={true} xs={4} sx={{ px: 1 }}>
              <FieldComboBox
                rec={props.rec}
                label="敬称"
                field="suffix"
                options={[
                  "様",
                  "殿",
                  "御中",
                  "行",
                  "宛",
                  "先生",
                  "君",
                  "くん",
                  "さん",
                  "ちゃん"
                ]}
                onChangeField={props.onChangeField}
              />
            </Grid>
            {/* ------ フリガナの行 ------ */}
            <Grid item={true} xs={3} sx={{ pl: 2 }}>
              <FieldTitle title="フリガナ" />
            </Grid>
            <Grid item={true} xs={4} sx={{ px: 1 }}>
              <FieldEditBox
                rec={props.rec}
                label="姓フリガナ"
                field="lastkana"
                onChangeField={props.onChangeField}
              />
            </Grid>
            <Grid item={true} xs={4} sx={{ px: 1 }}>
              <FieldEditBox
                rec={props.rec}
                label="名フリガナ"
                field="firstkana"
                onChangeField={props.onChangeField}
              />
            </Grid>
            <Grid item={true} xs={4} sx={{ px: 1 }}></Grid>

            <Grid item={true} xs={15} sx={{ px: 1 }}>
              <Divider />
            </Grid>

            {/* ------ タグの行 ------ */}
            <Grid item={true} xs={3} sx={{ pl: 2 }}>
              <FieldTitle title="タグ" />
            </Grid>
            <Grid item={true} xs={10} sx={{ px: 1 }}>
              <FieldEditBox
                rec={props.rec}
                label="タグ"
                field="tags"
                onChangeField={props.onChangeField}
              />
            </Grid>
            <Grid item={true} xs={2} sx={{ px: 1, mt: 1 }}>
              <Button
                onClick={() => {
                  setDetail(!detail);
                }}
              >
                {!detail ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
              </Button>
            </Grid>

            {/* ------ 詳細の始まり ------ */}
            {detail && (
              <>
                {/* ------ 誕生日＆性別　の行 ------ */}
                <Grid item={true} xs={3} sx={{ pl: 2 }}>
                  <FieldTitle title="誕生日" />
                </Grid>
                <Grid item={true} xs={5} sx={{ px: 1 }}>
                  <FieldDatePicker
                    rec={props.rec}
                    label="誕生日"
                    field="birthdate"
                    onChangeField={props.onChangeField}
                  />
                </Grid>
                <Grid item={true} xs={2} sx={{ pl: 2 }}>
                  <FieldTitle title="性別" />
                </Grid>
                <Grid item={true} xs={4} sx={{ px: 1 }}>
                  <FieldComboBox
                    rec={props.rec}
                    label="性別"
                    field="gender"
                    options={["男性", "女性", "その他"]}
                    onChangeField={props.onChangeField}
                  />
                </Grid>

                {/* ------ 顧客コードの行 ------ */}
                <Grid item={true} xs={3} sx={{ pl: 2 }}>
                  <FieldTitle title="顧客コード" />
                </Grid>
                <Grid item={true} xs={5} sx={{ px: 1 }}>
                  <FieldEditBox
                    rec={props.rec}
                    label="顧客コード"
                    field="code"
                    onChangeField={props.onChangeField}
                  />
                </Grid>
                <Grid item={true} xs={7} sx={{ px: 1 }}></Grid>

                {/* ------ メモの行 ------ */}
                <Grid item={true} xs={3} sx={{ pl: 2 }}>
                  <FieldTitle title="メモ" />
                </Grid>
                {/* FieldTextArea */}
                <Grid item={true} xs={8} sx={{ px: 1 }}>
                  <FieldTextArea
                    rec={props.rec}
                    label="メモ"
                    field="memo"
                    onChangeField={props.onChangeField}
                  />
                </Grid>
                <Grid item={true} xs={5} sx={{ px: 1 }}></Grid>
                <Grid item={true} xs={15} sx={{ px: 1 }}>
                  &nbsp;
                </Grid>
              </>
            )}
          </Grid>
        </Paper>
      </Grid>
      <Grid item sx={{ width: PictAreaWidth }}>
        <Box gridColumn="span 2">
          <PersonalPicture
            abId={props.abid}
            rec={props.rec}
            cx={PictWidth}
            cy={PictWidth}
          />
        </Box>
      </Grid>
    </Grid>
  );
};

const ABEditRecord = (props: { rec: ABRecEditStateType }) => {
  const user = useContext(UserContext);

  const [state, setState] = React.useState<ABRecEditStateType>({
    abid: props.rec.abid,
    recid: props.rec.recid,
    name: props.rec.name,
    status: "loading",
    statusText: "",
    data: props.rec.data
  });

  if (state.status === "loading") {
    if (props.rec.recid === "new") {
      setState({ ...state, status: "success" });
    } else if (state.data && state.data.code) {
      setState({ ...state, status: "success" });
    } else {
      loadRecord(user, props.rec.abid, props.rec.recid, (json) => {
        if ("data" in json) {
          setState({ ...state, status: "success", data: json["data"] });
        } else {
          let error = json["error"] || json["statusText"] || "load error";
          setState({ ...state, status: "error", statusText: error });
        }
      });
    }
  }

  const editCallback = (field: string, value: string) => {
    let newval: RecordType = {
      ...state.data,
      id: state.data ? state.data.id : ""
    };
    newval[field] = value;
    setState({ ...state, data: newval });
    console.log(`${field}=${value}`);
  };

  let cont = <></>;
  if (state.status === "loading") {
    cont = (
      <Box sx={{ width: "calc( 80vw )", mt: 10, textAlign: "center" }}>
        <div className="textcenter">loading...</div>
        <CircularProgress />
      </Box>
    );
  } else if (state.status === "success") {
    const rec: RecordType = state.data ? state.data : { id: "" };

    const rows = OutRecord(rec);

    //createData("name", name), createData("dessert", "Cupcake")];
    cont = (
      <div className="editConts">
        <EditBlockName
          abid={state.abid}
          rec={rec}
          onChangeField={editCallback}
        />

        <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={2}>
          <Box gridColumn="span 10">
            <Table aria-label="simple table">
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.title} sx={{ height: "1.2em" }}>
                    <TableCell
                      align="left"
                      sx={{ py: 1, width: "10em", height: "1.2em" }}
                    >
                      {row.title}
                    </TableCell>
                    <TableCell
                      size="medium"
                      align="left"
                      sx={{ py: 1, height: "1.2em" }}
                    >
                      {row.data.split(/\n|<br>|<br \/>/i).map((str) => {
                        return <div>{str}</div>;
                      })}
                    </TableCell>
                    <TableCell
                      size="medium"
                      align="left"
                      sx={{ py: 1, width: "2em" }}
                    >
                      {row.icon && row.link && (
                        <a href={row.link} target="cabhref">
                          <row.icon />
                        </a>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Box>
      </div>
    );
  } else if (state.status === "error") {
    cont = (
      <div style={{ width: "calc( 80vw )" }}>
        <h3>failed</h3>
        <p>{state.statusText}</p>
      </div>
    );
  }
  return <>{cont}</>;
};

export {
  ABRecDialogPropsType,
  ABRecDialogStateType,
  ABRecEditStateType,
  ABEditRecord
};

//import React, { useContext, useEffect, useMemo } from "react";
import * as React from "react";
import { useContext, useRef, ReactNode, Children } from "react";
import { UserContext, UserContextType } from "../Account";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import ButtonBase from "@mui/material/ButtonBase";
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
import {
  EditFieldTitle,
  SquareIconButton,
  FieldEditBox,
  FieldTextArea,
  FieldComboBox,
  FieldDatePicker,
  ReformField
} from "../components/EditParts";

import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import Fab from "@mui/material/Fab";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";

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

import MessageBox, { MessageBoxProps } from "../components/MessageBox";

export type AddrBlock = {
  kindof?: "home" | "office" | null;
  zipcode?: string;
  region?: string;
  city?: string;
  street?: string;
  building?: string;
  station?: string;
  label?: string;
  geolocation?: object;
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
  birthdate?: string | null;
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
  recid: string;
  name: string;
  user: UserContextType;
  abook: ContentsPropsType;
  onEdit: (abookId: string, rec: RecordType) => void;
  onDelete: (abookId: string, rec: RecordType) => void;
  onCopy: (abookId: string, rec: RecordType) => void;
  onSend: (abookId: string, rec: RecordType) => void;
  onClose: () => void;
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
  }

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

    // webUrl
    if (rec.weburls && rec.weburls.length) {
      let urlData = {};
      let order: string[] = [];
      rec.weburls.map((web) => {
        // URL - 種別(プロフィール:profile/ブログ:blog/ホームページ:hp/会社:office/その他:null)
        let title =
          web.kindof === "profile"
            ? "プロフィール"
            : web.kindof === "blog"
            ? "ブログ"
            : web.kindof === "hp"
            ? "ホームページ"
            : web.kindof === "office"
            ? "会社"
            : web.label
            ? `Eメール[${web.label}]`
            : "Eメール[その他]";
        if (urlData[title]) {
          urlData[title].push(web.url);
        } else {
          order.push(title);
          urlData[title] = [web.url];
        }

        return "";
      });

      order.map((title) => {
        let weburls = urlData[title].join("\n");
        rows.push(createData(title, weburls));
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

type statusType = {
  status: "loading" | "success" | "error";
  text: string;
};

//
// １レコードの詳細を表示するダイアログ
//　編集はまた別の　ページorダイアログ
const ABRecDialog = (props: ABRecDialogPropsType) => {
  const [open, setOpen] = React.useState(true);
  const [status, setStatus] = React.useState<statusType>({
    status: "loading",
    text: ""
  });
  const [recdata, setRecData] = React.useState({ id: "" });
  const [msgbox, setMsgbox] = React.useState<MessageBoxProps>({
    open: false,
    caption: "",
    message: ""
  });

  const user = useContext(UserContext);

  const handleClose = () => {
    setOpen(false);
    props.onClose();
  };

  const handleEdit = () => {
    handleClose();
    console.log(`Edit:${JSON.stringify(recdata)}`);
    props.onEdit(props.abook.id, recdata);
  };

  const execDelete = () => {
    setOpen(false);
    console.log(`Delete:${JSON.stringify(recdata)}`);
    props.onDelete(props.abook.id, recdata);
    //this.props.onDelete(this.props.abook.id, this.state.data);
  };

  const cancelMsgBox = () => {
    setMsgbox({ ...msgbox, open: false });
  };

  const handleDelete = () => {
    const name = ReformName(recdata);
    let mbdata: MessageBoxProps = {
      open: true,
      caption: "確認",
      message: `${name}さんのレコードを削除します`,
      icon: "question",
      options: [
        {
          text: "確認",
          handler: () => {
            cancelMsgBox();
            execDelete();
          }
        }
      ],
      onCancel: () => {
        cancelMsgBox();
      }
    };
    setMsgbox(mbdata);
  };

  if (open === true && status.status === "loading") {
    if (recdata.id === props.recid) {
      if (recdata.id) {
        setStatus({ status: "success", text: "ok" });
      }
    } else {
      loadRecord(user, props.abook.id, props.recid, (json) => {
        if ("data" in json) {
          setRecData(json["data"]);
          setStatus({ status: "success", text: "ok" });
        } else {
          let error: string =
            json["error"] || json["statusMessage"] || "ロードに失敗しました";
          setStatus({ status: "error", text: error });
        }
      });
    }
  }

  let name = props.name;
  let cont = <></>;
  if (status.status === "loading") {
    if (open) {
      cont = (
        <Box
          sx={{ width: "40em", maxWidth: "80%", mt: 10, textAlign: "center" }}
        >
          <div className="textcenter">loading...</div>
          <CircularProgress />
        </Box>
      );
    }
  } else if (status.status === "success") {
    const rec: RecordType = recdata;
    name = ReformName(rec);

    const rows = OutRecord(rec);

    //createData("name", name), createData("dessert", "Cupcake")];

    cont = (
      <div>
        <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={2}>
          <Box gridColumn="span 2">
            <PersonalPicture abId={props.abook.id} rec={rec} cx={64} cy={64} />
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
  } else if (status.status === "error") {
    cont = (
      <div style={{ width: "calc( 80vw )" }}>
        <h3>failed</h3>
        <p>{status.text}</p>
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
  if (status.status === "success") {
    buttons.push(makeButton("削除", "warning", handleDelete));
    buttons.push(makeButton("他のユーザに送信", "primary", handleClose));
    buttons.push(makeButton("コピー", "primary", handleClose));
    buttons.push(makeButton("編集", "success", handleEdit));
  }
  buttons.push(makeButton("閉じる", "primary", handleClose));

  let cxDlg = isMobile ? "100%" : "70%";

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle sx={{ width: { cxDlg }, maxWidth: 600 }}>
        {name}
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
      <MessageBox {...msgbox} />
    </Dialog>
  );
};

type EditBlockProp = {
  abid: string;
  rec: RecordType;
  onChangeField: (field: string, value: string) => void;
  onChangeData?: (rec: {}) => void;
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
              <EditFieldTitle title="氏名" />
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
                editable={true}
                options={[
                  { data: "様" },
                  { data: "殿" },
                  { data: "御中" },
                  { data: "行" },
                  { data: "宛" },
                  { data: "先生" },
                  { data: "君" },
                  { data: "くん" },
                  { data: "さん" },
                  { data: "ちゃん" }
                ]}
                onChangeField={props.onChangeField}
              />
            </Grid>
            {/* ------ フリガナの行 ------ */}
            <Grid item={true} xs={3} sx={{ pl: 2 }}>
              <EditFieldTitle title="フリガナ" />
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
              <EditFieldTitle title="タグ" />
            </Grid>
            <Grid item={true} xs={10} sx={{ px: 1 }}>
              <FieldEditBox
                rec={props.rec}
                label="タグ"
                field="tags"
                onChangeField={props.onChangeField}
              />
            </Grid>
            <Grid item={true} xs={2} sx={{ px: 2, mt: 0 }}>
              <SquareIconButton
                id=""
                variant="contained"
                bgcolor="gray"
                onClick={(id) => {
                  setDetail(!detail);
                }}
              >
                {!detail ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
              </SquareIconButton>
            </Grid>

            {/* ------ 詳細の始まり ------ */}
            {detail && (
              <>
                {/* ------ 誕生日＆性別　の行 ------ */}
                <Grid item={true} xs={3} sx={{ pl: 2 }}>
                  <EditFieldTitle title="誕生日" />
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
                  <EditFieldTitle title="性別" />
                </Grid>
                <Grid item={true} xs={4} sx={{ px: 1 }}>
                  <FieldComboBox
                    rec={props.rec}
                    label="性別"
                    field="gender"
                    editable={false}
                    options={[
                      { data: "男性" },
                      { data: "女性" },
                      { data: "その他" }
                    ]}
                    onChangeField={props.onChangeField}
                  />
                </Grid>

                {/* ------ 顧客コードの行 ------ */}
                <Grid item={true} xs={3} sx={{ pl: 2 }}>
                  <EditFieldTitle title="顧客コード" />
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
                  <EditFieldTitle title="メモ" />
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

type BlockTitleProps = {
  title: string;
};

const BlockTitle = (props: BlockTitleProps) => {
  return (
    <p
      style={{
        margin: "6pt 0 0 2pt",
        fontSize: "150%",
        color: "gray",
        backgroundColor: "white"
      }}
    >
      {props.title}
    </p>
  );
};

// ----------------------------------------------------------------
// 勤務先ブロック

const EditBlockOrg = (props: EditBlockProp) => {
  const [open, setOpen] = React.useState<boolean>(true);

  const bgc = open ? "var(--col-offical)" : "gray";
  return (
    <>
      <BlockTitle title="勤務先" />

      <Grid container>
        <Grid item sx={{ width: `${PictWidth}px` }}>
          <Fab
            size="small"
            aria-label="add"
            sx={{ ml: 9, color: "white", backgroundColor: `${bgc}` }}
            onClick={() => {
              setOpen(!open);
            }}
          >
            {open ? <RemoveIcon /> : <KeyboardArrowDownIcon />}
          </Fab>
        </Grid>

        {open && (
          <Grid item sx={{ width: `calc( 100% - ${PictAreaWidth}px )` }}>
            <Paper
              component="form"
              sx={{
                backgroundColor: "#f0f0f0"
              }}
            >
              <Grid container={true} columns={15}>
                <Grid item xs={3} sx={{ pl: 2 }}>
                  <EditFieldTitle title="勤務先名" />
                </Grid>
                <Grid item xs={10}>
                  <FieldEditBox
                    rec={props.rec}
                    label="勤務先"
                    field="organization.name"
                    onChangeField={props.onChangeField}
                  />
                </Grid>
                <Grid item xs={2}></Grid>

                <Grid item xs={3} sx={{ pl: 2 }}>
                  <EditFieldTitle title="フリガナ" />
                </Grid>
                <Grid item xs={10}>
                  <FieldEditBox
                    rec={props.rec}
                    label="フリガナ"
                    field="organization.kana"
                    onChangeField={props.onChangeField}
                  />
                </Grid>
                <Grid item xs={2}></Grid>

                <Grid item xs={15}>
                  <Divider />
                </Grid>

                <Grid item xs={3} sx={{ pl: 2 }}>
                  <EditFieldTitle title="部署名" />
                </Grid>
                <Grid item xs={5} sx={{ pr: 0.5 }}>
                  <FieldEditBox
                    rec={props.rec}
                    label="部署名1"
                    field="organization.dept1"
                    onChangeField={props.onChangeField}
                  />
                </Grid>
                <Grid item xs={5} sx={{ pl: 0.5 }}>
                  <FieldEditBox
                    rec={props.rec}
                    label="部署名2"
                    field="organization.dept2"
                    onChangeField={props.onChangeField}
                  />
                </Grid>
                <Grid item xs={2}></Grid>

                <Grid item xs={3} sx={{ pl: 2 }}>
                  <EditFieldTitle title="役職" />
                </Grid>
                <Grid item xs={7}>
                  <FieldEditBox
                    rec={props.rec}
                    label="役職"
                    field="organization.title"
                    onChangeField={props.onChangeField}
                  />
                </Grid>
                <Grid item xs={5}></Grid>
              </Grid>
            </Paper>
          </Grid>
        )}
      </Grid>
    </>
  );
};
// ----------------------------------------------------------------
// 住所ブロック

const EditBlockAddresses = (props: EditBlockProp) => {
  const [count, setCount] = React.useState<number>(
    props.rec.addresses ? props.rec.addresses.length : 0
  );

  const initialData: AddrBlock = {
    kindof: "home",
    zipcode: "",
    region: "",
    city: "",
    street: "",
    building: ""
  };

  if (props.rec.addresses) {
    if (!Array.isArray(props.rec.addresses)) {
      props.rec.addresses = [{ ...initialData }];
    }
    //console.log(`addresses:${JSON.stringify(props.rec.addresses)}`);
    if (props.rec.addresses[0] === null) {
      props.rec.addresses[0] = { ...initialData };
    }
  } else {
    props.rec.addresses = [{ ...initialData }];
  }

  return (
    <>
      <BlockTitle title="住所" />

      {props.rec.addresses &&
        props.rec.addresses.map((addr, index) => (
          <Grid container>
            <Grid item sx={{ width: `${PictWidth}px` }}>
              <Fab
                size="small"
                aria-label="add"
                sx={{
                  ml: 9,
                  color: "white",
                  backgroundColor: "var(--col-offical)"
                }}
                onClick={() => {
                  if (props.rec.addresses) {
                    delete props.rec.addresses[index];
                    if (props.onChangeData) props.onChangeData(props.rec);
                  }
                  setCount(
                    props.rec.addresses ? props.rec.addresses.length : 0
                  );
                }}
              >
                <RemoveIcon />
              </Fab>
            </Grid>

            <Grid item sx={{ width: `calc( 100% - ${PictAreaWidth}px )` }}>
              <Paper
                component="form"
                sx={{
                  backgroundColor: "#f0f0f0"
                }}
              >
                <Grid container={true} columns={15}>
                  {/* ------ 分類の行 ------ */}
                  <Grid item xs={5} sx={{ pl: 2 }}>
                    <FieldComboBox
                      rec={props.rec}
                      label="分類"
                      editable={true}
                      options={[
                        { label: "自宅", data: "home" },
                        { label: "会社", data: "office" }
                      ]}
                      field={`addresses[${index}].kindof`}
                      fieldOnEdit={`addresses[${index}].label`}
                      onChangeField={props.onChangeField}
                    />
                  </Grid>
                  <Grid item xs={10}></Grid>

                  {/* ------ 郵便番号の行 ------ */}

                  <Grid item xs={3} sx={{ pl: 2 }}>
                    <EditFieldTitle title="郵便番号" />
                  </Grid>

                  <Grid item xs={5}>
                    <FieldEditBox
                      rec={props.rec}
                      label="郵便番号"
                      field={`addresses[${index}].zipcode`}
                      onChangeField={props.onChangeField}
                    />
                  </Grid>
                  <Grid item xs={1}>
                    <SquareIconButton
                      id={`addresses[${index}].zipcode`}
                      variant="outlined"
                      bgcolor="white"
                      onClick={(id) => {
                        let rp = ReformField(
                          props.rec,
                          `addresses[${index}].zipcode`
                        );
                        alert(`〒変換:${rp.rec[rp.field]}`);
                      }}
                    >
                      <ManageSearchIcon />
                    </SquareIconButton>
                  </Grid>
                  <Grid item xs={6}></Grid>

                  <Grid item xs={15}>
                    <Divider />
                  </Grid>

                  {/* ------ 住所の行 ------ */}
                  <Grid item xs={3} sx={{ pl: 2 }}>
                    <EditFieldTitle title="住所" />
                  </Grid>
                  <Grid item xs={3} sx={{ pr: 0.5 }}>
                    <FieldEditBox
                      rec={props.rec}
                      label="都道府県"
                      field={`addresses[${index}].region`}
                      onChangeField={props.onChangeField}
                    />
                  </Grid>
                  <Grid item xs={3} sx={{ pl: 0.5 }}>
                    <FieldEditBox
                      rec={props.rec}
                      label="市区町村"
                      field={`addresses[${index}].city`}
                      onChangeField={props.onChangeField}
                    />
                  </Grid>
                  <Grid item xs={6} sx={{ pl: 0.5 }}>
                    <FieldEditBox
                      rec={props.rec}
                      label="地名番地"
                      field={`addresses[${index}].street`}
                      onChangeField={props.onChangeField}
                    />
                  </Grid>

                  {/* ------ ビル名の行 ------ */}

                  <Grid item xs={3} sx={{ pl: 2 }}>
                    <EditFieldTitle title="ビル名" />
                  </Grid>
                  <Grid item xs={7} sx={{ pl: 0.5 }}>
                    <FieldEditBox
                      rec={props.rec}
                      label="ビル名"
                      field={`addresses[${index}].building`}
                      onChangeField={props.onChangeField}
                    />
                  </Grid>

                  <Grid item xs={15}>
                    <Divider />
                  </Grid>

                  {/* ------ 最寄り駅の行 ------ */}

                  <Grid item xs={3} sx={{ pl: 2 }}>
                    <EditFieldTitle title="最寄り駅" />
                  </Grid>

                  <Grid item xs={7} sx={{ pl: 0.5 }}>
                    <FieldEditBox
                      rec={props.rec}
                      label="最寄り駅"
                      field={`addresses[${index}].station`}
                      onChangeField={props.onChangeField}
                    />
                  </Grid>
                  <Grid item xs={6}></Grid>
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={15}>
              &nbsp;
            </Grid>
          </Grid>
        ))}
      <Grid container>
        <Grid item sx={{ width: `${PictWidth}px` }}>
          <Fab
            size="small"
            aria-label="add"
            sx={{ ml: 9, color: "white", backgroundColor: "gray" }}
            onClick={() => {
              if (!props.rec.addresses)
                props.rec["addresses"] = [{ ...initialData }];
              else {
                props.rec.addresses.push({ ...initialData });
              }
              if (props.onChangeData) props.onChangeData(props.rec);
              setCount(count + 1);
            }}
          >
            <AddIcon />
          </Fab>
        </Grid>
      </Grid>
    </>
  );
};

// ----------------------------------------------------------------
// TELブロック

const EditBlockTelephones = (props: EditBlockProp) => {
  const [count, setCount] = React.useState<number>(
    props.rec.telephones ? props.rec.telephones.length : 0
  );

  const initialData: TelephoneBlock = {
    kindof: "cell",
    number: "",
    label: ""
  };

  if (props.rec.telephones) {
    if (!Array.isArray(props.rec.telephones)) {
      props.rec.telephones = [{ ...initialData }];
    }
    //console.log(`telephones:${JSON.stringify(props.rec.telephones)}`);
    if (props.rec.telephones[0] === null) {
      props.rec.telephones[0] = { ...initialData };
    }
  } else {
    props.rec.telephones = [{ ...initialData }];
  }

  return (
    <>
      <BlockTitle title="電話番号" />

      {props.rec.telephones &&
        props.rec.telephones.map((addr, index) => (
          <Grid container>
            <Grid item sx={{ width: `${PictWidth}px` }}>
              <Fab
                size="small"
                aria-label="add"
                sx={{
                  ml: 9,
                  color: "white",
                  backgroundColor: "var(--col-offical)"
                }}
                onClick={() => {
                  if (props.rec.telephones) {
                    delete props.rec.telephones[index];
                    if (props.onChangeData) props.onChangeData(props.rec);
                  }
                  setCount(
                    props.rec.telephones ? props.rec.telephones.length : 0
                  );
                }}
              >
                <RemoveIcon />
              </Fab>
            </Grid>

            <Grid item sx={{ width: `calc( 100% - ${PictAreaWidth}px )` }}>
              <Paper
                component="form"
                sx={{
                  backgroundColor: "#f0f0f0",
                  pb: 1
                }}
              >
                <Grid container={true} columns={15}>
                  {/* ------ 分類／電話番号 ------ */}
                  <Grid item xs={5} sx={{ pl: 2 }}>
                    <FieldComboBox
                      rec={props.rec}
                      label="分類"
                      editable={true}
                      options={[
                        { data: "tel", label: "自宅TEL" },
                        { data: "fax", label: "自宅FAX" },
                        { data: "cell", label: "個人携帯" },
                        { data: "offtel", label: "会社TEL" },
                        { data: "offfax", label: "会社FAX" },
                        { data: "offcell", label: "会社携帯" }
                      ]}
                      field={`telephones[${index}].kindof`}
                      fieldOnEdit={`telephones[${index}].label`}
                      onChangeField={props.onChangeField}
                    />
                  </Grid>
                  <Grid item xs={1}></Grid>

                  <Grid item xs={6}>
                    <FieldEditBox
                      rec={props.rec}
                      label="電話番号"
                      field={`telephones[${index}].number`}
                      onChangeField={props.onChangeField}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={15}>
              &nbsp;
            </Grid>
          </Grid>
        ))}
      <Grid container>
        <Grid item sx={{ width: `${PictWidth}px` }}>
          <Fab
            size="small"
            aria-label="add"
            sx={{ ml: 9, color: "white", backgroundColor: "gray" }}
            onClick={() => {
              if (!props.rec.telephones)
                props.rec["telephones"] = [{ ...initialData }];
              else {
                props.rec.telephones.push({ ...initialData });
              }
              if (props.onChangeData) props.onChangeData(props.rec);
              setCount(count + 1);
            }}
          >
            <AddIcon />
          </Fab>
        </Grid>
      </Grid>
    </>
  );
};
// ----------------------------------------------------------------
// e-mailブロック

const EditBlockEMails = (props: EditBlockProp) => {
  const [count, setCount] = React.useState<number>(
    props.rec.emails ? props.rec.emails.length : 0
  );

  const initialData: EmailBlock = {
    kindof: "cell",
    address: "",
    label: ""
  };

  if (props.rec.emails) {
    if (!Array.isArray(props.rec.emails)) {
      props.rec.emails = [{ ...initialData }];
    }
    //console.log(`emails:${JSON.stringify(props.rec.emails)}`);
    if (props.rec.emails[0] === null) {
      props.rec.emails[0] = { ...initialData };
    }
  } else {
    props.rec.emails = [{ ...initialData }];
  }

  return (
    <>
      <BlockTitle title="メールアドレス" />

      {props.rec.emails &&
        props.rec.emails.map((addr, index) => (
          <Grid container>
            <Grid item sx={{ width: `${PictWidth}px` }}>
              <Fab
                size="small"
                aria-label="add"
                sx={{
                  ml: 9,
                  color: "white",
                  backgroundColor: "var(--col-offical)"
                }}
                onClick={() => {
                  if (props.rec.emails) {
                    delete props.rec.emails[index];
                    if (props.onChangeData) props.onChangeData(props.rec);
                  }
                  setCount(props.rec.emails ? props.rec.emails.length : 0);
                }}
              >
                <RemoveIcon />
              </Fab>
            </Grid>

            <Grid item sx={{ width: `calc( 100% - ${PictAreaWidth}px )` }}>
              <Paper
                component="form"
                sx={{
                  backgroundColor: "#f0f0f0",
                  pb: 1
                }}
              >
                <Grid container={true} columns={15}>
                  {/* ------ 分類／メールアドレス ------ */}
                  <Grid item xs={5} sx={{ pl: 2 }}>
                    <FieldComboBox
                      rec={props.rec}
                      label="分類"
                      editable={true}
                      options={[
                        { data: "home", label: "Eメール[自宅]" },
                        { data: "cell", label: "Eメール[携帯]" },
                        { data: "office", label: "Eメール[会社]" }
                      ]}
                      field={`emails[${index}].kindof`}
                      fieldOnEdit={`emails[${index}].label`}
                      onChangeField={props.onChangeField}
                    />
                  </Grid>
                  <Grid item xs={1}></Grid>

                  <Grid item xs={6}>
                    <FieldEditBox
                      rec={props.rec}
                      label="メールアドレス"
                      field={`emails[${index}].number`}
                      onChangeField={props.onChangeField}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={15}>
              &nbsp;
            </Grid>
          </Grid>
        ))}
      <Grid container>
        <Grid item sx={{ width: `${PictWidth}px` }}>
          <Fab
            size="small"
            aria-label="add"
            sx={{ ml: 9, color: "white", backgroundColor: "gray" }}
            onClick={() => {
              if (!props.rec.emails) props.rec["emails"] = [{ ...initialData }];
              else {
                props.rec.emails.push({ ...initialData });
              }
              if (props.onChangeData) props.onChangeData(props.rec);
              setCount(count + 1);
            }}
          >
            <AddIcon />
          </Fab>
        </Grid>
      </Grid>
    </>
  );
};

// ----------------------------------------------------------------
// webUrlブロック

const EditBlockWebUrls = (props: EditBlockProp) => {
  const [count, setCount] = React.useState<number>(
    props.rec.weburls ? props.rec.weburls.length : 0
  );

  const initialData: WebUrlBlock = {
    kindof: "profile",
    url: "",
    label: ""
  };

  if (props.rec.weburls) {
    if (!Array.isArray(props.rec.weburls)) {
      props.rec.weburls = [{ ...initialData }];
    }
    //console.log(`weburls:${JSON.stringify(props.rec.weburls)}`);
    if (props.rec.weburls[0] === null) {
      props.rec.weburls[0] = { ...initialData };
    }
  } else {
    props.rec.weburls = [{ ...initialData }];
  }

  return (
    <>
      <BlockTitle title="Webサイト" />

      {props.rec.weburls &&
        props.rec.weburls.map((addr, index) => (
          <Grid container>
            <Grid item sx={{ width: `${PictWidth}px` }}>
              <Fab
                size="small"
                aria-label="add"
                sx={{
                  ml: 9,
                  color: "white",
                  backgroundColor: "var(--col-offical)"
                }}
                onClick={() => {
                  if (props.rec.weburls) {
                    delete props.rec.weburls[index];
                    if (props.onChangeData) props.onChangeData(props.rec);
                  }
                  setCount(props.rec.weburls ? props.rec.weburls.length : 0);
                }}
              >
                <RemoveIcon />
              </Fab>
            </Grid>

            <Grid item sx={{ width: `calc( 100% - ${PictAreaWidth}px )` }}>
              <Paper
                component="form"
                sx={{
                  backgroundColor: "#f0f0f0",
                  pb: 1
                }}
              >
                <Grid container={true} columns={15}>
                  {/* ------ 分類／メールアドレス ------ */}
                  <Grid item xs={5} sx={{ pl: 2 }}>
                    <FieldComboBox
                      rec={props.rec}
                      label="分類"
                      editable={true}
                      options={[
                        { data: "profile", label: "プロフィール" },
                        { data: "blog", label: "ブログ" },
                        { data: "hp", label: "ホームページ" },
                        { data: "office", label: "会社" }
                      ]}
                      field={`weburls[${index}].kindof`}
                      fieldOnEdit={`weburls[${index}].label`}
                      onChangeField={props.onChangeField}
                    />
                  </Grid>
                  <Grid item xs={1}></Grid>

                  <Grid item xs={6}>
                    <FieldEditBox
                      rec={props.rec}
                      label="URL"
                      field={`weburls[${index}].number`}
                      onChangeField={props.onChangeField}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={15}>
              &nbsp;
            </Grid>
          </Grid>
        ))}
      <Grid container>
        <Grid item sx={{ width: `${PictWidth}px` }}>
          <Fab
            size="small"
            aria-label="add"
            sx={{ ml: 9, color: "white", backgroundColor: "gray" }}
            onClick={() => {
              if (!props.rec.weburls)
                props.rec["weburls"] = [{ ...initialData }];
              else {
                props.rec.weburls.push({ ...initialData });
              }
              if (props.onChangeData) props.onChangeData(props.rec);
              setCount(count + 1);
            }}
          >
            <AddIcon />
          </Fab>
        </Grid>
      </Grid>
    </>
  );
};

// 連名１つのブロック　fieldには joint_names[<index>] を指定
interface OneRenmeiProps extends EditBlockProp {
  index: number;
}
const EditBlockOneJointName = (props: OneRenmeiProps) => {
  const [detail, setDetail] = React.useState<boolean>(false);

  return (
    <Grid container>
      <Paper
        component="form"
        sx={{
          backgroundColor: "#f0f0f0"
        }}
      >
        <Grid container={true} columns={16}>
          {/* ------ 氏名の行 ------ */}
          <Grid item={true} xs={3} sx={{ pl: 2 }}>
            <EditFieldTitle title="氏名" />
          </Grid>
          <Grid item={true} xs={4} sx={{ px: 1 }}>
            <FieldEditBox
              rec={props.rec}
              label="姓"
              field={`joint_names[${props.index}].lastname`}
              onChangeField={props.onChangeField}
            />
          </Grid>
          <Grid item={true} xs={4} sx={{ px: 1 }}>
            <FieldEditBox
              rec={props.rec}
              label="名"
              field={`joint_names[${props.index}].firstname`}
              onChangeField={props.onChangeField}
            />
          </Grid>
          <Grid item={true} xs={4} sx={{ px: 1 }}>
            <FieldComboBox
              rec={props.rec}
              label="敬称"
              field={`joint_names[${props.index}].suffix`}
              editable={true}
              options={[
                { data: "様" },
                { data: "殿" },
                { data: "御中" },
                { data: "行" },
                { data: "宛" },
                { data: "先生" },
                { data: "君" },
                { data: "くん" },
                { data: "さん" },
                { data: "ちゃん" }
              ]}
              onChangeField={props.onChangeField}
            />
          </Grid>
          <Grid item={true} xs={1} sx={{ px: 1, mt: 0 }}>
            <SquareIconButton
              id=""
              variant="contained"
              bgcolor="gray"
              onClick={(id) => {
                setDetail(!detail);
              }}
            >
              {!detail ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
            </SquareIconButton>
          </Grid>

          {/* ------ フリガナの行 ------ */}
          <Grid item={true} xs={3} sx={{ pl: 2 }}>
            <EditFieldTitle title="フリガナ" />
          </Grid>
          <Grid item={true} xs={4} sx={{ px: 1 }}>
            <FieldEditBox
              rec={props.rec}
              label="姓フリガナ"
              field={`joint_names[${props.index}].lastkana`}
              onChangeField={props.onChangeField}
            />
          </Grid>
          <Grid item={true} xs={4} sx={{ px: 1 }}>
            <FieldEditBox
              rec={props.rec}
              label="名フリガナ"
              field={`joint_names[${props.index}].firstkana`}
              onChangeField={props.onChangeField}
            />
          </Grid>
          <Grid item={true} xs={5} sx={{ px: 1 }}></Grid>

          <Grid item={true} xs={16} sx={{ px: 1 }}>
            <Divider />
          </Grid>

          {/* ------ 詳細の始まり ------ */}
          {detail && (
            <>
              {/* ------ 誕生日＆性別　の行 ------ */}
              <Grid item={true} xs={3} sx={{ pl: 2 }}>
                <EditFieldTitle title="誕生日" />
              </Grid>
              <Grid item={true} xs={5} sx={{ px: 1 }}>
                <FieldDatePicker
                  rec={props.rec}
                  label="誕生日"
                  field={`joint_names[${props.index}].birthdate`}
                  onChangeField={props.onChangeField}
                />
              </Grid>
              <Grid item={true} xs={3} sx={{ pl: 2 }}>
                <EditFieldTitle title="性別" />
              </Grid>
              <Grid item={true} xs={4} sx={{ px: 1 }}>
                <FieldComboBox
                  rec={props.rec}
                  label="性別"
                  field={`joint_names[${props.index}].gender`}
                  editable={false}
                  options={[
                    { data: "男性" },
                    { data: "女性" },
                    { data: "その他" }
                  ]}
                  onChangeField={props.onChangeField}
                />
              </Grid>

              <Grid item={true} xs={15} sx={{ px: 1 }}>
                &nbsp;
              </Grid>
            </>
          )}
        </Grid>
      </Paper>
    </Grid>
  );
};

// ----------------------------------------------------------------
// 連名ブロック

const EditBlockJointNames = (props: EditBlockProp) => {
  const [count, setCount] = React.useState<number>(
    props.rec.joint_names ? props.rec.joint_names.length : 0
  );

  const initialData: FamilyBlock = {
    lastname: "",
    firstname: "",
    lastkana: "",
    firstkana: "",
    birthdate: null
  };

  if (props.rec.joint_names) {
    if (!Array.isArray(props.rec.joint_names)) {
      props.rec.joint_names = [{ ...initialData }];
    }
    //console.log(`joint_names:${JSON.stringify(props.rec.joint_names)}`);
    if (props.rec.joint_names[0] === null) {
      props.rec.joint_names[0] = { ...initialData };
    }
  } else {
    props.rec.joint_names = [{ ...initialData }];
  }

  return (
    <>
      <BlockTitle title="連名" />

      {props.rec.joint_names &&
        props.rec.joint_names.map((name, index) => (
          <Grid container>
            <Grid item sx={{ width: `${PictWidth}px` }}>
              <Fab
                size="small"
                aria-label="add"
                sx={{
                  ml: 9,
                  color: "white",
                  backgroundColor: "var(--col-offical)"
                }}
                onClick={() => {
                  if (props.rec.joint_names) {
                    delete props.rec.joint_names[index];
                    if (props.onChangeData) props.onChangeData(props.rec);
                  }
                  setCount(
                    props.rec.joint_names ? props.rec.joint_names.length : 0
                  );
                }}
              >
                <RemoveIcon />
              </Fab>
            </Grid>

            <Grid item sx={{ width: `calc( 100% - ${PictAreaWidth}px )` }}>
              <EditBlockOneJointName
                index={index}
                abid={props.abid}
                rec={props.rec}
                onChangeField={props.onChangeField}
              />
            </Grid>
            <Grid item xs={15}>
              &nbsp;
            </Grid>
          </Grid>
        ))}
      <Grid container>
        <Grid item sx={{ width: `${PictWidth}px` }}>
          <Fab
            size="small"
            aria-label="add"
            sx={{ ml: 9, color: "white", backgroundColor: "gray" }}
            onClick={() => {
              if (!props.rec.joint_names)
                props.rec["joint_names"] = [{ ...initialData }];
              else {
                props.rec.joint_names.push({ ...initialData });
              }
              if (props.onChangeData) props.onChangeData(props.rec);
              setCount(count + 1);
            }}
          >
            <AddIcon />
          </Fab>
        </Grid>
      </Grid>
    </>
  );
};
// ----------------------------------------------------------------

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
    const rp = ReformField(newval, field);
    rp.rec[rp.field] = value;
    setState({ ...state, data: newval });
    //console.log(`${field}=${value}`);
  };
  const adddelCallback = (rec: {}) => {
    let newval: RecordType = {
      ...rec,
      id: state.data ? state.data.id : ""
    };

    setState({ ...state, data: newval });
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

    //createData("name", name), createData("dessert", "Cupcake")];
    cont = (
      <div className="editConts">
        <EditBlockName
          abid={state.abid}
          rec={rec}
          onChangeField={editCallback}
        />
        <EditBlockOrg
          abid={state.abid}
          rec={rec}
          onChangeField={editCallback}
        />
        <Divider sx={{ mt: 1 }} />
        <EditBlockAddresses
          abid={state.abid}
          rec={rec}
          onChangeField={editCallback}
          onChangeData={adddelCallback}
        />

        <Divider sx={{ mt: 1 }} />
        <EditBlockTelephones
          abid={state.abid}
          rec={rec}
          onChangeField={editCallback}
          onChangeData={adddelCallback}
        />

        <Divider sx={{ mt: 1 }} />
        <EditBlockEMails
          abid={state.abid}
          rec={rec}
          onChangeField={editCallback}
          onChangeData={adddelCallback}
        />
        <Divider sx={{ mt: 1 }} />
        <EditBlockWebUrls
          abid={state.abid}
          rec={rec}
          onChangeField={editCallback}
          onChangeData={adddelCallback}
        />

        <Divider sx={{ mt: 1 }} />
        <EditBlockJointNames
          abid={state.abid}
          rec={rec}
          onChangeField={editCallback}
          onChangeData={adddelCallback}
        />
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

export default ABRecDialog;
export { ABRecDialogPropsType, ABRecEditStateType, ABEditRecord };

//import React, { useContext, useEffect, useMemo } from "react";
import * as React from "react";
import { useContext, useRef, ReactNode, Children } from "react";
import { UserContext, UserContextType } from "../Account";
import {
  RecordType,
  loadRecord,
  PersonalPicture,
  getFullName,
  getFullNameYomi
} from "../CABDataTypes";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import PopupProgress from "../components/PopupProgress";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import AddLocationAltOutlinedIcon from "@mui/icons-material/AddLocationAltOutlined";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import MessageBox, { MessageBoxProps } from "../components/MessageBox";

import { ContentsPropsType, isHomeAddress } from "../AppSettings";
import CircularProgress from "@mui/material/CircularProgress";
import { SvgIcon } from "@mui/material";
import { isMobile } from "react-device-detect";
import { BrowserView, MobileView } from "react-device-detect";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import type {} from "@mui/x-date-pickers/themeAugmentation";

type ABRecDialogPropsType = {
  recid: string;
  name: string;
  user: UserContextType;
  abook: ContentsPropsType;
  onEdit: (abookId: string, rec: RecordType) => void;
  onDeleted: (abookId: string, rec: RecordType) => void;
  onCopy: (abookId: string, rec: RecordType) => void;
  onSend: (abookId: string, rec: RecordType) => void;
  onClose: () => void;
};

export const ReformName = (rec: RecordType) => {
  return getFullName(rec);
};
export const ReformNameYomi = (rec: RecordType) => {
  return getFullNameYomi(rec);
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

type statusType = {
  status: "loading" | "fetching" | "success" | "error";
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

  const dispError = (json: {}) => {
    let error: string = json["error"] || json["statusText"] || "load error";
    let mbinfo: MessageBoxProps = {
      open: true,
      caption: "削除に失敗しました",
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

  const handleClose = () => {
    setOpen(false);
    props.onClose();
  };

  const handleEdit = () => {
    handleClose();
    //console.log(`Edit:${JSON.stringify(recdata)}`);
    props.onEdit(props.abook.id, recdata);
  };

  const execDelete = () => {
    if (progress === true) return;

    setProgress(true);

    let url = `${user.getEpt()}/address/${props.recid}`;
    let params = {};
    if ("etag" in recdata) {
      params["If-Match"] = recdata["etag"];
    }
    user.FetchWithRefreshedRetry(
      url,
      "DELETE",
      (json) => {
        setProgress(false);
        if ("data" in json) {
          setOpen(false);
          props.onClose();
          props.onDeleted(recdata.id, json["data"]);
        } else {
          dispError(json);
        }
      },
      {
        params: params,
        postdata: { id: props.recid }
      }
    );
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
      onCancel: cancelMsgBox
    };
    setMsgbox(mbdata);
  };

  if (open === true && status.status === "loading") {
    if (recdata.id === props.recid) {
      if (recdata.id) {
        setStatus({ status: "success", text: "ok" });
      }
    } else {
      setStatus({ ...status, status: "fetching" });
      console.log(`loadRecord(${props.recid})`);
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
  if (status.status === "loading" || status.status === "fetching") {
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
      <PopupProgress open={progress} type="circle" />
    </Dialog>
  );
};

export default ABRecDialog;
export { ABRecDialogPropsType };

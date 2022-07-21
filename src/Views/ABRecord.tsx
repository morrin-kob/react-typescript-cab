import React, { useContext, useEffect, useMemo } from "react";
import { UserContext, UserContextType } from "../Account";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import PersonIcon from "@mui/icons-material/Person";
import PersonOutlineTwoToneIcon from "@mui/icons-material/PersonOutlineTwoTone";
import AddLocationAltOutlinedIcon from "@mui/icons-material/AddLocationAltOutlined";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import WysiwygIcon from "@mui/icons-material/Wysiwyg";
import ListAltIcon from "@mui/icons-material/ListAlt";
import SourceIcon from "@mui/icons-material/Source";
import {
  AppVal,
  ajaxGet,
  ajaxPost,
  reformText,
  ContentsPropsType
} from "../AppSettings";
import CircularProgress from "@mui/material/CircularProgress";
import LinearProgress from "@mui/material/LinearProgress";
import {
  DataGrid,
  GridRowsProp,
  GridColDef,
  GridCellParams,
  MuiEvent
} from "@mui/x-data-grid";
import { useRef } from "react";
import { RoundaboutLeft } from "@mui/icons-material";

import DefPersonImg from "../assets/images/person.png";

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
};

type ABRecDialogStateType = {
  open: boolean;
  id: string;
  name: string;
  data: RecordType;
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

function createData(
  title: string,
  data: string,
  icon: object = null,
  link: string = "",
  command: string = ""
) {
  return { title, data, icon, link, command };
}

//
// 1レコードの詳細データの出力
//
const OutRecord = (rec: RecordType) => {
  const rows = [];
  const furigana = ReformNameYomi(rec);
  rows.push(createData("フリガナ", furigana));

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
      let icon = null;
      let link = "";
      let command = "";
      if (address.zipcode) addressData += `〒${address.zipcode}\n`;
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
      let order = [];
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
      let order = [];
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
  }

  return rows;
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
    this.state = {
      open: false,
      id: "",
      name: "",
      data: { id: "" }
    };
    //    this.user = useContext(UserContext);
  }

  handleClose = () => {
    this.setState({ open: false });
  };

  render() {
    if (this.state.data.id !== this.state.id) {
      // load
      let url = `${this.props.user.getEpt()}/address/${this.state.id}`;
      let params = {
        atk: this.props.user.getAToken(),
        ept: this.props.user.getEpm(),
        uag: this.props.user.getUag()
      };
      ajaxGet(url, params, (json) => {
        let rec = null;
        if ("data" in json) {
          rec = { ...this.state.data, ...json["data"] };
          this.setState({ data: rec });
        } else {
          if (parseInt(json["statusCode"], 10) === 401) {
            this.props.user.RefreshAndRetry(url, "GET", params, (json: {}) => {
              if ("data" in json) {
                rec = { ...this.state.data, ...json["data"] };
              } else {
                let error =
                  json["error"] ||
                  json["statusMessage"] ||
                  "ロードに失敗しました";
                rec = { ...this.state.data, error: error };
              }
              this.setState({ data: rec });
            });
          } else {
            let error =
              json["error"] || json["statusMessage"] || "ロードに失敗しました";
            rec = { ...this.state.data, error: error };
            this.setState({ data: rec });
          }
        }
      });
    }

    let name = this.state.name;
    let cont = (
      <Box sx={{ width: "100%", mt: 10, textAlign: "center" }}>
        <div>{this.state.id}</div>
        <CircularProgress />
      </Box>
    );
    if (this.state.data.id && this.state.data.id === this.state.id) {
      const rec: RecordType = this.state.data;
      name = ReformName(rec);

      const rows = OutRecord(rec);

      //createData("name", name), createData("dessert", "Cupcake")];
      cont = (
        <div>
          <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={2}>
            <Box gridColumn="span 2">
              <img
                src={DefPersonImg}
                style={{ width: 64, height: 64 }}
                alt=""
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
                            <row.icon size="large" />
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
    function makeButton(caption, color, onclick) {
      return { caption: caption, color: color, onclick: onclick };
    }
    const buttons: DlgButtonProps[] = [];
    buttons.push(makeButton("削除", "warning", this.handleClose));
    buttons.push(makeButton("他のユーザに送信", "primary", this.handleClose));
    buttons.push(makeButton("コピー", "primary", this.handleClose));
    buttons.push(makeButton("編集", "success", this.handleClose));
    buttons.push(makeButton("閉じる", "primary", this.handleClose));

    return (
      <Dialog open={this.state.open} onClose={this.handleClose}>
        <DialogTitle sx={{ width: 600 }}>{name}</DialogTitle>
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

export { ABRecDialogPropsType, ABRecDialogStateType };

import * as React from "react";
import { Component, ReactNode, useContext } from "react";
import { UserContext, UserContextType } from "../Account";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Link from "@mui/material/Link";
import PulldownMenu from "./PulldownMenuButton";
import { reformText } from "../AppSettings";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";

import {
  EditFieldTitle,
  SquareIconButton,
  FieldEditBox,
  FieldTextArea,
  FieldComboBox,
  FieldDatePicker,
  TagSetter,
  FieldCheckboxGroup,
  FieldRadioButtonsGroup,
  ReformField
} from "../components/EditParts";

import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Input from "@mui/material/Input";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import AccountCircle from "@mui/icons-material/AccountCircle";

function emailValidation(value: string) {
  if (!value) return "メールアドレスを入力してください";
  const regex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  if (!regex.test(value)) return "正しい形式でメールアドレスを入力してください";
  return "";
}
type WarningBlockProps = {
  message: string;
};
function WarningBlock(props: WarningBlockProps) {
  let alert = null;
  if (props.message) {
    alert = (
      <Alert severity="error">
        {props.message.split(/\n|<br>|<br \/>/i).map((str) => {
          return <div>{str}</div>;
        })}
      </Alert>
    );
  } else {
    alert = (
      <Alert severity="info">登録emailとパスワードでログインしてください</Alert>
    );
  }
  return alert;
}

export type LoginButtonProps = {
  text: string;
};
function LoginButton(props: LoginButtonProps) {
  let text = props.text || "Login";
  const user = useContext(UserContext);

  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [autoLogin, setAutoLogin] = React.useState(false);

  const [logindata, setLogindata] = React.useState({
    email: user.getUserEmail(),
    password: "",
    uag: user.getUag(),
    scd: "",
    ept: user.getEpt(),
    eps: user.getEps(),
    epm: user.getEpm(),
    cid: user.getCid(),
    cse: user.getCse(),
    csr: user.getCsr()
  });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const forgotPw = () => {
    alert("todo:さらにダイアログ出して処理");
  };
  const handleLogin = () => {
    let err = "";
    let need = "";
    for (const key of Object.keys(logindata)) {
      if (key === "email") {
        err = emailValidation(logindata.email);
      } else if (key === "password") {
        if (logindata.password.length === 0) {
          err = "パスワードを入力してください";
        }
      } else {
        if (logindata[key].length === 0) {
          need = key;
        }
      }
      if (err || need) break;
    }

    if (need) {
      err =
        "You have to specify the [" +
        need +
        "] you've got somewhere.<BR />" +
        "hint:\n " +
        (logindata.eps || "https://<SERVICE-DOMAIN>/api") +
        "/authorize?response_type=code&client_id=" +
        (logindata.cid || "<CLIENT-ID>") +
        "&state=" +
        (logindata.cse || "<CLIENT-STATE>");
    }

    if (err.length) {
      setMessage(err);
      return;
    }

    //handleClose();
    user.Login(
      logindata.email,
      logindata.password,
      logindata.uag,
      logindata.scd,
      logindata.ept,
      logindata.eps,
      logindata.epm,
      logindata.cid,
      logindata.cse,
      logindata.csr,
      (result) => {
        if (result.login === true) handleClose();
        else if (result.errtxt) {
          setMessage(result.errtxt);
        }
      }
    );
  };
  const onChangeInput = (id: string, value: string) => {
    setLogindata({ ...logindata, [id]: value });
    setMessage("");
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event: React.MouseEvent<unknown>) => {
    event.preventDefault();
  };

  //variant="outlined"
  return (
    <div>
      <Button
        sx={{ backgroundColor: "#608080" }}
        variant="contained"
        onClick={handleClickOpen}
      >
        {text}
      </Button>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>ログイン</DialogTitle>
        <DialogContentText>
          <WarningBlock message={message} />
        </DialogContentText>
        <DialogContent sx={{ width: "calc( 80vw )", maxWidth: "30em" }}>
          {Object.keys(logindata).map((key) => {
            const type =
              key === "password"
                ? "password"
                : key === "email"
                ? "email"
                : "text";
            const label = key === "email" ? "Email Address" : key;
            return (
              <FieldEditBox
                id={key}
                data={logindata}
                label={label}
                type={type}
                variant="standard"
                onChange={(id, value, e) => onChangeInput(id, value)}
              />
            );
          })}
          <DialogContentText>
            <p>
              <br />
              <Link className="smaller" onClick={forgotPw}>
                パスワードを忘れたなどログインにお困りですか？
              </Link>
            </p>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={handleClose}>
            キャンセル
          </Button>
          <Button variant="contained" onClick={handleLogin}>
            ログイン
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export type AccountButtonProps = {
  userId: number;
  userName: string;
  logoff: () => void;
};

function AccountButton(props: any) {
  const user = useContext(UserContext);

  const items = [
    {
      text: "アカウント設定",
      handler: () => {
        alert("アカウント設定 を選択");
      }
    },
    {
      text: "新規に何かする",
      handler: () => {
        alert("新規に何かする を選択");
      }
    },
    {
      text: "ログオフ",
      handler: () => {
        user.Logoff();
      }
    }
  ];
  return user.isUserLoggedIn() ? (
    <PulldownMenu
      tipText="アカウント設定・ログオフなど"
      popupId="acc-settings"
      bgcolor="#303030"
      icon={AccountCircle}
      iconColor="var(--col-offical)"
      text={user.getUserName()}
      items={items}
    />
  ) : (
    <LoginButton text="ログイン" />
  );
}

export { LoginButton, AccountButton };

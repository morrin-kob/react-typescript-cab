import * as React from "react";
import { UserContext, UserContextType } from "../Account";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Link from "@mui/material/Link";
import PulldownMenu from "./PulldownMenu";
import { reformText } from "../AppSettings";
import Alert from "@mui/material/Alert";

import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Input from "@mui/material/Input";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

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
  user: UserContextType;
};
function LoginButton(props: LoginButtonProps) {
  let text = props.text || "Login";
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState(props.user.getUserEmail());
  const [uag, setUag] = React.useState(props.user.getUag());
  const [scd, setScd] = React.useState("");
  const [ept, setEpt] = React.useState(props.user.getEpt());
  const [eps, setEps] = React.useState(props.user.getEps());
  const [epm, setEpm] = React.useState(props.user.getEpm());
  const [cid, setCid] = React.useState(props.user.getCid());
  const [cse, setCse] = React.useState(props.user.getCse());
  const [csr, setCsr] = React.useState(props.user.getCsr());
  const [password, setPassword] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [autoLogin, setAutoLogin] = React.useState(false);

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
    let err = emailValidation(email);
    let need = "";
    if (err.length === 0 && password.length === 0) {
      err = "パスワードを入力してください";
    } else if (uag.length === 0) {
      need = "uag";
    } else if (scd.length === 0) {
      need = "scd";
    } else if (ept.length === 0) {
      need = "ept";
    } else if (eps.length === 0) {
      need = "eps";
    } else if (epm.length === 0) {
      need = "epm";
    } else if (cid.length === 0) {
      need = "cid";
    } else if (cse.length === 0) {
      need = "cse";
    } else if (csr.length === 0) {
      need = "csr";
    }
    if (need) {
      err =
        "You have to specify the [" +
        need +
        "] you've got somewhere.<BR />" +
        "hint:\n " +
        (eps ? eps : "https://<SERVICE-DOMAIN>/api") +
        "/authorize?response_type=code&client_id=" +
        (cid ? cid : "<CLIENT-ID>") +
        "&state=" +
        (cse ? cse : "<CLIENT-STATE>");
    }

    if (err.length) {
      setMessage(err);
      return;
    }

    //handleClose();
    props.user.Login(
      email,
      password,
      uag,
      scd,
      ept,
      eps,
      epm,
      cid,
      cse,
      csr,
      (result) => {
        if (result.login === true) handleClose();
        else if (result.errtxt) {
          setMessage(result.errtxt);
        }
      }
    );
  };
  const onChangeEmail = (value: string) => {
    setEmail(value);
    setMessage("");
  };
  const onChangePw = (value: string) => {
    setPassword(value);
    setMessage("");
  };
  const onChangeUag = (value: string) => {
    setUag(value);
    setMessage("");
  };
  const onChangeScd = (value: string) => {
    setScd(value);
    setMessage("");
  };
  const onChangeEpt = (value: string) => {
    setEpt(value);
    setMessage("");
  };
  const onChangeEps = (value: string) => {
    setEps(value);
    setMessage("");
  };
  const onChangeEpm = (value: string) => {
    setEpm(value);
    setMessage("");
  };
  const onChangeCid = (value: string) => {
    setCid(value);
    setMessage("");
  };
  const onChangeCse = (value: string) => {
    setCse(value);
    setMessage("");
  };
  const onChangeCsr = (value: string) => {
    setCsr(value);
    setMessage("");
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  //variant="outlined"
  return (
    <div>
      <Button variant="contained" color="info" onClick={handleClickOpen}>
        {text}
      </Button>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>ログイン</DialogTitle>
        <DialogContentText>
          <WarningBlock message={message} />
        </DialogContentText>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="email"
            value={email}
            label="Email Address"
            type="email"
            fullWidth
            variant="standard"
            onChange={(e) => onChangeEmail(e.target.value)}
          />
          <FormControl sx={{ m: 1, width: 97 / 100 }} variant="standard">
            <InputLabel htmlFor="standard-adornment-password">
              Password
            </InputLabel>
            <Input
              margin="dense"
              id="standard-adornment-password"
              //label="Password"
              type={showPassword ? "text" : "password"}
              fullWidth
              //variant="standard"
              onChange={(e) => onChangePw(e.target.value)}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
          <TextField
            margin="dense"
            id="uag"
            value={uag}
            label="uag"
            fullWidth
            variant="standard"
            onChange={(e) => onChangeUag(e.target.value)}
          />
          <TextField
            margin="dense"
            id="scd"
            value={scd}
            label="scd"
            fullWidth
            variant="standard"
            onChange={(e) => onChangeScd(e.target.value)}
          />
          <TextField
            margin="dense"
            id="ept"
            value={ept}
            label="ept"
            fullWidth
            variant="standard"
            onChange={(e) => onChangeEpt(e.target.value)}
          />
          <TextField
            margin="dense"
            id="eps"
            value={eps}
            label="eps"
            fullWidth
            variant="standard"
            onChange={(e) => onChangeEps(e.target.value)}
          />
          <TextField
            margin="dense"
            id="epm"
            value={epm}
            label="epm"
            fullWidth
            variant="standard"
            onChange={(e) => onChangeEpm(e.target.value)}
          />
          <TextField
            margin="dense"
            id="cid"
            value={cid}
            label="cid"
            fullWidth
            variant="standard"
            onChange={(e) => onChangeCid(e.target.value)}
          />
          <TextField
            margin="dense"
            id="cse"
            value={cse}
            label="cse"
            fullWidth
            variant="standard"
            onChange={(e) => onChangeCse(e.target.value)}
          />
          <TextField
            margin="dense"
            id="csr"
            value={csr}
            label="csr"
            fullWidth
            variant="standard"
            onChange={(e) => onChangeCsr(e.target.value)}
          />
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

function AccountButton(props: AccountButtonProps) {
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
        props.logoff();
      }
    }
  ];
  return <PulldownMenu account={true} text={props.userName} items={items} />;
}

export { LoginButton, AccountButton };

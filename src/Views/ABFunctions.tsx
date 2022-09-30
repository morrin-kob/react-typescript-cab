import * as React from "react";
import { useContext, ReactNode, Children } from "react";
import { UserContext, UserContextType } from "../Account";
import PopupProgress from "../components/PopupProgress";
import { useQuery } from "react-query";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import MessageBox, { MessageBoxProps } from "../components/MessageBox";
import CloseIcon from "@mui/icons-material/Close";
import { isMobile } from "react-device-detect";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import { ContentsPropsType } from "../AppSettings";
import { BrowserHistory } from "history";
import {
  EditFieldTitle,
  SquareIconButton,
  FieldEditBox,
  FieldTextArea,
  FieldComboBox,
  FieldDatePicker,
  ReformField,
  ColorBox
} from "../components/EditParts";
import { ABIcon, iconlist } from "./ABIcons";

export type ABSettingDialogPropsType = {
  open: boolean;
  abook: ContentsPropsType;
  onSave: (abook: ContentsPropsType) => void;
  onClose: () => void;
};

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

//
// 住所録の設定
//
const ABSettings = (props: ABSettingDialogPropsType) => {
  const [open, setOpen] = React.useState(props.open);
  const [saving, setSaving] = React.useState(false);
  const [settings, setSettings] = React.useState<ContentsPropsType>({
    ...props.abook
  });
  const [msgbox, setMsgbox] = React.useState<MessageBoxProps>({
    open: false,
    caption: "",
    message: ""
  });

  const cancelMsgBox = () => {
    setMsgbox({ ...msgbox, open: false });
  };

  const user = useContext(UserContext);

  if (props.abook.id !== settings.id) {
    setSettings({ ...props.abook });
    setOpen(props.open);
  }
  if (open !== props.open) {
    setOpen(props.open);
  }

  const handleClose = () => {
    setOpen(false);
    props.onClose();
  };

  const savingError = (json: {}) => {
    let error: string = json["error"] || json["statusText"] || "load error";
    let mbinfo: MessageBoxProps = {
      open: true,
      caption: "更新エラー",
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

  const onSaveSetting = (json: {}) => {
    setSaving(false);
    if (json["data"]) {
      props.onSave(json["data"]);
      handleClose();
    } else {
      savingError(json);
    }
  };

  const handleSave = () => {
    if (saving === true) return;
    setSaving(true);

    let url = `${user.getEpt()}/group/${props.abook.id}`;
    let params = {};
    if ("etag" in props.abook) {
      params["If-Match"] = props.abook["etag"];
    }

    user.FetchWithRefreshedRetry(
      url,
      "PUT",
      (json) => {
        onSaveSetting(json);
      },
      {
        params: params,
        postdata: { ...settings }
      }
    );
  };

  const onChangeField = (field: string, value: string) => {
    let newVal = { ...settings };
    newVal[field] = value;
    setSettings(newVal);
  };

  const colorlist: string[] = [
    "d7000f",
    "e16600",
    "ffa700",
    "7cc500",
    "009200",
    "009a9a",
    "0068c5",
    "00ace3",

    "8152a8",
    "fa578f",
    "a51e4b",
    "cf9200",
    "164f80",
    "c24949",
    "ac5600",
    "8c8c00"
  ];

  const getCurrABColor = () => {
    return settings.color ? settings.color.toLowerCase() : colorlist[0];
  };

  const handleSetColor = (col: string) => {
    if (getCurrABColor() !== col) {
      onChangeField("color", col);
    }
  };

  const getCurrABIcon = () => {
    return settings.icon ? settings.icon : "book";
  };

  const handleSetIcon = (icon: string) => {
    if (getCurrABIcon() !== icon) {
      onChangeField("icon", icon);
    }
  };

  const buttons: DlgButtonProps[] = [
    { caption: "保存", color: "success", onclick: handleSave },
    { caption: "閉じる", color: "primary", onclick: handleClose }
  ];

  let cxDlg: string = isMobile ? "calc( 100vw )" : "calc( 80vw )";

  let cxBox = 36;
  let cyBox = 36;
  let cbareaWidth = cxBox * 8;

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle sx={{ width: cxDlg, minWidth: "20em", maxWidth: 600 }}>
        住所録の設定 - {props.abook.name}
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
      <DialogContent>
        <EditFieldTitle title="住所録名変更" />
        <FieldEditBox
          label=""
          field="name"
          data={settings}
          onChangeField={onChangeField}
        />
        {/* --------------------------------- */}
        <EditFieldTitle title="住所録カラー変更" />
        <Grid container sx={{ width: cbareaWidth }} columns={8}>
          {colorlist.map((col) => (
            <Grid item xs={1}>
              <ColorBox
                width={cxBox}
                height={cyBox}
                color={col}
                id={col}
                checked={getCurrABColor() === col}
                onClick={handleSetColor}
              >
                {getCurrABColor() === col && <>✔</>}
              </ColorBox>
            </Grid>
          ))}
        </Grid>
        {/* --------------------------------- */}
        <EditFieldTitle title="住所録アイコンの変更" />
        <Grid container sx={{ width: cbareaWidth }} columns={8}>
          {Object.keys(iconlist).map((key) => (
            <Grid item xs={1}>
              <ColorBox
                id={key}
                width={cxBox}
                height={cyBox}
                color="transparent"
                selected={getCurrABIcon() === key}
                onClick={handleSetIcon}
              >
                <ABIcon name={key} sx={{ color: getCurrABColor() }} />
              </ColorBox>
            </Grid>
          ))}
        </Grid>

        {/* --------------------------------- */}
        <EditFieldTitle title="リスト表示形式" />

        <FormControl>
          <FormLabel id="listtype-label">
            住所録を表示する形式を選択して下さい。
          </FormLabel>
          <RadioGroup
            aria-labelledby="listtype-label"
            defaultValue="private"
            value={settings.use}
            name="radio-buttons-group"
            onChange={(e) => {
              onChangeField("use", e.target.value);
            }}
          >
            <FormControlLabel
              value="private"
              control={<Radio />}
              label={
                <Box style={{ fontSize: "90%" }}>
                  標準（氏名、写真、住所、電話番号を表示）
                </Box>
              }
            />
            <FormControlLabel
              value="corp"
              control={<Radio />}
              label={
                <Box style={{ fontSize: "90%" }}>
                  会社（氏名、勤務先、住所、電話番号を表示）
                </Box>
              }
            />
          </RadioGroup>
        </FormControl>
      </DialogContent>
      <Divider />
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
      <PopupProgress open={saving} type="circle" />
      <MessageBox {...msgbox} />
    </Dialog>
  );
};
export default ABSettings;

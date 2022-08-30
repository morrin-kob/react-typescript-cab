import * as React from "react";
import { useContext, ReactNode, Children } from "react";
import { UserContext, UserContextType } from "../Account";
import { useQuery } from "react-query";
import ABRecDialog, {
  RecordType,
  ABRecEditStateType,
  ReformName
} from "./ABRecord";
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
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import ButtonBase from "@mui/material/ButtonBase";
import CloseIcon from "@mui/icons-material/Close";
import Checkbox from "@mui/material/Checkbox";
import { isMobile } from "react-device-detect";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
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
import { useRef } from "react";
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
  const [settings, setSettings] = React.useState<ContentsPropsType>(
    props.abook
  );

  //const user = useContext(UserContext);

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = () => {
    // .....

    handleClose();
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

  let cont = <></>;

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
        {cont}
        <EditFieldTitle title="住所録名変更" />
        <FieldEditBox
          label=""
          field="name"
          rec={settings}
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
                checked={getCurrABColor() === col}
                onClick={handleSetColor}
              />
            </Grid>
          ))}
        </Grid>
        {/* --------------------------------- */}
        <EditFieldTitle title="住所録アイコンの変更" />
        <Grid container sx={{ width: cbareaWidth }} columns={8}>
          {Object.keys(iconlist).map((key) => (
            <Grid item xs={1}>
              <ColorBox
                width={cxBox}
                height={cyBox}
                color="transparent"
                abicon={key}
                selected={getCurrABIcon() === key}
                icon_sx={{ color: getCurrABColor() }}
                onClick={handleSetIcon}
              />
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
    </Dialog>
  );
};
export default ABSettings;
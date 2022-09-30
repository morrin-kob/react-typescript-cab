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

type ABSettingDialogPropsType = {
  abook: ContentsPropsType;
  user: UserContextType;
};

type ABSettingDialogStateType = {
  open: boolean;
  abname: string;
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
export default class ABSettings extends React.Component<
  ABSettingDialogPropsType,
  ABSettingDialogStateType
> {
  onSave: (abook: ContentsPropsType) => void;
  constructor(props: ABSettingDialogPropsType) {
    super(props);
    //    this.user = useContext(UserContext);
    this.state = {
      open: false,
      abname: props.abook.name,
      abook: { ...props.abook }
    };
  }

  handleOpen = (
    abook: ContentsPropsType,
    onChange: (abook: ContentsPropsType) => void
  ) => {
    this.onSave = onChange;
    this.setState({ open: true, abname: abook.name, abook: abook });
  };

  handleClose = () => {
    this.setState({ ...this.state, open: false });
  };
  handleSave = () => {
    this.onSave(this.state.abook);
    this.setState({ ...this.state, open: false });
  };

  onChangeField = (field: string, value: string) => {
    let newVal = { ...this.state.abook };
    newVal[field] = value;
    this.setState({ ...this.state, abook: newVal });
  };

  colorlist: string[] = [
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

  getCurrABColor = () => {
    return this.state && this.state.abook.color
      ? this.state.abook.color.toLowerCase()
      : this.colorlist[0];
  };

  handleSetColor = (col: string) => {
    if (this.getCurrABColor() !== col) {
      this.onChangeField("color", col);
    }
  };

  getCurrABIcon = () => {
    return this.state && this.state.abook.icon ? this.state.abook.icon : "book";
  };
  handleSetIcon = (icon: string) => {
    if (this.getCurrABIcon() !== icon) {
      this.onChangeField("icon", icon);
    }
  };

  render() {
    const buttons: DlgButtonProps[] = [
      { caption: "保存", color: "success", onclick: this.handleSave },
      { caption: "閉じる", color: "primary", onclick: this.handleClose }
    ];

    let cont = <></>;

    let cxDlg: string = isMobile ? "calc( 100vw )" : "calc( 80vw )";

    let cxBox = 36;
    let cyBox = 36;
    let cbareaWidth = cxBox * 8;

    return (
      <Dialog open={this.state.open} onClose={this.handleClose}>
        <DialogTitle sx={{ width: cxDlg, minWidth: "20em", maxWidth: 600 }}>
          住所録の設定 - {this.state.abname}
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
        <DialogContent>
          {cont}
          <EditFieldTitle title="住所録名変更" />
          <FieldEditBox
            label=""
            field="name"
            rec={this.state.abook}
            onChangeField={this.onChangeField}
          />
          {/* --------------------------------- */}
          <EditFieldTitle title="住所録カラー変更" />
          <Grid container sx={{ width: cbareaWidth }} columns={8}>
            {this.colorlist.map((col) => (
              <Grid item xs={1}>
                <ColorBox
                  width={cxBox}
                  height={cyBox}
                  color={col}
                  checked={this.getCurrABColor() === col}
                  onClick={this.handleSetColor}
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
                  selected={this.getCurrABIcon() === key}
                  icon_sx={{ color: this.getCurrABColor() }}
                  onClick={this.handleSetIcon}
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
              value={this.state.abook.use}
              name="radio-buttons-group"
              onChange={(e) => {
                this.onChangeField("use", e.target.value);
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
  }
}

import * as React from "react";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import TextField from "@mui/material/TextField";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import ja from "date-fns/locale/ja";

import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import { SxProps, useTheme } from "@mui/material/styles";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import type {} from "@mui/x-date-pickers/themeAugmentation";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { Typography } from "@mui/material";
import { ABIcon } from "../Views/ABIcons";

export const EditFieldTitle = (props: { title: string }) => {
  return (
    <h5 style={{ marginBottom: "2ex", marginTop: "2ex" }}>{props.title}</h5>
  );
};

type SIBProps = {
  id: string;
  variant?: "text" | "outlined" | "contained" | undefined;
  color?:
    | "inherit"
    | "primary"
    | "secondary"
    | "success"
    | "error"
    | "info"
    | "warning"
    | undefined;
  bgcolor?: string;
  paddingY?: string | number;
  borderWidth?: string | number;
  onClick?: (id: string) => void;
  children: React.ReactNode;
};
//
// スクエアアイコンボタン
// IconButton は四角くならないっぽい
// Button は色々指定しないと真四角にならない
//
export const SquareIconButton = (props: SIBProps) => {
  let sxdata: SxProps = {
    minWidth: 0,
    mt: 1,
    px: 1,
    py: "6px",
    borderWidth: "1px 1px 2px 1px",
    fontSize: "small"
  };
  if (props.bgcolor) sxdata["backgroundColor"] = props.bgcolor;
  if (props.paddingY) sxdata.py = props.paddingY;
  if (props.borderWidth) sxdata.borderWidth = props.borderWidth;

  return (
    <Button
      color={props.color}
      variant={props.variant}
      sx={sxdata}
      onClick={() => {
        if (props.onClick) props.onClick(props.id);
      }}
    >
      {props.children}
    </Button>
  );
};

type FieldEditProps = {
  label: string;
  field: string;
  rec: {};
  onChangeField: (field: string, value: string | null) => void;
};
interface FieldComboProps extends FieldEditProps {
  options: { label?: string; data: string }[];
  editable: boolean;
  fieldOnEdit?: string;
}

export const ReformField = (rec: {}, field: string) => {
  let rp = {
    rec: rec,
    field: field
  };
  if (rp.field.match(".")) {
    //console.log(`ReformField:field=${rp.field}`);
    let inners = rp.field.split(/\]\.|\.|\[/);
    rp.field = inners.pop() || "";
    inners.forEach((name) => {
      if (name in rp.rec === false || rp.rec[name] === null) {
        rp.rec[name] = {};
      }
      rp.rec = rp.rec[name];
    });
  }
  return rp;
};

export const FieldEditBox = (props: FieldEditProps) => {
  let rp = ReformField(props.rec, props.field);

  return (
    <Paper sx={{ width: "100%", mt: 1, mb: 0 }}>
      <TextField
        variant="outlined"
        sx={{ width: "100%", mt: -0.26 }}
        size="small"
        placeholder={props.label}
        value={rp.field in rp.rec ? rp.rec[rp.field] : ""}
        onChange={(e) => props.onChangeField(props.field, e.target.value)}
      />
    </Paper>
  );
};

export const FieldTextArea = (props: FieldEditProps) => {
  let rp = ReformField(props.rec, props.field);
  return (
    <Paper sx={{ width: "100%", mt: 1, mb: 0 }}>
      <TextField
        variant="outlined"
        sx={{ width: "100%", mt: -0.24 }}
        multiline
        rows={3}
        placeholder={props.label}
        value={rp.rec[rp.field]}
        onChange={(e) => props.onChangeField(props.field, e.target.value)}
      />
    </Paper>
  );
};

export const FieldComboBox = (props: FieldComboProps) => {
  let rp = ReformField(props.rec, props.field);
  let erp = ReformField(props.rec, props.fieldOnEdit || props.field);
  const ddWidth = props.editable ? "36px" : "100%";
  const style = props.editable
    ? { border: "solid silver", borderWidth: "1px 1px 2px 1px" }
    : {};
  let editText = "";
  if (props.editable) {
    if (props.fieldOnEdit && rp.rec[rp.field] === null) {
      editText = erp.rec[erp.field];
    } else {
      const datas = props.options.map((el) => el.data);
      let index = datas.indexOf(rp.rec[rp.field]);
      if (index >= 0) {
        editText = props.options[index].label || "";
      } else {
        editText = erp.rec[erp.field];
      }
    }
  }
  return (
    <Paper
      variant="outlined"
      sx={{ width: "100%", mt: 1, mb: 0 }}
      style={style}
    >
      {props.editable && (
        <InputBase
          size="small"
          sx={{ pl: 1, width: `calc( 100% - ${ddWidth} )`, mt: -0.24 }}
          placeholder={props.label}
          value={editText}
          onChange={(e) => {
            let field = props.fieldOnEdit || props.field;
            let value = e.target.value;
            const labels = props.options.map((el) => el.label);
            let index = labels.indexOf(value);
            if (index >= 0) {
              field = props.field;
              value = props.options[index].data;
            } else if (props.fieldOnEdit) {
              props.onChangeField(props.field, null);
            }
            props.onChangeField(field, value);
          }}
        />
      )}
      <Select
        variant="outlined"
        sx={{ width: ddWidth, mt: -0.24 }}
        size="small"
        value={props.editable ? "" : rp.rec[rp.field]}
        onChange={(e) => props.onChangeField(props.field, e.target.value)}
        displayEmpty
      >
        <MenuItem value="">&nbsp;</MenuItem>
        {props.options.map((option) => (
          <MenuItem value={option.data}>{option.label || option.data}</MenuItem>
        ))}
      </Select>
    </Paper>
  );
};
// sx={{ width: "100%", mt: 1, mb: 0, backgroundColor: "white" }}
// size="small"

export const FieldDatePicker = (props: FieldEditProps) => {
  let rp = ReformField(props.rec, props.field);

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
              value={rp.rec[rp.field]}
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

// ----- カラーボックス
type colboxProps = {
  width: number;
  height: number;
  color: string;
  checked?: boolean;
  selected?: boolean;
  abicon?: string;
  icon_sx?: any;
  onClick: (color: string) => void;
};
export const ColorBox = (props: colboxProps) => {
  let fontsize = props.width < props.height ? props.width : props.height;
  fontsize = parseInt("" + fontsize * 0.7, 10);
  let sx = {
    width: props.width,
    height: props.height,
    backgroundColor: `#${props.color}`,
    "&:hover": {
      borderStyle: "solid",
      borderColor: "silver",
      borderWidth: 1,
      opacity: [0.9, 0.8, 0.7]
    }
  };
  if (props.selected) {
    sx["borderStyle"] = "solid";
    sx["borderColor"] = "black";
    sx["borderWidth"] = 1;
  }
  let iconsx = {};
  if (props.icon_sx) {
    iconsx = { ...props.icon_sx };
  }

  return (
    <Box
      onClick={(e) => props.onClick(props.abicon ? props.abicon : props.color)}
      sx={sx}
    >
      <div
        style={{
          color: "white",
          textAlign: "center",
          verticalAlign: "middle",
          alignItems: "center",
          fontSize: fontsize
        }}
      >
        {props.checked && <>✔</>}
        {props.abicon && <ABIcon name={props.abicon} sx={iconsx} />}
      </div>
    </Box>
  );
};

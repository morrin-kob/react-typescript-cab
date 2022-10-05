import * as React from "react";
import { RefObject } from "react";
import { reformResponse } from "../AppSettings";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import Input from "@mui/material/Input";
import OutlinedInput from "@mui/material/OutlinedInput";
import FilledInput from "@mui/material/FilledInput";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import IconButton from "@mui/material/IconButton";
import Autocomplete from "@mui/material/Autocomplete";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Switch from "@mui/material/Switch";
import Grid from "@mui/material/Grid";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
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
import ClearIcon from "@mui/icons-material/Clear";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { ABIcon } from "../Views/ABIcons";
import FileOpenIcon from "@mui/icons-material/FileOpen";
import { Typography } from "@mui/material";

export const EditFieldTitle = (props: { title: string }) => {
  return (
    <>
      {/* <h5 style={{ marginBottom: "2ex", marginTop: "2ex" }}>{props.title}</h5> */}
      <h5 style={{ margin: "2ex 1pt" }}>{props.title}</h5>
      {/* <Typography variant="h5" sx={{my:2}} >{props.title}</Typography> */}
      {/* <Typography component="h5" sx={{my:2}} >{props.title}</Typography> */}
    </>
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
  sx?: SxProps;
  onClick?: (id: string) => void;
  disabled?: boolean;
  size?: "small" | "medium" | "large";
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
    borderColor: "silver",
    borderWidth: "1px 1px 2px 1px",
    fontSize: "small"
  };

  if (props.size) {
    if (props.size === "small") {
      sxdata.px = 0.2;
      sxdata.py = "2px";
    } else if (props.size === "large") {
      sxdata.px = 1.5;
      sxdata.py = "8px";
    }
  }
  if (props.sx) {
    sxdata = { ...sxdata, ...props.sx };
  }

  return (
    <Button
      color={props.color || "inherit"}
      variant={props.variant}
      disabled={props.disabled}
      sx={sxdata}
      onClick={() => {
        if (props.onClick) props.onClick(props.id);
      }}
    >
      {props.children}
    </Button>
  );
};

type EditPropsBase = {
  data: object | string | string[] | number | number[];
  id: string; // data[id]
  name?: string; // for form
  size?: "small" | "medium"; // default: small
  placeholder?: string; // if none and label -> set label
  label?: string; // control title
  variant?: "outlined" | "filled" | "standard"; // default:outlined
  sx?: SxProps;
  onChange: (id: string, value: string | string[] | null, event?: any) => void;
};

interface FieldEditProps extends EditPropsBase {
  type?:
    | "email"
    | "file"
    | "hidden"
    | "month"
    | "number"
    | "password"
    | "search"
    | "tel"
    | "time"
    | "url"
    | "week"
    | "text"
    | undefined; // -> text
  inputProps?: {};
  autoFocus?: boolean;
}

export const ReformField = (
  data: object | string | string[] | number | number[],
  field: string
) => {
  let rp = {
    data: {},
    field: field
  };

  if (typeof data !== "object") {
    rp.data = { [field]: data };
  } else {
    rp.data = data;

    let inners = rp.field.split(/\]\.|\.|\[/);
    if (inners.length > 1) {
      rp.field = inners.pop() || "";

      inners.forEach((name, index) => {
        let next = index === inners.length - 1 ? rp.field : inners[index + 1];

        if (name in rp.data === false || rp.data[name] === null) {
          if (next.search(/[^0-9]/) !== -1) {
            rp.data[name] = {};
          } else {
            rp.data[name] = [];
          }
        }
        rp.data = rp.data[name];
      });
    }
  }
  return rp;
};

const devideSx = (sxProps: {}, sxOuter: {}, sxInner: {}) => {
  Object.keys(sxProps).forEach((key) => {
    if (
      key.search(/^m[xytblr]{0,1}$/) !== -1 ||
      key.search(/^(?:backgroundColor)$/) !== -1
    ) {
      if (sxOuter && sxProps) sxOuter[key] = sxProps[key];
    } else {
      if (sxInner && sxProps) sxInner[key] = sxProps[key];
    }
  });
};

export const FieldEditBox = (props: FieldEditProps) => {
  const [values, setValues] = React.useState({
    amount: "",
    password: "",
    showPassword: false
  });

  let rp = ReformField(props.data, props.id);

  const type = props.type || "text";
  const variant = props.variant || "outlined";

  let attr = {};
  if (props.inputProps) attr = { ...props.inputProps };

  let sxinner: SxProps = { width: "100%" };
  if (variant === "standard") {
    sxinner = { ...sxinner, pt: 0.8, pb: 0.2, px: 1 };
  }

  let sxouter: SxProps = { width: "100%", mt: 1 };

  let filename = "";
  if (type === "file") {
    sxinner["display"] = "none";
    if (rp.data[rp.field]) {
      filename = rp.data[rp.field].split(/[/\\]/).pop() || "";
    }
    if (props.sx) {
      sxouter = { ...sxouter, ...props.sx };
    }
  } else if (props.sx) {
    devideSx(props.sx, sxouter, sxinner);
  }

  const handleClickShowPassword = () => {
    setValues({
      ...values,
      showPassword: !values.showPassword
    });
  };
  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  let controlId = props.id;
  let inputadorment = <></>;
  if (type === "password") {
    inputadorment = (
      <InputAdornment position="end">
        <IconButton
          size={props.size || "small"}
          onClick={handleClickShowPassword}
          onMouseDown={handleMouseDownPassword}
          edge="end"
        >
          {values.showPassword ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      </InputAdornment>
    );
  }
  const ctrl = {
    type:
      type === "password"
        ? variant === "outlined"
          ? OutlinedInput
          : variant === "filled"
          ? FilledInput
          : Input
        : TextField
  };

  const inplabelsize =
    props.size && props.size !== "small" ? "normal" : "small";

  let fcsx = { width: "100%" };
  if (type === "password" && variant === "standard") {
    fcsx = { ...fcsx, m: 1, width: `${97 / 100}` };
  }

  return (
    <>
      {type === "file" && (
        <Paper
          variant="outlined"
          elevation={0}
          sx={sxouter}
          onClick={() => {
            // useRef 作戦失敗により getElementById()作戦に切り替えた
            let elm = document.getElementById(controlId);
            if (elm) elm.click();
            // if( fileOpenRef.current ){
            //   fileOpenRef.current.click();
            // }
          }}
        >
          <Button variant="contained" color="info" sx={{ mr: 1 }}>
            <FileOpenIcon />
          </Button>
          <Typography
            component="span"
            variant="subtitle1"
            sx={{ pl: 1, color: "gray" }}
          >
            {filename || "ファイルを選択"}
          </Typography>
        </Paper>
      )}
      <Paper elevation={0} sx={sxouter}>
        <FormControl sx={fcsx} variant={variant}>
          {type === "password" && props.label && (
            <InputLabel size={inplabelsize} htmlFor={controlId} sx={{ ml: -1 }}>
              {props.label}
            </InputLabel>
          )}
          <ctrl.type
            autoFocus={props.autoFocus || false}
            type={values.showPassword ? "text" : type}
            id={controlId}
            name={props.name || controlId}
            inputProps={attr}
            sx={sxinner}
            style={{ marginTop: !props.label ? "-2px" : "" }}
            size={props.size || "small"}
            placeholder={props.placeholder || props.label}
            label={props.label}
            variant={variant}
            value={
              type !== "file" && rp.field in rp.data ? rp.data[rp.field] : ""
            }
            onChange={(e) => props.onChange(props.id, e.target.value, e)}
            endAdornment={inputadorment}
          />
        </FormControl>
      </Paper>
    </>
  );
};

interface FieldTextareaProps extends EditPropsBase {
  rows?: number; // default:3
  inputProps?: {};
  flexHeight?: boolean; // default: true
  maxRows?: number; // default:10
}
const minRows = 3;
export const FieldTextArea = (props: FieldTextareaProps) => {
  const [cyLine, setCyLine] = React.useState(0);
  const [rows, setRows] = React.useState(props.rows || minRows);
  const maxRows = props.maxRows || 10;

  let rp = ReformField(props.data, props.id);

  let ctrlId = props.id;

  let sxouter: SxProps = { width: "100%", mt: 1 };
  let sxinner: SxProps = { width: "100%", mt: props.label ? 0 : -0.24 };
  if (props.sx) {
    devideSx(props.sx, sxouter, sxinner);
  }
  const variant = props.variant || "outlined";
  const flexHeight = props.flexHeight !== undefined ? props.flexHeight : true;

  let tid_prpr = -1;
  let tid_calc = -1;

  const countLines = (text: string) => {
    if (tid_prpr > -1) return;
    if (tid_calc > -1) {
      window.clearTimeout(tid_calc);
      tid_calc = -1;
    }

    let edit = document.getElementById(ctrlId);
    if (edit) {
      const cx = edit.clientWidth; //edit.style.width;
      const cid = "ta_check_height_lc";
      let elm = document.getElementById(cid);
      if (!elm) {
        elm = document.createElement("div");
        elm.id = cid;
        document.body.appendChild(elm);
        elm.style.height = `auto`;
        elm.style.overflowWrap = "break-word";
        elm.style.wordBreak = "break-all";
        elm.style.lineHeight = `${window
          .getComputedStyle(edit)
          .getPropertyValue("line-height")}px`; //edit.style.lineHeight;
        elm.style.fontSize = `${window
          .getComputedStyle(edit)
          .getPropertyValue("font-size")}px`; //edit.style.fontSize;
        elm.innerHTML = "あ";
        tid_prpr = window.setTimeout(() => {
          if (elm) {
            elm.style.display = "block";
            setCyLine(elm.clientHeight);
            elm.style.display = "none";
            tid_prpr = -1;
          }
        }, 200);
      }
      if (cyLine) {
        elm.style.width = `${cx}px`;
        elm.innerHTML = text.replace(/\r\n|\r|\n/g, "<br/>");
        tid_calc = window.setTimeout(() => {
          tid_calc = -1;
          if (elm) {
            elm.style.display = "block";
            let lines = parseInt(
              `${(elm.clientHeight + (cyLine - 1)) / cyLine}`,
              10
            );
            if (lines < minRows) lines = minRows;
            if (lines > maxRows) lines = maxRows;
            if (rows !== lines) setRows(lines);
            elm.style.display = "none";
          }
        }, 300);
      }
    }
  };

  return (
    <Paper elevation={0} sx={sxouter}>
      <TextField
        id={ctrlId}
        variant={variant}
        sx={sxinner}
        multiline
        rows={rows}
        placeholder={props.placeholder || props.label}
        label={props.label}
        value={rp.data[rp.field]}
        onChange={(e) => {
          props.onChange(props.id, e.target.value, e);
          if (flexHeight) countLines(e.target.value);
        }}
      />
    </Paper>
  );
};

export type CBOptionType = {
  label?: string;
  value: string;
};
interface FieldComboProps extends EditPropsBase {
  options: CBOptionType[];
  editable: boolean;
  enableEmpty?: boolean;
  fieldOnEdit?: string;
  backAroundColor?: string;
}

const acimputcb = (
  props: FieldComboProps,
  options: CBOptionType[],
  event: React.SyntheticEvent<Element, Event>,
  newValue: string
) => {
  let field = props.fieldOnEdit || props.id;
  let value = newValue || ""; //event.target.value;
  const opvalues = options.map((el) => el.value);
  let index = opvalues.indexOf(value);
  if (index >= 0) {
    field = props.id;
    value = options[index].value;
  } else if (props.fieldOnEdit) {
    props.onChange(props.id, null, event);
  }
  props.onChange(field, value, event);
};

export const FieldComboBox = (props: FieldComboProps) => {
  let rp = ReformField(props.data, props.id);
  let erp = ReformField(props.data, props.fieldOnEdit || props.id);
  let bac = props.backAroundColor ? props.backAroundColor : "white";
  const style = props.editable
    ? { borderStyle: "solid", borderColor: bac, borderWidth: "2px 0px 0px 0px" }
    : {};
  let editText = "";

  let options: CBOptionType[] = [];
  props.options.forEach((el) => {
    options.push({ label: el.label || el.value, value: el.value });
  });

  if (props.editable) {
    if (props.fieldOnEdit && rp.data[rp.field] === null) {
      editText = erp.data[erp.field];
    } else {
      const opvalues = options.map((el) => el.value);
      let index = opvalues.indexOf(rp.data[rp.field]);
      if (index >= 0) {
        editText = options[index].label || "";
      } else {
        editText = erp.data[erp.field];
      }
    }
  }

  let sxouter: SxProps = { width: "100%", mt: 1 };
  let sxinner: SxProps = { width: "100%", mt: props.label ? 0 : -0.24 };
  if (props.sx) {
    if (props.editable) delete sxinner.mt;

    devideSx(props.sx, sxouter, sxinner);
  }

  const variant = props.variant || "outlined";
  if (variant === "standard") {
    sxinner = props.editable
      ? { ...sxinner, pt: 0.8, pb: 0.2, px: 1 }
      : { ...sxinner, pt: props.label ? 0 : 1 };
  }
  const inplabelsize =
    props.size && props.size !== "small" ? "normal" : "small";

  return (
    <Paper elevation={0} sx={sxouter} style={style}>
      {props.editable ? (
        <Autocomplete
          noOptionsText={"..."}
          style={{ marginTop: !props.label ? "-4px" : "" }}
          size={props.size || "small"}
          clearIcon={<ClearIcon fontSize="small" />}
          componentsProps={{
            clearIndicator: { sx: { width: "0.9em", height: "0.9em" } },
            popupIndicator: { sx: { width: "0.9em", height: "0.9em" } }
          }}
          options={options}
          getOptionLabel={(option) => option.label || ""}
          isOptionEqualToValue={(option, value) => {
            return option.label === value.label;
          }}
          value={{ label: editText, value: rp.data[rp.field] }}
          inputValue={editText}
          onChange={(event, newValue) => {
            acimputcb(
              props,
              options,
              event,
              newValue ? newValue["value"] || "" : ""
            );
          }}
          onInputChange={(event, newInputValue) => {
            if (newInputValue) {
              acimputcb(props, options, event, newInputValue);
            }
          }}
          id={`combo_${props.id}`}
          renderInput={(params) => (
            <TextField
              {...params}
              label={props.label}
              placeholder={props.placeholder || props.label}
              variant={variant}
              sx={sxinner}
              // margin="none"
            />
          )}
        />
      ) : (
        <FormControl variant={variant} sx={sxinner}>
          {props.label && (
            <InputLabel size={inplabelsize} id={props.id} variant={variant}>
              {props.label}
            </InputLabel>
          )}
          <Select
            id={props.id}
            labelId={props.id}
            sx={{ width: "100%", mt: !props.label ? -0.24 : 0 }}
            size={props.size || "small"}
            placeholder={props.placeholder || props.label}
            label={props.label}
            value={props.editable ? "" : rp.data[rp.field]}
            onChange={(e) => props.onChange(props.id, e.target.value, e)}
          >
            {!props.enableEmpty && <MenuItem value="">&nbsp;</MenuItem>}
            {props.options.map((option) => (
              <MenuItem value={option.value}>
                {option.label || option.value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </Paper>
  );
};

interface CheckboxGroupProps extends EditPropsBase {
  options: CBOptionType[];
  type?: "Checkbox" | "Switch" | undefined; // default:checkbox
  check_size?: "small" | "medium" | undefined; // default:medium
  lplacement?: "start" | "top" | "bottom" | "end"; // default:end
  color?:
    | "primary"
    | "secondary"
    | "success"
    | "error"
    | "info"
    | "warning"
    | "default"
    | undefined; // default:primary
  label_sx?: SxProps;
  check_sx?: SxProps;
}

export const FieldCheckboxGroup = (props: CheckboxGroupProps) => {
  let rp = ReformField(props.data, props.id);

  let curr = {};
  if (rp.data[rp.field]) {
    rp.data[rp.field].split(/,/).forEach((val: string) => {
      curr[val] = true;
    });
  }

  const handleCheck = (value: string, checked: boolean) => {
    curr[value] = checked;
    let values = "";
    Object.keys(curr).forEach((val) => {
      if (curr[val]) {
        if (values) values += ",";
        values += val;
      }
    });
    props.onChange(props.id, values);
  };

  let sxouter: SxProps = { width: "100%", p: 0, mt: 1, mb: 0 };
  if (props.sx) {
    sxouter = { ...sxouter, ...props.sx };
  }

  let type = props.type || "Checkbox";
  const ctrl = { type: type === "Checkbox" ? Checkbox : Switch };
  let lplacement = props.lplacement || "end";
  let elv = props.label ? 1 : 1;
  let check_sx: SxProps = {};
  if (type === "Checkbox") check_sx["px"] = 1;
  if (props.check_sx) check_sx = { ...check_sx, ...props.check_sx };

  return (
    <Paper elevation={elv} sx={sxouter}>
      {props.label && (
        <div
          style={{
            padding: "0 0 4pt 3pt",
            color: "var(--col-explain)",
            fontSize: "90%"
          }}
        >
          {props.label}
        </div>
      )}
      <Grid container>
        {props.options.map((option) => {
          let control = (
            <ctrl.type
              sx={check_sx}
              size={props.check_size || "medium"}
              color={props.color || "primary"}
              checked={curr[option.value]}
              onChange={(event, checked) => {
                handleCheck(option.value, checked);
              }}
            />
          );

          return (
            <Grid item sx={{ flexGrow: 1 }}>
              <FormControlLabel
                sx={props.label_sx}
                label={option.label}
                control={control}
                labelPlacement={lplacement}
              />
            </Grid>
          );
        })}
      </Grid>
    </Paper>
  );
};

interface RadioButtonGroupProps extends EditPropsBase {
  options: CBOptionType[];
  default_val: string;
  lplacement?: "start" | "top" | "bottom" | "end"; // default:end
  color?:
    | "primary"
    | "secondary"
    | "success"
    | "error"
    | "info"
    | "warning"
    | "default"
    | undefined; // default:primary
  sx?: SxProps;
  label_sx?: SxProps;
  radio_sx?: SxProps;
}

export const FieldRadioButtonsGroup = (props: RadioButtonGroupProps) => {
  let rp = ReformField(props.data, props.id);

  let curr = rp.data[rp.field];

  const handleCheck = (value: string) => {
    props.onChange(props.id, value);
  };

  let sxouter: SxProps = { width: "100%", py: 0, px: 2, mt: 1, mb: 0 };
  if (props.sx) {
    sxouter = { ...sxouter, ...props.sx };
  }

  let lplacement = props.lplacement || "end";
  let elv = props.label ? 1 : 1;
  let radio_sx: SxProps = { px: 1 };
  if (props.radio_sx) radio_sx = { ...radio_sx, ...props.radio_sx };

  let control = (
    <Radio
      sx={radio_sx}
      size={props.size || "small"}
      color={props.color || "primary"}
    />
  );
  return (
    <Paper elevation={elv} sx={sxouter}>
      {props.label && (
        <div
          style={{
            padding: "0 0 4pt 0",
            color: "var(--col-explain)",
            fontSize: "90%"
          }}
        >
          {props.label}
        </div>
      )}
      <RadioGroup
        defaultValue={curr || props.default_val || ""}
        name={props.name || ""}
        onChange={(event, value) => {
          handleCheck(value);
        }}
      >
        <Grid container>
          {props.options.map((option) => {
            return (
              <Grid item sx={{ flexGrow: 1 }}>
                <FormControlLabel
                  value={option.value}
                  control={control}
                  label={option.label}
                  sx={props.label_sx}
                  labelPlacement={lplacement}
                />
              </Grid>
            );
          })}
        </Grid>
      </RadioGroup>
    </Paper>
  );
};

interface DatePickerProps extends EditPropsBase {
  inputFormat?: string;
  backAroundColor?: string;
}

export const FieldDatePicker = (props: DatePickerProps) => {
  let rp = ReformField(props.data, props.id);

  let bac = props.backAroundColor ? props.backAroundColor : "#f8f8f8";

  let sxouter: SxProps = {
    width: "100%",
    p: 0,
    mt: props.label ? 0 : 0.5,
    borderStyle: "solid",
    borderColor: bac,
    borderWidth: props.label ? "0" : "2px 0px 0px 0px"
  };
  if (props.sx) sxouter = { ...sxouter, ...props.sx };

  let inpformat = props.inputFormat || "yyyy年MM月dd日";
  let mask = inpformat.replace(/([yY]{2-4})|([mMdD]{1-2})/, "_");

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
      <Paper elevation={0} sx={sxouter}>
        <div style={{ marginTop: props.label ? "0" : "-2px" }}>
          <MobileDatePicker
            className="datepicker"
            leftArrowButtonText="前月"
            rightArrowButtonText="翌月"
            label={props.label}
            inputFormat={inpformat}
            mask={mask}
            toolbarFormat="yyyy年MM月"
            value={rp.data[rp.field]}
            onChange={(newValue: Date | null) =>
              props.onChange(props.id, `${newValue || ""}`)
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label={props.label}
                placeholder={props.placeholder || props.label}
                variant="outlined"
                size="small"
              />
            )}
          />
        </div>
      </Paper>
    </LocalizationProvider>
  );
};

// ----- カラーボックス
type colboxProps = {
  id: string;
  width: number;
  height: number;
  color: string;
  checked?: boolean;
  selected?: boolean;
  onClick: (id: string) => void;
  children: React.ReactNode;
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

  return (
    <Box onClick={(e) => props.onClick(props.id)} sx={sx}>
      <div
        style={{
          color: "white",
          textAlign: "center",
          verticalAlign: "middle",
          alignItems: "center",
          fontSize: fontsize
        }}
      >
        {props.children}
      </div>
    </Box>
  );
};

interface TagSetterProps extends EditPropsBase {
  options: string[];
  backAroundColor?: string;
}

export const TagSetter = (props: TagSetterProps) => {
  let rp = ReformField(props.data, props.id);

  let currVal = rp.data[rp.field];

  let options = props.options;
  // if ((!options || options.length === 0) && currVal.length) {
  //   if (Array.isArray(currVal)) options = currVal;
  //   else options = currVal.split(/,/);
  // }
  // options = ["なんだ", "かんだ", "どーした", "こーした"];
  let bac = props.backAroundColor ? props.backAroundColor : "white";

  let sxouter = {
    width: "100%",
    my: props.label ? 1 : 1.1,
    p: 0,
    borderStyle: "solid",
    borderColor: bac,
    borderWidth: props.label ? "0" : "2px 0px 0px 0px"
  };
  let sxinner = {};
  const variant = props.variant || "outlined";
  if (variant === "standard") {
    sxinner = { ...sxinner, pt: 1 };
  }
  if (props.sx) {
    devideSx(props.sx, sxouter, sxinner);
  }

  return (
    <Paper elevation={0} sx={sxouter}>
      <Autocomplete
        style={{ marginTop: !props.label ? "-4px" : "0" }}
        multiple
        id={props.id}
        options={options}
        getOptionLabel={(option) => option}
        noOptionsText={"..."}
        defaultValue={currVal}
        onChange={(event, newValue) => {
          props.onChange(props.id, newValue, event);
        }}
        onInputChange={(event, newInputValue, reason) => {
          if (newInputValue) {
          }
        }}
        freeSolo={true}
        forcePopupIcon={true}
        size="small"
        //componentsProps={{clearIndicator:{sx:{width:"0.9em",height:"0.9em"}}}}
        filterSelectedOptions
        renderInput={(params) => (
          <TextField
            {...params}
            label={props.label}
            placeholder={props.placeholder || props.label}
            variant={variant}
            sx={sxinner}
          />
        )}
      />
    </Paper>
  );
};

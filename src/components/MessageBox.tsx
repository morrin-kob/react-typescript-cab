// MessageBox
import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import { SvgIcon } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import HelpIcon from "@mui/icons-material/Help";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";

type OptionsType = {
  text: string;
  icon?: typeof SvgIcon;
  handler: () => void;
};
export type MessageBoxProps = {
  caption: string;
  message: string;
  icon?:
    | typeof SvgIcon
    | "information"
    | "question"
    | "caution"
    | "warning"
    | "error";
  options?: OptionsType[];
  onCancel?: () => void;
};

type IconInfoType = {
  icon: typeof SvgIcon;
  color: string;
};

const MessageBox = (props: MessageBoxProps) => {
  const [open, setOpen] = React.useState(true);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    if (props.onCancel) props.onCancel();
  };

  let buttons: OptionsType[] = [];
  if (props.options) {
    props.options.map((option) => {
      buttons.push(option);
      return true;
    });
  } else {
    buttons.push({
      text: " OK ",
      handler: () => {
        setOpen(false);
      }
    });
  }

  const sxIcon = 22;
  let iconInfo: IconInfoType = {
    icon: InfoIcon,
    color: "var(--frmcol-dialog)"
  };
  if (props.icon) {
    if (typeof props.icon === "string") {
      if (props.icon === "information") {
        iconInfo.icon = InfoIcon;
      } else if (props.icon === "question") {
        iconInfo.icon = HelpIcon;
      } else if (props.icon === "caution") {
        iconInfo.icon = WarningIcon;
        iconInfo.color = "gold";
      } else if (props.icon === "warning") {
        iconInfo.icon = WarningIcon;
        iconInfo.color = "red";
      } else if (props.icon === "error") {
        iconInfo.icon = ErrorIcon;
        iconInfo.color = "red";
      }
    } else if (typeof props.icon === typeof SvgIcon) {
      iconInfo.icon = props.icon;
    }
  }

  return (
    <Dialog open={open}>
      <DialogTitle
        sx={{ my: 0, height: "2.5em", backgroundColor: "var(--frmcol-dialog)" }}
      >
        {props.caption}
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
      <DialogContent sx={{ mt: 2 }}>
        <Grid container>
          <Grid item sx={{ width: { sxIcon }, pr: 1 }}>
            <iconInfo.icon sx={{ color: iconInfo.color }} />
          </Grid>
          <Grid item sx={{ flexGrow: 1 }}>
            <DialogContentText>{props.message}</DialogContentText>
          </Grid>
        </Grid>
      </DialogContent>
      <Divider />
      <DialogActions>
        {buttons.map((button) => {
          return (
            <Button
              color="primary"
              variant="contained"
              onClick={button.handler}
            >
              {button.icon && <button.icon sx={{ color: "white" }} />}
              {button.text}
            </Button>
          );
        })}
      </DialogActions>
    </Dialog>
  );
};

export default MessageBox;

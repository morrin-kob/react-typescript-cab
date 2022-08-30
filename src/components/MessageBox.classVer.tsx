import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import { SvgIcon } from "@mui/material";

type MessageBoxProps = {
  ref?: object;
};
type OptionsType = {
  text: string;
  handler: () => void;
};

type MessageBoxState = {
  open: boolean;
  caption: string;
  message: string;
  icon?: string | typeof SvgIcon;
  options?: OptionsType[];
};

class MessageBox extends React.Component<MessageBoxProps, MessageBoxState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      open: false,
      message: "",
      caption: ""
    };
  }

  open = (
    caption: string,
    message: string,
    icon?: string | typeof SvgIcon,
    options?: OptionsType[]
  ) => {
    this.setState({
      ...this.state,
      caption: caption,
      message: message,
      icon: icon,
      options: options,
      open: true
    });
  };

  handleClickOpen = () => {
    this.setState({ open: true });
  };
  handleClose = () => {
    this.setState({ open: false });
  };

  render() {
    let buttons: OptionsType[] = [];
    if (this.state.options) {
      this.state.options.map((option) => {
        buttons.push(option);
        return true;
      });
    } else {
      buttons.push({
        text: " OK ",
        handler: () => {
          this.setState({ ...this.state, open: false });
        }
      });
    }

    return (
      <Dialog open={this.state.open}>
        <DialogTitle
          sx={{ my: 0, height: "2.5em", backgroundColor: "#3060a0" }}
        >
          {this.state.caption}
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
        <DialogContent sx={{ mt: 2 }}>
          <DialogContentText>{this.state.message}</DialogContentText>
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
                {button.text}
              </Button>
            );
          })}
        </DialogActions>
      </Dialog>
    );
  }
}

export default MessageBox;

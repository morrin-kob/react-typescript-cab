import * as React from "react";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import Slide from "@mui/material/Slide";
import Fade from "@mui/material/Fade";
/*
import Button from '@mui/material/Button';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
*/

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide children={undefined} direction="up" ref={ref} {...props} />;
  //  return <Slide direction="up" ref={ref} {...props} />;
});

function getPubUrl() {
  let url = window.location.protocol + "//";
  url += window.location.hostname;
  return url;
}

let imgs = getPubUrl() + "/images/";

type ImageItem = {
  img: string;
  title: string;
  author: string;
};

type ImageViewerState = {
  open?: boolean;
  item?: ImageItem;
};

class ImageViewer extends React.Component<{}, ImageViewerState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      open: false,
      item: { img: "", title: "", author: "" }
    };
  }

  handleClickOpen = () => {
    this.setState({ open: true });
  };
  handleClose = () => {
    this.setState({ open: false });
  };

  render() {
    const item: ImageItem = this.state.item;
    return (
      <Dialog
        fullScreen
        open={this.state.open}
        onClose={this.handleClose}
        //TransitionComponent={Transition}
      >
        <AppBar sx={{ position: "relative" }}>
          <Toolbar>
            <Typography
              sx={{ ml: 2, flex: 1, fontFamily: "serif" }}
              variant="h6"
              component="div"
            >
              {item.author}
            </Typography>
            <Typography
              sx={{ ml: 2, flex: 1, fontFamily: "serif" }}
              variant="h6"
              component="div"
            >
              {item.title}
            </Typography>
            <IconButton
              edge="start"
              onClick={this.handleClose}
              aria-label="close"
            >
              <CloseIcon onClick={this.handleClose} />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Box sx={{ margin: 1 }} />
        <Fade in={true}>
          <img
            src={`${imgs}${item.img}?w=248&fit=crop&auto=format`}
            srcSet={`${imgs}${item.img}?w=248&fit=crop&auto=format&dpr=2 2x`}
            alt={item.title}
            loading="lazy"
          />
        </Fade>
      </Dialog>
    );
  }
}

export default ImageViewer;

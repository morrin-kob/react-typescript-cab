// MessageBox
import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import LinearProgress from "@mui/material/LinearProgress";
import CircularProgress from "@mui/material/CircularProgress";

export type ProgressProps = {
  open: boolean;
  type: "circle" | "line";
  text?: string;
};

const PopupProgress = (props: ProgressProps) => {
  const [open, setOpen] = React.useState(true);

  if (props.open !== open) {
    setOpen(props.open);
  }

  let progress =
    props.type === "circle" ? (
      <CircularProgress />
    ) : props.type === "line" ? (
      <LinearProgress />
    ) : (
      <CircularProgress />
    );

  return (
    <Dialog open={open}>
      <DialogContent sx={{ mt: 2 }}>
        {progress}
        {props.text && (
          <div style={{ textAlign: "center", color: "gray" }}>{props.text}</div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PopupProgress;

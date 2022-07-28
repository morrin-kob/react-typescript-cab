import * as React from "react";
import Box from "@mui/material/Box";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { SvgIcon } from "@mui/material";

export type PulldownMenuItem = {
  icon?: typeof SvgIcon;
  text: string;
  handler: () => void;
};
export type PulldownMenuProps = {
  popupId: string;
  text?: string;
  tipText?: string;
  bgcolor?: string; // primary,secondary,success... or #??????
  icon?: typeof SvgIcon;
  iconColor?: string;
  //items: { text: string; handler: () => void }[]
  //items: Array<{ text: string; handler: () => void }>
  items: Array<PulldownMenuItem>;
};

export default function PulldownMenu(props: PulldownMenuProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  let color_prop:
    | "inherit"
    | "primary"
    | "secondary"
    | "success"
    | "error"
    | "info"
    | "warning"
    | undefined = undefined;
  let color_sx: string = "";

  if (props.bgcolor) {
    if (
      props.bgcolor === "inherit" ||
      props.bgcolor === "primary" ||
      props.bgcolor === "secondary" ||
      props.bgcolor === "success" ||
      props.bgcolor === "error" ||
      props.bgcolor === "info" ||
      props.bgcolor === "warning"
    ) {
      color_prop = props.bgcolor;
    } else {
      color_sx = props.bgcolor;
    }
  }

  let iconSx = {};
  if (props.iconColor) {
    iconSx["color"] = props.iconColor;
    iconSx["backgroundColor"] = "whilte";
  }

  let icon = props.icon ? (
    <IconButton
      sx={{
        marginRight: 1,
        backgroundColor: "white",
        width: "19px",
        height: "19px"
      }}
    >
      <props.icon sx={iconSx} />
    </IconButton>
  ) : (
    <></>
  );

  return (
    <React.Fragment>
      <Box sx={{ display: "flex", alignItems: "center", textAlign: "center" }}>
        <Tooltip title={props.tipText}>
          {props.text ? (
            <Button
              variant="contained"
              color={color_prop}
              sx={{ backgroundColor: color_sx }}
              onClick={handleClick}
              aria-controls={open ? props.popupId : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
            >
              {icon}
              {props.text}
            </Button>
          ) : (
            <IconButton
              onClick={handleClick}
              size="small"
              color={color_prop}
              sx={{ ml: 1 }}
              aria-controls={open ? props.popupId : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
            >
              {props.icon && <props.icon />}
            </IconButton>
          )}
        </Tooltip>
      </Box>
      <Menu
        anchorEl={anchorEl}
        id={props.popupId}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 1.5,
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1
            },
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0
            }
          }
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {props.items.map((value, index) => {
          return !value.icon && !value.text ? (
            <Divider />
          ) : (
            <MenuItem
              key={index}
              onClick={(e) => {
                handleClick(e);
                value.handler();
              }}
            >
              {value.icon && <value.icon sx={{ mr: 1 }} />}
              {value.text}
            </MenuItem>
          );
        })}
      </Menu>
    </React.Fragment>
  );
}

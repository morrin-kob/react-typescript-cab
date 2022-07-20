import * as React from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import AccountCircle from "@mui/icons-material/AccountCircle";

/*
props:
text=<枠なしきっかけボタンのテキスト>
items=[
    {   text:<menu item テキスト>,
        handler: onClick時のハンドラ
    }
]
*/
type PulldownMenuItem = {
  text: string;
  handler: () => void;
};
export type PulldownMenuProps = {
  account: boolean;
  text: string;
  //items: { text: string; handler: () => void }[]
  //items: Array<{ text: string; handler: () => void }>
  items: Array<PulldownMenuItem>;
};
export default function PulldownMenu(props: PulldownMenuProps) {
  return (
    <PopupState variant="popover" popupId="demo-popup-menu">
      {(popupState) => (
        <React.Fragment>
          <Button variant="contained" {...bindTrigger(popupState)}>
            {props.account && <AccountCircle />}
            {props.text}
          </Button>
          <Menu {...bindMenu(popupState)}>
            {props.items.map((value, index) => {
              return (
                <MenuItem
                  key={index}
                  onClick={() => {
                    popupState.close();
                    value.handler();
                  }}
                >
                  {value.text}
                </MenuItem>
              );
            })}
          </Menu>
        </React.Fragment>
      )}
    </PopupState>
  );
}

import * as React from "react";
import Paper from "@mui/material/Paper";
import { linkType } from "../components/AppHeader";
import { Typography } from "@mui/material";

type FooterType = {
  text: string;
  links?: linkType[];
};
export default function AppFooter(props: FooterType) {
  return (
    <Paper
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        py: 0.6,
        backgroundColor: "#f0f0f0"
      }}
      elevation={3}
    >
      <Typography sx={{ fontSize: "80%", color: "gray" }}>
        {props.text}
      </Typography>
    </Paper>
  );
}

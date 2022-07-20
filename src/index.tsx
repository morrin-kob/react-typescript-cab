import React from "react";
import ReactDOM from "react-dom";
import "./App.css";
import { RouterConfig } from "./RouterConfig";

ReactDOM.render(
  <React.StrictMode>
    <RouterConfig />
  </React.StrictMode>,
  document.getElementById("root")
);
/*
import React from "react";
import ReactDOM from "react-dom";
import "./App.css";
import App from "./App";
import { BrowserRouter as Router } from "react-router-dom";

function AppMain() {
  return (
    <React.StrictMode>
      <Router>
        <App />
      </Router>
    </React.StrictMode>
  );
}
ReactDOM.render(<AppMain />, document.querySelector("#app"));
*/
/*

import React from "react";
import ReactDOM from "react-dom";
import Button from "@mui/material/Button";

function App() {
  return (
    <Button variant="contained" color="primary">
      Hello World
    </Button>
  );
}

ReactDOM.render(<App />, document.querySelector("#app"));
*/

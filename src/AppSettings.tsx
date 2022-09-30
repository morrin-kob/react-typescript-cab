// グローバル変数および定数
// こんな風な管理はReact上OKなのか？
//

import { SvgIcon } from "@mui/material";
import { DOMElement } from "react";

const AppVal = {
  AppTitle: "なんちゃってFCAB",
  SubTitle: "anytime, anywhere",
  AppVersion: 0.01,

  Header: {
    pageTitle: () => {
      return AppVal.AppTitle;
    },
    subTitle: () => {
      return AppVal.SubTitle;
    }
  },
  Footer: {
    copyright: () => {
      let date = new Date();
      let year = date.getFullYear();
      return `Copyright(c) ${year} Morrin Corp`;
    }
  }
};

const reformText = (text: string) => {
  return text
    .replace(/(<br>|<br \/>)/gi, "\n")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");
};

const ID_homeAddress = "_home";
const getHomeAddressID = () => {
  return ID_homeAddress;
};
const isHomeAddress = (bookId: string) => {
  return bookId === ID_homeAddress;
};

type ContentsPropsType = {
  filter?: string;
  tags?: string;
  id: string;
  name: string;
  use?: "private" | "corp";
  color?: string;
  icon?: string;
  command?: "newrec" | "import" | "export" | "share" | "delete";
  editing?: string; // record-id
};

function reformResponse(resp: any) {
  //resp.setEncoding("utf8");
  const data = {};

  if (typeof resp === "string") {
    data["message"] = resp;
  } else {
    for (let key of Object.keys(resp)) {
      let type = typeof resp[key];
      if (
        type === "number" ||
        type === "string" ||
        type === "boolean" ||
        (type === "object" && key === "data")
      ) {
        data[key] = resp[key];
      } else {
        //console.log("*" + key + "*:type:" + type);
      }
    }
  }

  let scInMessage = "400";
  if (data["message"]) {
    let mr = data["message"].match(/status code (\d+)/);
    if (mr) scInMessage = mr[1];
  }
  let statusCode = data["status"] || data["statusCode"] || scInMessage;
  if (parseInt(statusCode, 10) >= 400) {
    data["error"] =
      data["statusMessage"] ||
      data["statusText"] ||
      data["message"] ||
      `Error: something is wrong(${JSON.stringify(data)})`;
  }
  data["statusCode"] = statusCode;
  return data;
}

const reformParams = (method: string, params: {}, headers: {}, data: {}) => {
  let paramlist = "";

  if (params) {
    for (const key of Object.keys(params)) {
      if (key === "atk") {
        headers["X-atk"] = params[key];
      } else if (key === "ept") {
        headers["X-ept"] = params[key];
      } else if (key === "If-Match") {
        headers["If-Match"] = params[key];
      } else {
        if (method !== "GET" && key !== "uag") {
          data[key] = params[key];
        } else {
          if (paramlist.length) paramlist += "&";
          paramlist += `${key}=${params[key]}`;
        }
      }
    }
  }
  return paramlist;
};

const httpFetch = (
  url: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  params: {},
  postdata: {},
  callbackfunc: (data: {}) => void,
  headers: {} = {}
) => {
  //  let headers = {};
  if (method !== "GET" && "Content-Type" in headers === false) {
    headers["Content-Type"] = "application/json";
  }

  let paramlist = reformParams(method, params, headers, postdata);

  if (paramlist.length) {
    url += `?${paramlist}`;
  }

  let senddata = undefined;

  if (method !== "GET") {
    senddata = JSON.stringify(postdata);
  }

  fetch(url, {
    method: method,
    mode: "cors",
    headers: headers,
    body: senddata
  })
    .then((res) => {
      return res.json();
    })
    .then((json) => {
      callbackfunc(json);
    })
    .catch((e) => {
      if (typeof e === "string") {
        callbackfunc({ error: e });
      } else {
        callbackfunc(reformResponse(e));
      }
    });
};

//
// Promise返しの fetch のラップ関数
//
const fetchGet = async (endpoint: string, params: {}, headers: {} = {}) => {
  let url = endpoint;
  let paramlist = reformParams("GET", params, headers, {});
  if (paramlist.length) {
    url += `?${paramlist}`;
  }

  const response = await fetch(url, {
    method: "GET",
    mode: "cors",
    headers: headers
  });
  return response.json();
};

export {
  AppVal,
  httpFetch,
  fetchGet,
  reformText,
  reformResponse,
  ContentsPropsType,
  getHomeAddressID,
  isHomeAddress
};

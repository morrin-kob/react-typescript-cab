// グローバル変数および定数
// こんな風な管理はReact上OKなのか？
//
import { SvgIcon } from "@mui/material";

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
  use: "private" | "corp";
  color?: string;
  icon?: string;
  editing?: string; // record-id
};

function reformResponse(resp: {}) {
  //resp.setEncoding("utf8");
  const data = {};
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

  let scInMessage = "400";
  if (data["message"]) {
    if (data["message"].match(/status code (\d+)/)) {
      scInMessage = RegExp.$1;
    }
  }
  let statusCode = data["status"] || data["statusCode"] || scInMessage;
  if (parseInt(statusCode, 10) >= 400) {
    data["error"] =
      data["statusMessage"] ||
      data["statusText"] ||
      data["message"] ||
      `Error: something is wrong(${JSON.stringify(resp)})`;
  }
  data["statusCode"] = statusCode;
  return data;
}

//
// 非同期処理
//
const ajaxGet = (
  endpoint: string,
  params: Object,
  callbackfunc: (data: {}) => void
) => {
  let url = endpoint;
  let paramlist = "";
  let headers = {};
  if (params) {
    for (const key of Object.keys(params)) {
      if (key === "atk") {
        headers["X-atk"] = params[key];
      } else if (key === "ept") {
        headers["X-ept"] = params[key];
      } else {
        if (paramlist.length) paramlist += "&";
        paramlist += key + "=";
        paramlist += params[key];
      }
    }
    if (paramlist.length) {
      url += `?${paramlist}`;
    }
  }

  fetch(url, {
    method: "GET",
    mode: "cors",
    headers: headers
  })
    .then((res) => {
      return res.json();
    })
    .then((json) => {
      callbackfunc(json);
    })
    .catch((e) => {
      if (!e) {
        callbackfunc({
          status: "error",
          error: "fail to fetch. don't know why"
        });
      } else if (typeof e === "string") {
        callbackfunc({ status: "error", error: e });
      } else {
        callbackfunc(reformResponse(e));
      }
    });
};

const ajaxPost = (
  url: string,
  params: {},
  callbackfunc: (data: {}) => void,
  method: "POST" | "PUT" | "DELETE" = "POST"
) => {
  let headers = {
    "Content-Type": "application/json"
  };
  let data = {};
  if (params) {
    for (const key of Object.keys(params)) {
      if (key === "atk") {
        headers["X-atk"] = params[key];
      } else if (key === "ept") {
        headers["X-ept"] = params[key];
      } else {
        data[key] = params[key];
      }
    }
  }

  const sendData = JSON.stringify(data);
  console.log(`post: ${url}\ndata:${sendData}\nmethod:${method}`);
  fetch(url, {
    method: method,
    //  mode: "cors",
    headers: headers,
    body: sendData
  })
    .then((res) => {
      return res.json();
    })
    .then((json) => {
      callbackfunc(json);
    })
    .catch((e) => {
      console.log(`catch:e:${typeof e}`);
      if (typeof e === "string") {
        callbackfunc({ error: e });
      } else {
        callbackfunc(reformResponse(e));
      }
    });
};

export {
  AppVal,
  ajaxGet,
  ajaxPost,
  reformText,
  ContentsPropsType,
  getHomeAddressID,
  isHomeAddress
};

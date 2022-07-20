// グローバル変数および定数
// こんな風な管理はReact上は多分間違ってるのでは？
//
const AppVal = {
  AppTitle: "Practice for React",
  SubTitle: "something like that",
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

type ContentsPropsType = {
  filter?: string;
  tags?: string;
  id: string;
  name: string;
};

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
    if (paramlist) url += "?" + paramlist;
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
      if (typeof e === "string") {
        callbackfunc({ error: e });
      } else {
        callbackfunc(e);
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
        callbackfunc(e);
      }
    });
};

export { AppVal, ajaxGet, ajaxPost, reformText, ContentsPropsType };

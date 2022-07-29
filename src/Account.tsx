/* ---------------------------------------------
ログインユーザー情報を管理するクラスを作りたかった
ま、ついでにログイン・ログアウト処理もここに入れようかと。

当初、class で始めたが、どうも按配よろしくなく、
結局、context を使うことにした。

context は、1つの値を使う場合に比べ、複数の値を持つと
めちゃめちゃ段取りが大変になる。

下記、なんとか落ち着いた。
外側で使う場合は、
    const user = useContext(UserContext);
    として、 user.isLoggedIn() や user.getUserName() といった按配で使える
    return 文の中のvalue={} の中身が公開されているメソッド
    ここにstate値を入れれば値を直接参照できるようになる　が、変更はできない。（しちゃいけない）

さらに、
Typescript で書き換えた。
エラーは出なくなったがちゃんと動くか分からん
 -----------------------------------------------*/
import * as React from "react";
import { useState, createContext } from "react";
import { ajaxGet, ajaxPost } from "./AppSettings";

type ABInfoType = {
  code: string | null;
  access_token: string | null;
  id_token: string | null;
  refresh_token: string | null;
};

type UserData = {
  isLoggedIn: boolean;
  isLoggInable: boolean;
  userId: number;
  userName: string;
  email: string;
  a_token: string;
  id_token: string;
  r_token: string;

  uag?: string;
  ept?: string;
  eps?: string;
  epm?: string;
  cid?: string;
  cse?: string;
  csr?: string;
};

export type UserContextType = {
  //user: UserData | null;
  //setValues: (user: UserData) => void;
  isUserLoggedIn: () => boolean;
  isUserLoggInable: () => boolean;
  SetUserLoggInable: (mode: boolean) => boolean;
  getUserId: () => number;
  getUserName: () => string;
  getUserEmail: () => string;
  getAToken: () => string;
  getIDToken: () => string;
  getRToken: () => string;
  getCid: () => string;
  getCse: () => string;
  getCsr: () => string;
  getUag: () => string;
  getEpt: () => string;
  getEps: () => string;
  getEpm: () => string;
  setABInfo: (info: ABInfoType) => void;
  Login: (
    email: string,
    password: string,
    uag: string,
    scd: string,
    ept: string,
    eps: string,
    epm: string,
    cid: string,
    cse: string,
    csr: string,
    cbf: (result: { login: boolean; errtxt?: string }) => void
  ) => boolean;
  Logoff: () => void;
  RefreshToken: (
    result: (res: {
      a_token: string;
      id_token: string;
      r_token: string;
    }) => void
  ) => void;
  RefreshAndRetry: (
    url: string,
    method: string,
    params: {},
    callbackfunc: (data: {}) => void
  ) => void;
};

export const UserContext = createContext<UserContextType>({
  //user: null,
  //setValues: (user: UserData) => {},
  isUserLoggedIn: () => {
    return false;
  },
  isUserLoggInable: () => {
    return true;
  },
  SetUserLoggInable: (mode: boolean) => {
    return true;
  },
  getUserId: () => {
    return 0;
  },
  getUserName: () => {
    return "";
  },
  getUserEmail: () => {
    return "";
  },
  getAToken: () => {
    return "";
  },
  getIDToken: () => {
    return "";
  },
  getRToken: () => {
    return "";
  },
  getCid: () => {
    return "";
  },
  getCse: () => {
    return "";
  },
  getCsr: () => {
    return "";
  },
  getUag: () => {
    return "";
  },
  getEpt: () => {
    return "";
  },
  getEps: () => {
    return "";
  },
  getEpm: () => {
    return "";
  },

  setABInfo: (info: ABInfoType) => {},
  Login: (
    email: string,
    password: string,
    uag: string,
    scd: string,
    ept: string,
    eps: string,
    epm: string,
    cid: string,
    cse: string,
    csr: string,
    cbf: (result: { login: boolean; errtxt?: string }) => void
  ) => {
    return false;
  },
  Logoff: () => {},
  RefreshToken: (
    result: (res: {
      a_token: string;
      id_token: string;
      r_token: string;
    }) => void
  ) => {},
  RefreshAndRetry: (
    url: string,
    method: "GET" | "POST" | "PUT" | "DELETE",
    params: {},
    callbackfunc: (data: {}) => void
  ) => {}
});

export const UserContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  let curr = JSON.parse(
    localStorage.getItem("user") || '{"userId":0,"userName":"","email":""}'
  );
  let values: UserData = {
    isLoggedIn: curr.userId !== undefined && curr.userId !== 0,
    isLoggInable: true,
    userId: curr.userId || 0,
    userName: curr.userName || "",
    email: curr.email || "",
    a_token: curr.a_token || "",
    id_token: curr.id_token || "",
    r_token: curr.r_token || "",
    uag: curr.uag || "",
    ept: curr.ept || "",
    eps: curr.eps || "",
    epm: curr.epm || "",
    cid: curr.cid || "",
    cse: curr.cse || "",
    csr: curr.csr || ""
  };
  console.log(`user-data: ${JSON.stringify(values)}`);

  const [user, setValues] = useState<UserData>(values);

  const isUserLoggedIn = () => {
    if (!user || !user.isLoggInable) return false;
    return user.isLoggedIn;
  };
  const isUserLoggInable = () => {
    return user ? user.isLoggInable : false;
  };
  const SetUserLoggInable = (mode: boolean) => {
    if (user) user.isLoggInable = mode;
    return isUserLoggInable();
  };
  const getUserId = () => {
    return user ? user.userId : 0;
  };
  const getUserName = () => {
    return user ? user.userName : "";
  };
  const getUserEmail = () => {
    return user ? user.email : "";
  };
  const getAToken = () => {
    return user && isUserLoggedIn() ? user.a_token : "";
  };
  const getIDToken = () => {
    return user && isUserLoggedIn() ? user.id_token : "";
  };
  const getRToken = () => {
    return user && isUserLoggedIn() ? user.r_token : "";
  };
  const getCid = () => {
    return user ? user.cid || "" : "";
  };
  const getCse = () => {
    return user ? user.cse || "" : "";
  };
  const getCsr = () => {
    return user ? user.csr || "" : "";
  };
  const getUag = () => {
    return user ? user.uag || "" : "";
  };
  const getEpt = () => {
    return user ? user.ept || "" : "";
  };
  const getEps = () => {
    return user ? user.eps || "" : "";
  };
  const getEpm = () => {
    return user ? user.epm || "" : "";
  };

  const setABInfo = (info: ABInfoType) => {
    let newvalues: UserData = { ...user };
    if (info.access_token) newvalues.a_token = info.access_token;
    if (info.id_token) newvalues.id_token = info.id_token;
    if (info.refresh_token) newvalues.r_token = info.refresh_token;
    setValues(newvalues);
    localStorage.setItem("user", JSON.stringify(values));
  };

  const Login = (
    email: string,
    password: string,
    uag: string,
    scd: string,
    ept: string,
    eps: string,
    epm: string,
    cid: string,
    cse: string,
    csr: string,
    cbf: (result: { login: boolean; errtxt?: string }) => void
  ) => {
    if (!user || !user.isLoggInable) return false;
    if (!user.isLoggedIn) {
      ajaxPost(
        ept + "/token",
        {
          uag: uag,
          ept: eps,
          scd: scd,
          cid: cid,
          csr: csr
        },
        (resp) => {
          //console.log(`resp:${JSON.stringify(resp)}`);
          if ("data" in resp) {
            const data = resp["data"];

            // ナンヤカンヤ

            let params = {
              atk: data.access_token,
              ept: eps,
              uag: uag
            };
            ajaxGet(`ept/homeaddresses/list`, params, (json) => {
              let userName = email;
              if (json && "data" in json) {
                userName = json["data"][0]["lastname"];
                if (userName) userName += " ";
                userName += json["data"][0]["firstname"];
                if (!userName) {
                  try {
                    userName = json["data"][0]["emails"][0]["address"];
                  } catch (e) {
                    userName = email;
                  }
                }
              }

              // 本来はサーバーと認証のやりとりがあって、その結果としてユーザー情報がセットされる
              let userdata = {
                ...user,
                userName: userName,
                userId: 1,
                email: email,
                isLoggedIn: true,
                a_token: data.access_token,
                id_token: data.id_token,
                r_token: data.refresh_token,
                uag: uag,
                ept: ept,
                eps: eps,
                epm: epm,
                cid: cid,
                cse: cse,
                csr: csr
              };
              setValues(userdata);
              localStorage.setItem("user", JSON.stringify(userdata));
              cbf({ login: true, errtxt: "" });
            });
          } else {
            let userdata = {
              ...user,
              userName: "",
              userId: 0,
              email: email,
              isLoggedIn: false,
              a_token: "",
              id_token: "",
              r_token: "",
              uag: uag,
              ept: ept,
              eps: eps,
              epm: epm,
              cid: cid,
              cse: cse,
              csr: csr
            };
            setValues(userdata);
            localStorage.setItem("user", JSON.stringify(userdata));
            cbf({ login: false, errtxt: resp["error"] });
            return false;
          }
        }
      );
    }
    return true;
  };

  const Logoff = () => {
    if (isUserLoggedIn()) {
      // ナンヤカンヤ
      setValues({ ...user, userId: 0, isLoggedIn: false });
      localStorage.setItem("user", "");
    }
  };

  const RefreshToken = (
    result: (res: {
      a_token: string;
      id_token: string;
      r_token: string;
    }) => void
  ) => {
    ajaxPost(
      getEpt() + "/token",
      {
        uag: getUag(),
        ept: getEps(),
        rtk: getRToken(),
        cid: getCid(),
        csr: getCsr()
      },
      (resp) => {
        console.log(`resp:${JSON.stringify(resp)}`);
        if ("data" in resp) {
          const data = resp["data"];

          let userdata: UserData = {
            ...user,
            a_token: data.access_token,
            id_token: data.id_token,
            r_token: data.refresh_token
          };
          setValues(userdata);
          localStorage.setItem("user", JSON.stringify(userdata));

          let resdata = {
            a_token: data.access_token,
            id_token: data.id_token,
            r_token: data.refresh_token
          };
          result(resdata);
        }
      }
    );
  };
  const RefreshAndRetry = (
    url: string,
    method: "GET" | "POST" | "PUT" | "DELETE",
    params: {},
    callbackfunc: (data: {}) => void
  ) => {
    RefreshToken((res) => {
      if (res && "a_token" in res) {
        params["atk"] = res.a_token;
        const func = method === "GET" ? ajaxGet : ajaxPost;
        func(url, params, (json: {}) => {
          callbackfunc(json);
        });
      } else {
        callbackfunc({ statusCode: 500, error: "something is wrong" });
      }
    });
  };

  return (
    <UserContext.Provider
      value={{
        isUserLoggedIn,
        isUserLoggInable,
        SetUserLoggInable,
        getUserId,
        getUserName,
        getUserEmail,
        getAToken,
        getIDToken,
        getRToken,
        getCid,
        getCse,
        getCsr,
        getUag,
        getEpt,
        getEps,
        getEpm,
        setABInfo,
        Login,
        Logoff,
        RefreshToken,
        RefreshAndRetry
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

//export default UserContextProvider;

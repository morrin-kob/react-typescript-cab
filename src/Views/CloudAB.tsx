import React, {
  useContext,
  useEffect,
  useMemo,
  ReactNode,
  Children,
  PropsWithChildren
} from "react";
import { UserContext, UserContextType } from "../Account";
import ABRecDialog, { RecordType, ReformName } from "./ABRecord";
import CheckableEditableTable, {
  CETColumnType
} from "../components/TableWithCheck";
import DialogContentText from "@mui/material/DialogContentText";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Checkbox from "@mui/material/Checkbox";
import DeleteIcon from "@mui/icons-material/Delete";

import {
  AppVal,
  ajaxGet,
  ajaxPost,
  reformText,
  ContentsPropsType
} from "../AppSettings";
import CircularProgress from "@mui/material/CircularProgress";
import LinearProgress from "@mui/material/LinearProgress";
import {
  DataGrid,
  GridRowsProp,
  GridColDef,
  GridCellParams,
  MuiEvent
} from "@mui/x-data-grid";
import { useRef } from "react";

type ABInfoType = {
  addressData: Array<{}>;
  abloading: boolean;
  currentabook: string;
};

let abinfo: ABInfoType = {
  addressData: null,
  abloading: false,
  currentabook: ""
};

function loadAddress(
  user: UserContextType,
  abook: ContentsPropsType,
  whenLoad: (data: {}) => void
) {
  // addresses/[group_id]/list
  let url = user.getEpt();
  if (abook.id === "homeaddresses") {
    url += "/homeaddresses/list";
  } else {
    url += `/addresses/${abook.id}/list`;
  }
  //console.log( 'ajaxGet( '+url+', {access_token: '+user.getAToken()+', groupid: '+abook['id']+'} )' );
  let params = {
    atk: user.getAToken(),
    ept: user.getEpm(),
    uag: user.getUag()
  };
  ajaxGet(url, params, (json) => {
    if ("data" in json) {
      whenLoad(json);
    } else {
      if (parseInt(json["statusCode"], 10) === 401) {
        console.log("loadAddress() RefreshToken!");
        user.RefreshAndRetry(url, "GET", params, whenLoad);
      } else {
        whenLoad(json);
      }
    }
  });
}

function get_liner_Progress() {
  return (
    <Box sx={{ width: "100%", mt: 20 }}>
      <LinearProgress />
    </Box>
  );
}

function CABAddressList(props: { abook: ContentsPropsType }) {
  const user = useContext(UserContext);
  const [loaded, setLoaded] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const recdlg = useRef(null);

  let cont = null;

  if (props.abook.id && props.abook.id.length) {
    if (abinfo.currentabook.length) {
      if (abinfo.currentabook !== props.abook.id) {
        abinfo.currentabook = props.abook.id;
        abinfo.addressData = null;
        abinfo.abloading = false;
      }
    }
    abinfo.currentabook = props.abook.id;
  }

  const handleRowSelection = (e: {}) => {
    alert(JSON.stringify(e));
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  if (abinfo.addressData == null) {
    if (abinfo.abloading === false) {
      if (!props.abook.id) {
        cont = (
          <Box sx={{ width: "100%", mt: 20 }}>
            <p>Choose Address-Book from the hamburger-menu.</p>
          </Box>
        );
      } else {
        abinfo.abloading = true;
        loadAddress(user, props.abook, (load) => {
          //console.log("loadAddress: " + JSON.stringify(load));
          if (load && "data" in load && Array.isArray(load["data"])) {
            abinfo.addressData = load["data"];
          } else {
          }
          //abinfo.abloading = false;
          setLoaded(!loaded);
        });
      }
    }
    if (abinfo.abloading) {
      cont = get_liner_Progress();
    } else if (!cont) {
      cont = (
        <Box sx={{ width: "100%", mt: 20 }}>
          <p>ロードエラーです</p>
        </Box>
      );
    }
  } else {
    const columns: CETColumnType[] = [
      // : GridColDef[]
      {
        id: "name",
        label: "氏名",
        minWidth: 60,
        maxWidth: 80
      },
      {
        id: "address",
        label: "住所",
        minWidth: 120
      },
      {
        id: "telephone",
        label: "電話番号",
        minWidth: 50,
        maxWidth: 100
      }
    ];

    /*
    let rows: GridRowsProp = [
      //: GridRowsProp
    ];
    */
    const rows: {
      [key: string]: any;
    }[] = [];

    let name = "";
    abinfo.addressData.map((rec: RecordType, index) => {
      name = ReformName(rec);

      let address = "";
      let tel = "";

      let org = rec.organization ? rec.organization.name || "" : "";
      if (rec.addresses && rec.addresses.length) {
        let fa = rec.addresses[0];
        //for( let index in rec.addresses ){
        for (let index = 0; index < rec.addresses.length; index++) {
          const adr = rec.addresses[index];
          if (
            (org.length && adr.kindof === "office") ||
            (org.length === 0 && adr.kindof === "home")
          ) {
            fa = rec.addresses[index];
            break;
          }
        }
        if (!fa["zipcode"]) fa["zipcode"] = "";
        if (!fa["street"]) fa["street"] = "";
        if (!fa["building"]) fa["building"] = "";
        address = `〒${fa.zipcode} ${fa.region}${fa.city}${fa.street} ${fa.building}`;
      }

      if (rec.telephones && rec.telephones.length) {
        let ft = rec.telephones[0];
        //for( let index in rec.telephones ){
        for (let index = 0; index < rec.telephones.length; index++) {
          const ti = rec.telephones[index];
          if (ti.number.length) {
            if (org.length) {
              if (ti.kindof === "offtel" || ti.kindof === "offcell") {
                ft = rec.telephones[index];
                break;
              }
            } else {
              if (ti.kindof === "cell" || ti.kindof === "tel") {
                ft = rec.telephones[index];
                break;
              }
            }
          }
        }
        try {
          tel = ft.number;
        } catch (e) {
          console.log(JSON.stringify(ft));
        }
      }
      rows.push({
        name: name,
        address: address,
        telephone: tel,
        id: rec["id"],
        index: index
      });

      return rec["id"];
    });

    cont = (
      <div style={{ height: "100%", width: "100%" }}>
        <CheckableEditableTable
          tableTitle=""
          columns={columns}
          rowHSize="medium"
          rowPerPageOptions={[25, 50, 100]}
          keyField="id"
          labelField="name"
          rows={rows}
          onEdit={(key: string) => {}}
          checkTarget={{
            icon: DeleteIcon,
            commandTip: "削除",
            onClick: (sels: readonly string[]) => {
              alert("削除");
            }
          }}
        />

        {/* <DataGrid
          rows={rows}
          columns={columns}
          checkboxSelection
          onCellClick={(
            params: GridCellParams,
            event: MuiEvent<React.MouseEvent>
          ) => {
            recdlg.current.setState({
              id: params.id,
              name: params.row.name,
              open: true
            });
            event.defaultMuiPrevented = true;
          }}
        /> */}
        <ABRecDialog user={user} abook={props.abook} ref={recdlg} />
      </div>
    );
  }

  return cont;
}

export type CABCtrlBarProps = {
  ref?: object;
  abook: ContentsPropsType;
  children: ReactNode;
};

// typescript 導入したら class 宣言がややこしくなった
class CABCtrlBar extends React.Component<CABCtrlBarProps, ContentsPropsType> {
  constructor(props: CABCtrlBarProps) {
    super(props);
    this.state = {
      //      filter: props.abook.filter || "",
      //      tags: props.abook.tags,
      id: props.abook.id,
      name: props.abook.name
    };
  }

  //static contextType = UserContext; ← typescript 導入前
  // ↓ typescript 導入後　　こんなん分かるかー！
  static contextType = UserContext;
  context!: React.ContextType<typeof UserContext>;

  setData(data: ContentsPropsType) {
    if ("tags" in data) {
      let tid = 0;
      if (tid) clearTimeout(tid);
      tid = setTimeout(() => {
        this.setState({ tags: data.tags });
        tid = 0;
      }, 1000);
    } else {
      this.setState({ id: data.id, name: data.name });
    }
  }

  render() {
    let controls = null;

    if (this.context.isUserLoggedIn() === false) {
      controls = <span className="explain">ログインしてください</span>;
    } else {
      controls = (() => {
        let abname = this.state.name || "choose address book";
        return (
          <>
            <h2>筆まめクラウド住所録 ― {abname}</h2>
          </>
        );
      })();
    }
    // 制御エリアで設定した値をコンテンツに反映できるように、
    // CABCtrlBarの下にコンテンツコンポーネントを起き、CABCtrlBarのrender()内で子供（コンテンツ）を
    // 按配するようにした　つまり、下記 div id="contents-inner" はここでしないと、親子関係を結んだ
    // 状態では外からはできないため
    // ※ 単に {children} だと変更したpropsが渡せないので、下記のように { React.Children.map(...)} のようにした
    const childrenWithProps = Children.map(this.props.children, (child) => {
      switch (typeof child) {
        case "string":
          return child;
        case "object":
          return React.cloneElement(
            child as React.ReactElement<ContentsPropsType>,
            {
              filter: this.state.filter,
              tags: this.state.tags,
              id: this.state.id,
              name: this.state.name
            }
          );
        default:
          return null;
      }
    });
    return (
      <>
        <div id="fixedtop">{controls}</div>
        <div id="contents-inner">{childrenWithProps}</div>
      </>
    );
    /*
          {Children.map(this.props.children, (child) => {
            if (React.isValidElement<ContentsPropsType>(child)) {
              let item: ReactElement<ContentsPropsType> = child;
              cloneElement<ContentsPropsType>(item, {
                filter: this.state.filter,
                tags: this.state.tags,
                id: this.state.id,
                name: this.state.name
              });
            }
          })}
    */
  }
}

function CABContents(props: ContentsPropsType) {
  const user = useContext(UserContext);

  function getContents() {
    let cont = null;
    if (user.isUserLoggedIn()) {
      cont = <CABAddressList abook={props} />;
    } else {
      cont = (
        <div className="App-header">
          <p>
            Hey! what are you doing?
            <br />
            Just sign in!
            <br />
            Come on! Rack'n'Roll!
          </p>
        </div>
      );
    }
    return cont;
  }

  return getContents();
}

export { CABContents, CABAddressList, CABCtrlBar };

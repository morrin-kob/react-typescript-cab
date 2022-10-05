import { DOMElement } from "react";
import { useContext } from "react";
import { UserContext, UserContextType } from "./Account";
import {
  RecordType,
  AddrBlock,
  OrganizationBlock,
  TelephoneBlock,
  FamilyBlock,
  ExtendPropsBlock,
  getFullName,
  getFullNameYomi,
  EmailBlock,
  WebUrlBlock
} from "./CABDataTypes";
import { reformResponse } from "./AppSettings";
import * as XLSX from "xlsx";

const ParseExcel = (
  user: UserContextType,
  excel: { fileObj: File; tableId?: string },
  parsed: (json: {}) => void
) => {
  const encodeCell = (
    base: { c: number; r: number },
    cofs: number,
    rofs: number
  ) => {
    let cell = { c: base.c + cofs, r: base.r + rofs };
    return XLSX.utils.encode_cell(cell);
  };
  const getCellData = (
    sheet: XLSX.WorkSheet,
    start: { c: number; r: number },
    cofs: number,
    rofs: number
  ) => {
    const cellidx = encodeCell(start, cofs, rofs);
    let fid = `[${cofs + 1}]`;
    const match = cellidx.match(/^([a-zA-Z]+)/);
    if (match) {
      fid = `[${match[1]}]`;
    }
    const cell = sheet[cellidx];
    return { id: fid, data: cell && cell.w ? cell.w : "" };
  };

  const sampling_max = 20;

  if (excel.fileObj) {
    excel.fileObj.arrayBuffer().then((buffer) => {
      try {
        const workbook = XLSX.read(buffer, { type: "buffer", bookVBA: true });
        if (!excel.tableId && workbook.SheetNames.length > 1) {
          let tables: {}[] = [];
          workbook.SheetNames.forEach((name) => {
            tables.push({ name: name, id: name });
          });
          parsed({ status: "gottablelist", tables: tables });
        } else {
          const sheetName = excel.tableId || workbook.SheetNames[0];
          if (sheetName) {
            const sheet = workbook.Sheets[sheetName];
            if (sheet) {
              let error = "";
              let fieldIDs: string[] = [];
              let titleinfo = {};
              let records: {}[] = [];
              let title_line = -1;
              let data_line = -1;

              const tcheck = /(?:^(?:氏名|姓名|名前|姓)$)|(?:.+名$)|name|first |last |〒|zipcode|住所|city|tel/i;

              const dcheck = /^[^\s]+\s[^\s]+$|^東京都|^.{2,3}県|.+郡|.+市|.+区|.+町|^[0-9\-()]+$|^[a-zA-Z0-9_\-+@.]+$/;

              const range_a1 = sheet["!ref"];
              const range = XLSX.utils.decode_range(range_a1 || "A1:A1");
              const columns = range.e.c - range.s.c + 1;
              const rows = range.e.r - range.s.r + 1;
              if (columns < 3) {
                error = "住所録データではありません";
              } else {
                for (let line = 0; line < rows; line++) {
                  let linedata: {} = {};
                  let maybeTitle = 0;
                  let maybeData = 0;
                  let empty = 0;
                  for (let col = 0; col < columns; col++) {
                    const c = getCellData(sheet, range.s, col, line);

                    if (c) {
                      if (c.data && title_line === -1) {
                        if (c.data.search(dcheck) !== -1) maybeData++;
                        if (c.data.search(tcheck) !== -1) maybeTitle++;
                      }
                      linedata[c.id] = c.data;
                      if (!c.data) empty++;
                    }
                  }
                  if (empty == columns) continue;

                  if (
                    title_line === -1 &&
                    maybeTitle > maybeData &&
                    maybeTitle > columns / 3
                  ) {
                    title_line = line;
                    fieldIDs.length = 0;
                    titleinfo = { ...linedata };
                    fieldIDs = [...Object.keys(titleinfo)];
                    records.length = 0;
                  } else {
                    if (data_line === -1 && maybeData) {
                      data_line = line;
                      if (title_line === -1) {
                        fieldIDs = [...Object.keys(linedata)];
                        fieldIDs.forEach((id) => {
                          titleinfo[id] = id;
                        });
                      }
                    }

                    if (data_line) {
                      records.push(linedata);
                    }
                  }
                }
              }

              if (!error && records.length === 0) {
                error = "レコードデータが見つかりません";
              }

              if (error) {
                parsed({ error: error });
              } else {
                let jsonData: { data: RecordType[] } = { data: [] };

                let postdata = {};
                // making information of titles

                postdata["data"] = [];
                for (const rec of records) {
                  postdata["data"].push(rec);
                  if (postdata["data"].length >= sampling_max) {
                    break;
                  }
                }
                postdata["titles"] = titleinfo;

                console.log(`--- fmatching ---\n${JSON.stringify(postdata)}`);

                let url = `${user.getEpt()}/fmatching`;
                user.FetchWithRefreshedRetry(
                  url,
                  "POST",
                  (resp) => {
                    // console.log(
                    //   `---after matching---\n${JSON.stringify(resp)}`
                    // );
                    if (resp["status"] !== "ok") {
                      parsed(resp);
                    } else {
                      let fattach = {};
                      if (resp["status"] === "ok") fattach = resp["data"];
                      const fids = Object.keys(titleinfo);
                      for (const fid of fids) {
                        if (fid in fattach === false) fattach[fid] = "";
                      }

                      records.unshift(titleinfo);
                      parsed({
                        fids: fieldIDs,
                        data: records,
                        attach: fattach
                      });
                    }
                  },
                  {
                    headers: {},
                    params: {},
                    postdata: postdata
                  }
                );
              }
            }
          }
        }
      } catch (e) {
        let error = "";
        if (typeof e === "string") {
          error = e;
        } else {
          error = e.message;
        }
        if (
          error.search(/password/i) !== -1 &&
          error.search(/protected/) !== -1
        ) {
          error =
            "このExcelファイルはパスワード保護されています\n" +
            "パスワードを削除した状態で保存してからやり直してください";
        }
        parsed({ error: error });
      }
    });
  }
};

export default ParseExcel;

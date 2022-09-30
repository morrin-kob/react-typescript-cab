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
import { parse, ParseResult } from "papaparse";

const ParseCSV = (
  user: UserContextType,
  textData: string,
  parsed: (json: {}) => void
) => {
  //const user = useContext(UserContext);
  const sampling_max = 20;
  // check the first line
  let match = textData.match(/^(.+)([\r\n]+)/);

  if (!match) {
    parsed({ error: "データがありません" });
    return;
  }
  //console.log(`${match[0]}`);

  let topline = match[1];
  let CR = match[2] || "";
  if (topline.search(/,/) === -1) {
    parsed({ error: "CSVデータではありません" });
    return;
  }

  let toplineistitles = true;
  if (
    topline.search(
      /(?:^|[",])氏名|姓名|名前|姓([",]|$)|名([",]|$)|name|first |last |〒|zipcode|住所|city|tel/i
    ) === -1
  ) {
    toplineistitles = false;
  } else {
    textData = textData.substr(topline.length + CR.length);
  }
  let titleline = "";
  let field = 1;
  let fieldIDs: string[] = [];
  let titleinfo: {} = {};
  while (true) {
    let dq = true;
    let match = topline.match(/^("(.+?)"(?:,|$))/);
    if (!match) {
      dq = false;
      match = topline.match(/^((.+?)(?:,|$))/);
    }
    if (match) {
      let fid = `[${("00" + field).slice(-2)}]`;
      if (titleline) titleline += ",";
      if (dq) titleline += '"';
      titleline += fid;
      if (dq) titleline += '"';
      if (toplineistitles) titleinfo[fid] = match[2];
      else titleinfo[fid] = "";
      fieldIDs.push(fid);

      field++;
      topline = topline.substr(match[1].length);
      if (!topline) break;
    } else break;
  }
  if (!CR) CR = "\r\n";

  titleline += CR;
  let reformed = titleline + textData;
  //console.log(`====reformed text====\n${reformed}`);

  parse(reformed, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    error: (error: {}) => {
      console.log(`error:\n${JSON.stringify(error)}`);
      parsed({ error: error["message"] || "読み込みに失敗しました" });
    },
    complete: (result: {}) => {
      //console.log(`----parsed-----\n${JSON.stringify(result)}`);

      let jsonData: { data: RecordType[] } = { data: [] };

      if (
        "data" in result === false ||
        ("errors" in result && result["errors"].length)
      ) {
        let errormess = result["errors"].join("\n");
        parsed({ error: errormess || "読み込みに失敗しました" });
      } else {
        let postdata = {};
        if (toplineistitles) {
          postdata["titles"] = titleinfo;
        }
        postdata["data"] = [];
        let recs = result["data"];
        for (const rec of recs) {
          postdata["data"].push(rec);
          if (postdata["data"].length >= sampling_max) {
            break;
          }
        }

        let url = `${user.getEpt()}/fmatching`;
        user.FetchWithRefreshedRetry(
          url,
          "POST",
          (resp) => {
            console.log(`---after matching---\n${JSON.stringify(resp)}`);
            if (resp["status"] !== "ok") {
              parsed(resp);
            } else {
              let fattach = {};
              if (resp["status"] === "ok") fattach = resp["data"];
              const fids = Object.keys(titleinfo);
              for (const fid of fids) {
                if (fid in fattach === false) fattach[fid] = "";
              }

              parsed({ fids: fieldIDs, data: result["data"], attach: fattach });
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
  });
};

export default ParseCSV;

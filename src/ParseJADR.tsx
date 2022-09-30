import { DOMElement } from "react";
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
import { recomposeColor } from "@mui/material";
import { forEachChild } from "typescript";

type JADRType = {
  I: string;
  NAPR: string;
  NAME: string;
  NAHO: string;
  SEXD: string;
  BLDT: string;
  BRTH: string;
  SCYC: string;
  HRSC: string;
  NAM2: string;
  NAH2: string;
  NAM3: string;
  NAH3: string;
  NAM4: string;
  NAH4: string;
  NAM5: string;
  NAH5: string;
  NAM6: string;
  NAH6: string;
  CTGR: string;
  ETDY: string;
  PZIP: string;
  PADR: string;
  PTEL: string;
  PFAX: string;
  PCPS: string;
  PAGR: string;
  MALI: string;
  OFPR: string;
  OFCE: string;
  SCTN: string;
  PSTN: string;
  OZIP: string;
  OADR: string;
  OTEL: string;
  OFAX: string;
  OCPS: string;
  PAG2: string;
  RMRK: string; //fm ex1
  RMR2: string; //fm ex2
  RMR3: string; //fm ex3
  RMR4: string; //fm ex4
  RMR5: string; //fm ex5
  RMR6: string; //fm pmemo
  RMR7: string; //fm cmemo
  EX00: string; //fm,fg maiden
  EX01: string; //fg web(p)
  EX02: string; //fm email(work)
  EX03: string; //fm dept2
  EX04: string; //fm web1
  EX05: string; //fm web2
  EX07: string; //fg dept2
  EX08: string; //fg web(work)
};

//
//
//
const ParseJADR = (jadrData: string, parsed: (json: {}) => void) => {
  let match = jadrData.match(/^(.+[\r\n]+)/);
  if (!match) {
    parsed({ error: "データがありません" });
    return;
  }
  jadrData = jadrData.substr(match[0].length);

  let cols = match[0].replace(/"|\r|\n/g, "").split(",");
  if (cols[0].toUpperCase() !== "JADR") {
    parsed({ error: `JADDRESS形式データではありません:${cols.join(",")}` });
    return;
  }

  const jadver = cols[1];
  let fmver = 0;
  if (cols[3].indexOf("筆まめ") >= 0) {
    let va = cols[3].match(/[.\s](\d+)/);
    if (va) fmver = parseInt(va[0], 10);
  }

  let fields = {};
  let idline: string[];
  let ftline: string[];
  let idlinetext = "";
  match = jadrData.match(/^(.+[\r\n]+)/);
  if (!match) {
    parsed({ error: "JADDRESS形式データではありません" });
    return;
  }
  jadrData = jadrData.substr(match[0].length);
  cols = match[0].replace(/"|\r|\n/g, "").split(",");
  if (cols[0].toUpperCase() === "T") ftline = cols;
  else {
    idline = cols;
    idlinetext = match[0];
  }

  match = jadrData.match(/^(.+[\r\n]+)/);
  if (!match) {
    parsed({ error: "JADDRESS形式データではありません" });
    return;
  }
  jadrData = jadrData.substr(match[0].length);
  cols = match[0].replace(/"|\r|\n/g, "").split(",");
  if (cols[0].toUpperCase() === "T") ftline = cols;
  else {
    idline = cols;
    idlinetext = match[0];
  }

  jadrData = idlinetext + jadrData;

  parse(jadrData, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    error: (error: {}) => {
      parsed({ error: error["message"] || "読み込みに失敗しました" });
    },
    complete: (result: {}) => {
      let jsonData: { data: RecordType[] } = { data: [] };

      if (
        "data" in result === false ||
        ("errors" in result && result["errors"].length)
      ) {
        let errormess = result["errors"].join("\n");
        parsed({ error: errormess || "読み込みに失敗しました" });
      } else {
        let jadr: JADRType[] = result["data"];

        for (let jrec of jadr) {
          if (jrec.I.toUpperCase() === "D") {
            let recdata: RecordType = { id: "" };

            if (jrec.NAME) {
              let na = jrec.NAME.split(/\s/);
              recdata.firstname = na.pop();
              if (na.length) recdata.lastname = na.join(" ");

              recdata.suffix = jrec.NAHO || "";
              recdata.birthdate = jrec.BRTH || "";

              if (jrec.SEXD) {
                recdata.gender =
                  jrec.SEXD.search(/不明|unknown|－/i) !== -1
                    ? ""
                    : jrec.SEXD.search(/女|♀|female|f/i) !== -1
                    ? "f"
                    : jrec.SEXD.search(/男|♂|male|m/i) !== -1
                    ? "m"
                    : "o";
              }

              if (jrec.NAPR) {
                let na = jrec.NAPR.split(/\s/);
                recdata.firstkana = na.pop();
                if (na.length) recdata.lastkana = na.join(" ");
              }
            }

            if (jrec.CTGR) {
              recdata["tags"] = jrec.CTGR.split(/,|;/);
            }

            if (jrec.PZIP || jrec.PADR) {
              let adr: AddrBlock = { kindof: "home" };
              recdata["addresses"] = [];
              adr.zipcode = jrec.PZIP;
              adr.street = jrec.PADR;
              recdata.addresses.push(adr);
            }
            if (jrec.PTEL || jrec.PFAX || jrec.PCPS) {
              recdata["telephones"] = [];
              let tel: TelephoneBlock = { number: "", kindof: "tel" };
              if (jrec.PTEL) {
                tel.number = jrec.PTEL;
                recdata.telephones.push({ ...tel });
              }
              if (jrec.PFAX) {
                tel.number = jrec.PFAX;
                tel.kindof = "fax";
                recdata.telephones.push({ ...tel });
              }
              if (jrec.PCPS) {
                tel.number = jrec.PCPS;
                tel.kindof = "cell";
                recdata.telephones.push({ ...tel });
              }
            }
            if (jrec.MALI) {
              recdata["emails"] = [];
              let emd: EmailBlock = { kindof: "home", address: jrec.MALI };
              recdata.emails.push(emd);
            }

            if (jrec.NAM2 || jrec.NAM3 || jrec.NAM4 || jrec.NAM5 || jrec.NAM6) {
              recdata["joint_names"] = [];

              const jnlist = [
                { nf: "NAM2", hf: "NAH2" },
                { nf: "NAM3", hf: "NAH3" },
                { nf: "NAM4", hf: "NAH4" },
                { nf: "NAM5", hf: "NAH5" },
                { nf: "NAM6", hf: "NAH6" }
              ];
              jnlist.forEach((jn) => {
                if (jrec[jn.nf]) {
                  let fd: FamilyBlock = {
                    firstname: "",
                    lastname: "",
                    firstkana: "",
                    lastkana: ""
                  };

                  let na = jrec[jn.nf].split(/\s/);
                  fd.firstname = na.pop();
                  if (na.length) fd.lastname = na.join(" ");
                  fd.suffix = jrec[jn.hf];

                  if (recdata.joint_names) recdata.joint_names.push(fd);
                }
              });
            }

            if (jrec.OFPR || jrec.OFCE || jrec.SCTN || jrec.PSTN) {
              let org: OrganizationBlock = { name: jrec.OFCE || "" };
              org.kana = jrec.OFPR || "";
              org.dept1 = jrec.SCTN || "";
              org.dept2 = fmver ? jrec.EX03 || "" : "";
              org.title = jrec.PSTN || "";
              recdata["organization"] = org;
            }

            if (jrec.OZIP || jrec.OADR) {
              let adr: AddrBlock = { kindof: "office" };
              //if ("addresses" in recdata === false) recdata["addresses"] = [];
              if (!recdata.addresses) recdata["addresses"] = [];
              adr.zipcode = jrec.OZIP;
              adr.street = jrec.OADR;
              recdata.addresses.push(adr);
            }
            if (jrec.OTEL || jrec.OFAX || jrec.OCPS) {
              if ("telephones" in recdata === false) recdata["telephones"] = [];
              let tel: TelephoneBlock = { number: "", kindof: "offtel" };
              if (jrec.OTEL) {
                tel.number = jrec.OTEL;
                if (recdata.telephones) recdata.telephones.push(tel);
              }
              if (jrec.OFAX) {
                tel.number = jrec.OFAX;
                tel.kindof = "offfax";
                if (recdata.telephones) recdata.telephones.push(tel);
              }
              if (jrec.OCPS) {
                tel.number = jrec.OCPS;
                tel.kindof = "offcell";
                if (recdata.telephones) recdata.telephones.push(tel);
              }
            }

            if (fmver) {
              if (jrec.EX02) {
                if ("emails" in recdata === false) recdata["emails"] = [];
                if (recdata.emails)
                  recdata.emails.push({ kindof: "office", address: jrec.EX02 });
              }

              if (
                jrec.RMRK ||
                jrec.RMR2 ||
                jrec.RMR3 ||
                jrec.RMR4 ||
                jrec.RMR5
              ) {
                let exd: ExtendPropsBlock = {
                  client_id: "mame.morrin.co.jp",
                  data: {}
                };
                exd.data["extra1"] = jrec.RMRK;
                exd.data["extra2"] = jrec.RMR2;
                exd.data["extra3"] = jrec.RMR3;
                exd.data["extra4"] = jrec.RMR4;
                exd.data["extra5"] = jrec.RMR5;
              }

              if (jrec.RMR6 || jrec.RMR7) {
                if (jrec.RMR6 && jrec.RMR7)
                  recdata.memo = "memo - personal:\r\n";
                recdata.memo += jrec.RMR6;
                if (jrec.RMR6 && jrec.RMR7)
                  recdata.memo += "\r\nmemo - work:\r\n";
                recdata.memo += jrec.RMR7;
              }

              if (jrec.EX04 || jrec.EX05) {
                recdata["weburls"] = [];
                let web: WebUrlBlock = { url: "", kindof: "hp" };
                if (jrec.EX04) web.url = jrec.EX04;
                recdata.weburls.push(web);
                if (jrec.EX05) {
                  web.url = jrec.EX05;
                  web.kindof = "office";
                }
                recdata.weburls.push(web);
              }
            }
            jsonData.data.push(recdata);
          }
        }
        parsed(jsonData);
      }
    }
  });
};

export default ParseJADR;

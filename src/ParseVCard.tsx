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
import Encoding from "encoding-japanese";
import { readConfigFile } from "typescript";

// url-encoded to Uint8Array
const urlEncodedToBytes = (encodedStr: string) => {
  var bytesArray: number[] = [];
  encodedStr
    .split(/%|=/)
    .slice(1)
    .forEach(function (s) {
      var safeChar = s.slice(2, 3);
      s = s.slice(0, 2);
      bytesArray.push(parseInt(s, 16));
      for (var i = 0; i < safeChar.length; i++) {
        bytesArray.push(safeChar.charCodeAt(i));
      }
    });
  return new Uint8Array(bytesArray);
};

const decode_qp = (qpstr: string, charset: string = "shift_jis") => {
  let decodedStr = "";

  let conv = qpstr.replace(/=(\r\n|\r|\n)/g, "");

  if (charset.search(/shift_jis|sjis|shift-jis/i) !== -1) {
    let codes = urlEncodedToBytes(conv);
    decodedStr = Encoding.convert(codes, {
      to: "unicode",
      from: "SJIS",
      type: "string"
    });
  } else {
    conv = conv.replace("=", "%");
    decodedStr = decodeURI(conv);
  }

  return decodedStr;
};

//	N:姓;名;ミドルネーム/(旧姓);敬称（名前の前）;敬称(名前の後)
const readN = (vparts: string[], attrs: {}, types: {}, recJson: RecordType) => {
  recJson.lastname = vparts[0];
  recJson.firstname = vparts[1] || "";
  // if( vparts[2] ) ; // 旧姓
  // if( vparts[3] ) ; // pre 敬称
  if (vparts[4]) recJson.suffix = vparts[4];
  let yomi = attrs["SORT-AS"] || "";
  if (yomi) {
    let yomis = yomi.split(/;|,/);
    recJson.lastkana = yomis[0];
    if (yomis.length > 1) recJson.firstkana = yomis[1];
  }
};

type FNType = { fname: string; lname: string; fyomi: string; lyomi: string };

const readFN = (vparts: string[], attrs: {}, types: {}, fullname: FNType) => {
  let yomi = attrs["SORT-AS"] || "";
  if (yomi) {
    let ar = yomi.split(/ |　|\t|;|,/);
    fullname.lyomi = ar[0];
    fullname.fyomi = ar[1] || "";
  }

  let ar = vparts[0].split(/ |　|\t|;|,/);
  fullname.lname = ar[0];
  fullname.fname = ar[1] || "";
};

const readTEL = (
  vparts: string[],
  attrs: {},
  types: {},
  recJson: RecordType
) => {
  //TEL;VALUE=uri;PREF=1;TYPE="voice,home":tel:+1-555-555-5555;ext=5555
  // VALUE=uri ?
  // PREF=1 means preference (from 1 to 100)
  // TYPE: text / voice / fax / cell / video / pager / textphone / iana-token / x-name
  //       ( + ,home or ,work)
  let tel: TelephoneBlock = { number: "", kindof: "tel" };
  if (attrs["TYPE"]) {
    let forwork = false;
    if (types["WORK"]) forwork = true;
    if (types["VOICE"]) tel.kindof = forwork ? "offtel" : "tel";
    else if (types["FAX"]) tel.kindof = forwork ? "offfax" : "fax";
    else if (types["CELL"]) tel.kindof = forwork ? "offcell" : "cell";
    else {
      // "video":
      // "pager":
      // "text":
      // "textphone":
      // "iana-token":
      // default:
      tel.kindof = null;
      tel.label = attrs["TYPE"];
    }
  }
  if ("telephones" in recJson === false) recJson["telephones"] = [];
  if (recJson.telephones) {
    if (attrs["PREF"] === "1") {
      recJson.telephones.unshift(tel);
    } else recJson.telephones.push(tel);
  }
};

const readEMAIL = (
  vparts: string[],
  attrs: {},
  types: {},
  recJson: RecordType
) => {
  // EMAIL;TYPE=work;PREF=1:jane_doe@example.com
  // PREF=1 means preference (from 1 to 100)
  // TYPE: text / voice / fax / cell / video / pager / textphone / iana-token / x-name
  //       ( + ,home or ,work)
  let mail: EmailBlock = { address: "", kindof: "home" };
  if (attrs["TYPE"]) {
    let forwork = false;
    if (types["HOME"]) forwork = false;
    if (types["WORK"]) {
      forwork = true;
      mail.kindof = "office";
    } else if (types["CELL"]) mail.kindof = "cell";
    else {
      // "video": "pager": "text":
      // "textphone": "iana-token": default:
      mail.kindof = null;
      mail.label = attrs["TYPE"];
    }
  }
  if ("emails" in recJson === false) recJson["emails"] = [];
  if (recJson.emails) {
    if (attrs["PREF"] === "1") {
      recJson.emails.unshift(mail);
    } else recJson.emails.push(mail);
  }
};

const readURL = (
  vparts: string[],
  attrs: {},
  types: {},
  recJson: RecordType
) => {
  // EMAIL;TYPE=work;PREF=1:jane_doe@example.com
  // PREF=1 means preference (from 1 to 100)
  // TYPE: text / voice / fax / cell / video / pager / textphone / iana-token / x-name
  //       ( + ,home or ,work)
  let web: WebUrlBlock = { url: "", kindof: "hp" };
  if (attrs["TYPE"]) {
    if (types["BLOG"]) web.kindof = "blog";
    else if (types["PROFILE"]) web.kindof = "profile";
    else if (types["WORK"]) {
      web.kindof = "office";
    } else if (!types["HOME"]) {
      web.kindof = null;
      web.label = attrs["TYPE"];
    }
  }
  if ("weburls" in recJson === false) recJson["weburls"] = [];
  if (recJson.weburls) {
    if (attrs["PREF"] === "1") {
      recJson.weburls.unshift(web);
    } else recJson.weburls.push(web);
  }
};

const readADR = (
  vparts: string[],
  attrs: {},
  types: {},
  recJson: RecordType
) => {
  //	ADR;TYPE=HOME:私書箱;周辺;町名以下の住所(一行目)\n町名以下の住所(二行目)\n;都市;都道府県;郵便番号;国/地域
  //	0:私書箱
  //	1:周辺				…これは何？
  //	2:町名以下の住所(一行目)\n町名以下の住所(二行目)\n;
  //	3:都市
  //	4:都道府県
  //	5:郵便番号
  //	6:国/地域
  let adr: AddrBlock = { kindof: "home" };
  if (Object.keys(types).length) {
    adr.kindof = types["HOME"] ? "home" : types["WORK"] ? "office" : null;
    if (adr.kindof === null) adr.label = attrs["TYPE"];
  }
  adr.zipcode = vparts[5] || "";
  adr.region = vparts[4] || "";
  adr.city = vparts[3] || "";
  adr.street = (vparts[2] || "").replace(/\\n$/, "");
  let arr = adr.street.split("\\n");
  if (arr.length > 1) {
    adr.building = arr.pop();
    adr.street = arr.join(" ");
  }
  if (vparts[0]) adr.street += ` ${vparts[0]}`;
  if (attrs["GEO"]) {
    adr.geolocation = attrs["GEO"];
  }

  if ("addresses" in recJson === false) recJson["addresses"] = [];
  if (recJson.addresses) recJson.addresses.push(adr);
};

//
//
//
const ParseVCard = (vcardData: string, parsed: (json: {}) => void) => {
  let records: string[] = vcardData.split(/END:VCARD/i);

  if (records.length === 0) {
    parsed({ error: "データがありません" });
  } else {
    let jsonData: { data: RecordType[] } = { data: [] };

    for (let recdata of records) {
      let recJson: RecordType = { id: "" };
      let fullname: FNType = { fname: "", lname: "", fyomi: "", lyomi: "" }; // just in case
      let label: AddrBlock = {}; // just in case

      let rec = recdata.replace(/=(\r\n|\r|\n)|(\r\n\s)/, "");
      let lines: string[] = rec.split(/\r\n|\r|\n/);
      for (let line of lines) {
        let find = line.search(":");
        if (find <= 0) continue;

        let field = line.substr(0, find);
        let value = line.substr(find + 1);
        if (!value) continue;

        let attrs = {};
        let aa = field.split(";");
        field = aa[0];
        for (let ai = 1; ai < aa.length; ai++) {
          let part = aa[ai].split("=");
          if (part.length > 1) {
            attrs[part[0].toUpperCase()] = part[1].replace(/^"|"$/, "");
          } else attrs[aa[ai].toUpperCase()] = true;
        }
        if (attrs["ENCODING"]) {
          let charset = attrs["CHARSET"] || "SJIS";
          if (attrs["ENCODING"] === "QUOTED-PRINTABLE") {
            value = decode_qp(value, charset);
          }
        }
        let vparts = value.split(";");
        /*
        "TYPE" parameter is allowed 
          FN, NICKNAME, PHOTO, ADR, TEL, EMAIL, IMPP, LANG, TZ, 
          GEO, TITLE, ROLE, LOGO, ORG, RELATED, CATEGORIES, NOTE, 
          SOUND, URL , KEY, FBURL, CALADRURI and CALURI.
        */
        let types = {};
        if (attrs["TYPE"]) {
          let arr = attrs["TYPE"].split(",");
          arr.forEach((type: string) => {
            types[type] = true;
          });
        } else {
          if (attrs["HOME"]) types["HOME"] = true;
          else if (attrs["WORK"]) types["WORK"] = true;
        }
        let yomi = attrs["SORT-AS"];

        switch (field) {
          case "N":
            readN(vparts, attrs, types, recJson);
            break;
          case "FN":
            readFN(vparts, attrs, types, fullname);
            break;
          case "NICKNAME":
            break;
          case "CATEGORIES":
            recJson.tags = vparts[0].split(",");
            break;
          case "BDAY":
            recJson.birthdate = vparts[0];
            break;
          case "ORG":
            if ("organization" in recJson === false) {
              recJson["organization"] = { name: "", kana: "" };
            }
            if (recJson.organization) {
              recJson.organization.name = vparts[0];
              if (yomi) recJson.organization.kana = yomi;
            }
            break;
          case "TITLE":
            if ("organization" in recJson === false) {
              recJson.organization = { name: "", kana: "" };
            }
            if (recJson.organization) recJson.organization.title = vparts[0];
            break;
          case "ADR":
            readADR(vparts, attrs, types, recJson);
            break;
          case "LABEL": // this is included in ADR on 4.0
            // LABEL;TYPE=HOME:<zipcode> <region+city+street+building>
            label.kindof = "home";
            if (attrs["TYPE"]) {
              label.kindof = types["HOME"]
                ? "home"
                : types["WORK"]
                ? "office"
                : null;
            }
            label.street = vparts[0]; // should be separated
            break;
          case "GEO":
            break;
          case "TEL":
            readTEL(vparts, attrs, types, recJson);
            break;
          case "EMAIL":
            readEMAIL(vparts, attrs, types, recJson);
            break;
          case "URL":
            readURL(vparts, attrs, types, recJson);
            break;
          case "NOTE":
            if ("memo" in recJson === false) recJson["memo"] = "";
            if (recJson.memo) recJson.memo += "\r\n\r\n";
            if (attrs["types"]) recJson.memo += `${attrs["types"]}:\r\n`;
            recJson.memo += vparts[0].replace("\\n", "\r\n");
            break;
          case "GENDER":
            //"" / "M" / "F" / "O" / "N" / "U"
            // vparts[1] grrrl, Fellow, intersex, etc...
            recJson.gender =
              vparts[0] === "M" ? "m" : vparts[0] === "F" ? "f" : "";
            break;
          case "X-WAB-GENDER":
            // 1:female 2:male
            recJson.gender =
              vparts[0] === "1" ? "f" : vparts[0] === "2" ? "m" : "";
            break;
          case "REV":
            break;
        }
      }
      if (!recJson.lastname && !recJson.firstname && fullname.lname) {
        recJson.lastname = fullname.lname;
        recJson.firstname = fullname.fname;
        recJson.lastkana = fullname.lyomi;
        recJson.firstkana = fullname.fyomi;
      }
      if (Object.keys(label).length && "addresses" in recJson === false) {
        recJson["addresses"] = [label];
      }
      jsonData.data.push(recJson);
    }
    parsed(jsonData);
  }
};

export default ParseVCard;

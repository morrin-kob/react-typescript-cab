import { DOMElement } from "react";
import {
  RecordType,
  AddrBlock,
  OrganizationBlock,
  TelephoneBlock,
  FamilyBlock,
  ExtendPropsBlock,
  getFullName,
  getFullNameYomi
} from "./CABDataTypes";

type ElmDataType = {
  tagName: string;
  value: string;
  attrs: {};
};

const getElementData = (node: Element | Node | null): ElmDataType | null => {
  if (!node) return null;

  let element = node as Element;

  let data: ElmDataType = {
    tagName: "",
    value: "",
    attrs: {}
  };
  data.tagName = element.tagName;
  data.value = element.textContent || "";

  if (element.attributes) {
    data["attrs"] = {};
    for (let idx = 0; idx < element.attributes.length; idx++) {
      let attr = element.attributes.item(idx);
      if (attr) {
        data.attrs[attr.name] = attr.value;
      }
    }
  }
  return data;
};

// <PersonName>
const readPersoName = (node: Node | null, recdata: RecordType) => {
  if (node) {
    for (let ni = 0; ni < node.childNodes.length; ni++) {
      let item = node.childNodes.item(ni) as Element;
      if (item && item.nodeName === "PersonNameItem") {
        for (let idx = 0; idx < item.childNodes.length; idx++) {
          let data = getElementData(item.childNodes.item(idx));
          if (data) {
            if (data.tagName === "FirstName") {
              recdata.firstname = data.value;
              recdata.firstkana = data.attrs ? data.attrs["pronunciation"] : "";
            }
            if (data.tagName === "LastName") {
              recdata.lastname = data.value;
              recdata.lastkana = data.attrs ? data.attrs["pronunciation"] : "";
            }
          }
        }
      }
    }
  }
};

// <AddressItem>
const readOneAddress = (node: Node | null, recdata: RecordType) => {
  if (node && node.nodeName === "AddressItem") {
    let type: string | null = "Home";
    if ((node as Element).attributes) {
      let attr = (node as Element).attributes.item(0);
      if (attr) type = attr.value;
    }
    type = type.toLowerCase();
    let label = "";
    if (type === "Others") {
      label = "その他";
      type = null;
    }
    let addrset: AddrBlock = { kindof: type as "home" | "office" | null };
    if (type == null) addrset.label = label;
    let town = "";
    let number = "";
    let pob = "";
    for (let idx = 0; idx < node.childNodes.length; idx++) {
      let item = node.childNodes.item(idx);
      if (item && item.nodeName === "AddressItem") {
        let data = getElementData(item);
        if (data) {
          if (data.tagName === "AddressCode") {
            addrset.zipcode = data.value;
          }
          if (data.tagName === "AddressLine") {
            switch (data.attrs["addressLineType"]) {
              case "Prefecture":
                addrset.region = data.value;
                break;
              case "City":
                addrset.city = data.value;
                break;
              case "Town":
                town = data.value;
                break;
              case "Number":
                number = data.value;
                break;
              case "Building":
                addrset.building = data.value;
                break;
              case "POB":
                pob = data.value;
            }
          }
        }
      }
    }
    addrset.street = town + number;
    if (pob) {
      if (addrset.street) addrset.street += " ";
      addrset.street += pob;
    }
    if (!recdata.addresses) recdata["addresses"] = [];
    recdata.addresses.push(addrset);
  }
};
// <AddressItem>
const readAddress = (node: Node | null, recdata: RecordType) => {
  if (node && node.nodeName === "Address") {
    for (let adr = 0; adr < node.childNodes.length; adr++) {
      readOneAddress(node.childNodes.item(adr), recdata);
    }
  }
};

// <OccupationItem>
const readOccupation = (node: Node | null, recdata: RecordType) => {
  if (node && node.nodeName === "OccupationItem") {
    let org: OrganizationBlock = {
      name: "",
      title: "",
      dept1: "",
      dept2: "",
      kana: ""
    };
    let empty = JSON.stringify(org);
    for (let idx = 0; idx < node.childNodes.length; idx++) {
      let item = node.childNodes.item(idx);
      if (!item || item.nodeName !== "OccupationItem") continue;
      let data = getElementData(item);
      if (data) {
        switch (data.tagName) {
          case "OrganizationName":
            org.name = data.value;
            org.kana = data.attrs["pronunciation"];
            break;
          case "Department":
            org.dept1 = data.value;
            break;
          case "JobTitle":
            org.title = data.value;
            break;
        }
        break;
      }
    }
    if (empty !== JSON.stringify(org)) {
      recdata["organization"] = org;
    }
  }
};

// <Phone>
const readPhones = (node: Node | null, recdata: RecordType) => {
  if (node && node.nodeName == "Phone") {
    for (let idx = 0; idx < node.childNodes.length; idx++) {
      let item = node.childNodes.item(idx) as Element;
      if (item.tagName === "PhoneItem") {
        let data = getElementData(item);
        if (data && data.value) {
          let kindof:
            | "tel"
            | "fax"
            | "cell"
            | "offtel"
            | "offfax"
            | "offcell"
            | null = null;
          let label = "";

          if (data.attrs["usage"] === "Private") {
            switch (data.attrs["phoneDevice"]) {
              case "Phone":
                kindof = "tel";
                break;
              case "Fax":
                kindof = "fax";
                break;
              case "Cellular":
                kindof = "cell";
                break;
              case "Others":
                kindof = null;
                label = "その他(自宅)";
                break;
            }
          } else if (data.attrs["usage"] === "Official") {
            switch (data.attrs["phoneDevice"]) {
              case "Phone":
                kindof = "offtel";
                break;
              case "Fax":
                kindof = "offfax";
                break;
              case "Cellular":
                kindof = "offcell";
                break;
              case "Others":
                kindof = null;
                label = "その他(会社)";
                break;
            }
          } else if (data.attrs["usage"] === "Others") {
            switch (data.attrs["phoneDevice"]) {
              case "Phone":
                kindof = null;
                label = "Tel(その他)";
                break;
              case "Fax":
                kindof = null;
                label = "Fax(その他)";
                break;
              case "Cellular":
                kindof = null;
                label = "携帯(その他)";
                break;
              case "Others":
                kindof = null;
                label = "Others(その他)";
                break;
            }
          } else {
            switch (data.attrs["phoneDevice"]) {
              case "Phone":
                kindof = null;
                label = `Tel(${data.attrs["usage"]})`;
                break;
              case "Fax":
                kindof = null;
                label = `Fax(${data.attrs["usage"]})`;
                break;
              case "Cellular":
                kindof = null;
                label = `携帯(${data.attrs["usage"]})`;
                break;
              case "Others":
                kindof = null;
                label = `Others(${data.attrs["usage"]})`;
                break;
            }
          }
          if (!recdata.telephones) recdata["telephones"] = [];
          recdata.telephones.push({
            kindof: kindof,
            number: data.value,
            label: label
          });
        }
      }
    }
  }
};
// <Email>
const readEmails = (node: Node | null, recdata: RecordType) => {
  if (node && node.nodeName === "Email") {
    for (let idx = 0; idx < node.childNodes.length; idx++) {
      let item = node.childNodes.item(idx) as Element;
      if (item.tagName === "EmailItem") {
        let data = getElementData(item);
        if (data && data.value) {
          let kindof: "cell" | "home" | "office" | null = null;
          let label = "";

          if (data.attrs["usage"] === "Private") {
            kindof = "home";
            switch (data.attrs["emailDevice"]) {
              case "PC":
                kindof = null;
                label = "PC用(自宅)";
                break;
              case "PDA":
                kindof = null;
                label = "PDA(自宅)";
                break;
              case "Cellular":
                kindof = "cell";
                break;
              case "Others":
                kindof = null;
                label = "その他(自宅)";
                break;
              case "Unknown":
                break;
            }
          } else if (data.attrs["usage"] === "Official") {
            kindof = "office";
            switch (data.attrs["emailDevice"]) {
              case "PC":
                kindof = null;
                label = "PC用(会社)";
                break;
              case "PDA":
                kindof = null;
                label = "PDA(会社)";
                break;
              case "Cellular":
                kindof = null;
                label = "携帯(会社)";
                break;
              case "Others":
                kindof = null;
                label = "その他(会社)";
                break;
              case "Unknown":
                break;
            }
          } else if (data.attrs["usage"] === "Others") {
            kindof = null;
            switch (data.attrs["emailDevice"]) {
              case "PC":
                label = "PC用(その他)";
                break;
              case "PDA":
                label = "PDA(その他)";
                break;
              case "Cellular":
                label = "携帯(その他)";
                break;
              case "Others":
                label = "その他(その他)";
                break;
              case "Unknown":
                label = "(その他)";
                break;
            }
          } else {
            switch (data.attrs["phoneDevice"]) {
              case "PC":
                label = `PC用(${data.attrs["usage"]})`;
                break;
              case "PDA":
                label = `PDA(${data.attrs["usage"]})`;
                break;
              case "Cellular":
                label = `携帯(${data.attrs["usage"]})`;
                break;
              case "Others":
                label = `その他(${data.attrs["usage"]})`;
                break;
              case "Unknown":
                label = `(${data.attrs["usage"]})`;
                break;
            }
          }

          if (!recdata.emails) recdata["emails"] = [];
          recdata.emails.push({
            kindof: kindof,
            address: data.value,
            label: label
          });
        }
      }
    }
  }
};

// <Web>
const readWebs = (node: Node | null, recdata: RecordType) => {
  if (node && node.nodeName === "Web") {
    for (let idx = 0; idx < node.childNodes.length; idx++) {
      let item = node.childNodes.item(idx) as Element;
      if (item.tagName === "WebItem") {
        let data = getElementData(item);
        if (data && data.value) {
          let kindof: "profile" | "blog" | "hp" | "office" | null = null;
          let label = "";

          switch (data.attrs["usage"]) {
            case "Private":
              kindof = "hp";
              break;
            case "Official":
              kindof = "office";
              break;
            default:
              kindof = null;
              label = `${data.attrs["usage"]}`;
          }

          if (!recdata.weburls) recdata["weburls"] = [];
          recdata.weburls.push({
            kindof: kindof,
            url: data.value,
            label: label
          });
        }
      }
    }
  }
};
// <Extension>
const readExtensions = (node: Node | null, recdata: RecordType) => {
  if (node && node.nodeName === "Extension") {
    let family: FamilyBlock[] = [];
    let extData: ExtendPropsBlock = { client_id: "", data: {} };

    for (let idx = 0; idx < node.childNodes.length; idx++) {
      let item = node.childNodes.item(idx) as Element;
      if (item.tagName === "ExtensionItem") {
        let data = getElementData(item);
        if (data && data.value) {
          if (data.attrs["extensionType"] === "Common") {
            switch (data.attrs["name"]) {
              case "Suffix":
                recdata.suffix = data.value;
                break;
              case "NamesOfFamily":
                {
                  let fm = {
                    lastname: data.value,
                    firstname: "",
                    lastkana: "",
                    firstkana: ""
                  };
                  family.push(fm);
                }
                break;
            }
          } else if (data.attrs["extensionType"] === "Extended") {
            switch (data.attrs["name"]) {
              case "X-Category":
                if (!recdata.tags) recdata["tags"] = [];
                recdata.tags.push(data.value);
                break;
              case "X-IsPrefPrint":
                {
                  let prpr = 0;
                  if (data.value !== getFullName(recdata)) {
                    for (let check = 0; check < family.length; check++) {
                      if (family[check].firstname === data.value) {
                        prpr = check + 1;
                        break;
                      }
                    }
                  }
                  extData.data["pr-primary"] = prpr;
                }
                break;
            }
          }
        }
      }
    }
  }
};

const ParseCXML = (xmlData: string, parsed: (json: {}) => void) => {
  let parser = new DOMParser();
  let doc = parser.parseFromString(xmlData, "application/xml");

  let items = doc.getElementsByTagName("ContactXMLItem");
  if (items === null) {
    parsed({
      error: "データが見つかりません\nContact-XML形式ではない可能性があります"
    });
  } else {
    let jsonData: { data: RecordType[] } = { data: [] };

    let recCount = items.length;

    for (let idx = 0; idx < recCount; idx++) {
      let recJson: RecordType = { id: "" };
      let rec = items.item(idx);
      if (!rec) continue;
      // let modifyDate = rec.getAttribute("lastModifiedDate");
      // recJson.updated_at = modifyDate || "";

      for (let i = 0; i < rec.childNodes.length; i++) {
        let node = rec.childNodes[i];
        switch (node.nodeName) {
          case "PersonName":
            readPersoName(node, recJson);
            break;
          case "Address":
            readAddress(node, recJson);
            break;
          case "Occupation":
            readOccupation(node, recJson);
            break;
          case "Phone":
            readPhones(node, recJson);
            break;
          case "Email":
            readEmails(node, recJson);
            break;
          case "Web":
            readWebs(node, recJson);
            break;
          case "Extension":
            readExtensions(node, recJson);
            break;
        }
      }
      jsonData.data.push(recJson);
    }
    parsed(jsonData);
  }
};

export default ParseCXML;

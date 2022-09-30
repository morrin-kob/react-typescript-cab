import * as React from "react";
import { useContext } from "react";
import { UserContext, UserContextType } from "./Account";
import { ContentsPropsType, isHomeAddress } from "./AppSettings";
import DefPersonImg from "./assets/images/person.png";
import Avatar from "@mui/material/Avatar";

type AddrBlock = {
  kindof?: "home" | "office" | null;
  zipcode?: string;
  region?: string;
  city?: string;
  street?: string;
  building?: string;
  station?: string;
  label?: string;
  geolocation?: object;
};
type TelephoneBlock = {
  kindof: "tel" | "fax" | "cell" | "offtel" | "offfax" | "offcell" | null;
  number: string;
  label?: string;
};
type EmailBlock = {
  kindof: "cell" | "home" | "office" | null;
  address: string;
  label?: string;
};
type OrganizationBlock = {
  name: string;
  title?: string;
  dept1?: string;
  dept2?: string;
  kana?: string;
};
type WebUrlBlock = {
  kindof: "profile" | "blog" | "hp" | "office" | null;
  label?: string;
  url: string;
};
type ExternalIDBlock = {
  id: string;
  client_id: string;
};
type FamilyBlock = {
  lastname: string;
  firstname: string;
  lastkana: string;
  firstkana: string;
  suffix?: string;
  gender?: string;
  birthdate?: string;
};
type ExtendPropsBlock = {
  client_id: string;
  data: {};
};

type PictureBlock = {
  image: string; // 変なID　like 62d7aaeb4e79f804b678aff6
  exif: {
    taken: object | null;
  };
  thum_size: number[];
  image_size: number[];
};

type RecordType = {
  id: string;
  code?: string;
  external_ids?: ExternalIDBlock[];
  pictures?: PictureBlock[];
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
  etag?: string;
  face_picture?: PictureBlock;
  owner_id?: string;
  tags?: string[];
  deleted?: boolean;

  firstname?: string;
  lastname?: string;
  firstkana?: string;
  lastkana?: string;
  suffix?: string;
  gender?: string;
  birthdate?: string;

  joint_names?: FamilyBlock[];
  organization?: OrganizationBlock;
  addresses?: AddrBlock[];
  emails?: EmailBlock[];
  telephones?: TelephoneBlock[];
  weburls?: WebUrlBlock[];
  memo?: string;

  extendprops?: ExtendPropsBlock[];
};

const loadRecord = (
  user: UserContextType,
  abId: string,
  recId: string,
  onLoad: (json: {}) => void
) => {
  let url = `${user.getEpt()}/`;
  if (isHomeAddress(abId)) {
    url += `homeaddress/${recId}`;
  } else {
    url += `address/${recId}`;
  }

  user.FetchWithRefreshedRetry(url, "GET", onLoad);
};

function PersonalPicture(props: {
  abId: string;
  rec: RecordType;
  cx: number;
  cy: number;
}) {
  const user = useContext(UserContext);

  const [imgurl, setImgurl] = React.useState("");
  let url = "";
  if (!imgurl && props.rec.face_picture && props.rec.face_picture.image) {
    url = `${user.getEpm()}/p/get_address_face/`; //get_address_pict
    if (isHomeAddress(props.abId)) {
      url += `homeaddress/${props.rec.id}`;
    } else {
      url += `${props.rec.id}/${props.rec.face_picture.image}.jpg?t=T`;
    }
  }

  let cont = (
    <Avatar src={DefPersonImg} sx={{ width: props.cx, height: props.cy }} />
  );
  if (url) {
    cont = <Avatar src={url} sx={{ width: props.cx }} alt="" />;
    //cont = <img src={url} style={{ width: props.cx }} alt="" />;
  }

  return cont;
}

const getFullName = (rec: RecordType, family: number = 0) => {
  let firstname = rec.firstname;
  let lastname = rec.lastname;

  if (lastname && firstname) {
    if (firstname.match(/[^a-zA-Z\-=:]/) || lastname.match(/[^a-zA-Z\-=:]/)) {
      firstname = rec.lastname;
      lastname = rec.firstname;
    }
  }

  let name = firstname || "";
  if (lastname) {
    if (name) name += " ";
    name += lastname;
  }
  return name;
};
const getFullNameYomi = (rec: RecordType, family: number = 0) => {
  let firstname = rec.firstname;
  let lastname = rec.lastname;
  let firstnameYomi = rec.firstkana;
  let lastnameYomi = rec.lastkana;

  if (lastname && firstname) {
    if (firstname.match(/[^a-zA-Z\-=:]/) || lastname.match(/[^a-zA-Z\-=:]/)) {
      firstnameYomi = rec.lastkana;
      lastnameYomi = rec.firstkana;
    }
  }

  let name = firstnameYomi || "";
  if (lastnameYomi) {
    if (name) name += " ";
    name += lastnameYomi;
  }
  return name;
};

export {
  AddrBlock,
  TelephoneBlock,
  EmailBlock,
  OrganizationBlock,
  WebUrlBlock,
  ExternalIDBlock,
  FamilyBlock,
  ExtendPropsBlock,
  PictureBlock,
  RecordType,
  loadRecord,
  PersonalPicture,
  getFullName,
  getFullNameYomi
};

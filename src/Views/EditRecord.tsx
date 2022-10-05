//import React, { useContext, useEffect, useMemo } from "react";
import * as React from "react";
import { useContext, useRef, ReactNode, Children } from "react";
import { UserContext, UserContextType } from "../Account";
import {
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
  PersonalPicture
} from "../CABDataTypes";
import {
  EditFieldTitle,
  SquareIconButton,
  FieldEditBox,
  FieldTextArea,
  FieldComboBox,
  FieldDatePicker,
  TagSetter,
  FieldCheckboxGroup,
  FieldRadioButtonsGroup,
  ReformField
} from "../components/EditParts";
import { isHomeAddress } from "../AppSettings";

import PopupProgress from "../components/PopupProgress";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
import Divider from "@mui/material/Divider";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import Fab from "@mui/material/Fab";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

import CircularProgress from "@mui/material/CircularProgress";
import { SvgIcon } from "@mui/material";
import DefPersonImg from "../assets/images/person.png";
import { isMobile } from "react-device-detect";
import { BrowserView, MobileView } from "react-device-detect";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import type {} from "@mui/x-date-pickers/themeAugmentation";
import MessageBox, { MessageBoxProps } from "../components/MessageBox";

const bgcolEditBlock = "#f0f0f0";
const bgcolEditAround = "#fafafa";

const suffixOptins = [
  { value: "様" },
  { value: "殿" },
  { value: "御中" },
  { value: "行" },
  { value: "宛" },
  { value: "先生" },
  { value: "君" },
  { value: "くん" },
  { value: "さん" },
  { value: "ちゃん" }
];
let taglist = {
  友人: 1,
  親戚: 1,
  同僚: 1
};

type EditBlockProp = {
  abid: string;
  rec: RecordType;
  onChangeField: (field: string, value: string | string[]) => void;
  onChangeData?: (rec: {}) => void;
};

const PictWidth = 128;
const PictMargin = 4;
const PictAreaWidth = PictWidth + PictMargin;

const EditBlockName = (props: EditBlockProp) => {
  const [detail, setDetail] = React.useState<boolean>(false);

  //taglist
  const currTags = props.rec["tags"];
  if (currTags) {
    let arr;
    if (Array.isArray(currTags)) arr = currTags;
    else arr = (currTags as string).split(/,/);
    arr.forEach((tag) => {
      taglist[tag] = 1;
    });
  }

  return (
    <Grid container>
      <Grid item sx={{ width: `calc( 100% - ${PictAreaWidth}px )` }}>
        <Paper
          component="form"
          sx={{
            backgroundColor: bgcolEditBlock
          }}
        >
          <Grid container={true} columns={15}>
            {/* ------ 氏名の行 ------ */}
            <Grid item={true} xs={3} sx={{ pl: 2 }}>
              <EditFieldTitle title="氏名" />
            </Grid>
            <Grid item={true} xs={4} sx={{ px: 1 }}>
              <FieldEditBox
                data={props.rec}
                id="lastname"
                placeholder="姓"
                onChange={props.onChangeField}
              />
            </Grid>
            <Grid item={true} xs={4} sx={{ px: 1 }}>
              <FieldEditBox
                data={props.rec}
                id="firstname"
                placeholder="名"
                onChange={props.onChangeField}
              />
            </Grid>
            <Grid item={true} xs={4} sx={{ px: 1 }}>
              <FieldComboBox
                data={props.rec}
                id="suffix"
                placeholder="敬称"
                editable={true}
                backAroundColor={bgcolEditAround}
                options={suffixOptins}
                onChange={props.onChangeField}
              />
            </Grid>

            {/* ------ テストの行 ------ */}
            <Grid item={true} xs={3} sx={{ pl: 2 }}>
              <EditFieldTitle title="チェック" />
            </Grid>
            <Grid item={true} xs={11} sx={{ pl: 1 }}>
              <FieldRadioButtonsGroup
                data={props.rec}
                id="radiotest"
                label="ラジオの時間"
                onChange={props.onChangeField}
                lplacement="end"
                default_val="Netflix"
                options={[
                  { label: "Netflix", value: "nf" },
                  { label: "Disney+", value: "dp" },
                  { label: "Amazon Prime", value: "ap" },
                  { label: "Hulu", value: "hl" }
                ]}
              />
            </Grid>
            <Grid item={true} xs={3} sx={{ pl: 2 }}>
              <EditFieldTitle title="PWチェック" />
            </Grid>
            <Grid item={true} xs={11} sx={{ pl: 1 }}>
              <FieldEditBox
                data={props.rec}
                id="password"
                placeholder="password"
                type="password"
                onChange={props.onChangeField}
              />
            </Grid>

            {/* ------ フリガナの行 ------ */}
            <Grid item={true} xs={3} sx={{ pl: 2 }}>
              <EditFieldTitle title="フリガナ" />
            </Grid>
            <Grid item={true} xs={4} sx={{ px: 1 }}>
              <FieldEditBox
                data={props.rec}
                id="lastkana"
                placeholder="姓フリガナ"
                onChange={props.onChangeField}
              />
            </Grid>
            <Grid item={true} xs={4} sx={{ px: 1 }}>
              <FieldEditBox
                data={props.rec}
                id="firstkana"
                placeholder="名フリガナ"
                onChange={props.onChangeField}
              />
            </Grid>
            <Grid item={true} xs={4} sx={{ px: 1 }}></Grid>

            <Grid item={true} xs={15} sx={{ px: 1 }}>
              <Divider />
            </Grid>

            {/* ------ タグの行 ------ */}
            <Grid item={true} xs={3} sx={{ pl: 2 }}>
              <EditFieldTitle title="タグ" />
            </Grid>
            <Grid item={true} xs={10} sx={{ px: 1 }}>
              <TagSetter
                data={props.rec}
                id="tags"
                placeholder="タグ"
                options={Object.keys(taglist)}
                onChange={(id, value, e) => {
                  if (value) {
                    let arr;
                    if (Array.isArray(value)) arr = value;
                    else arr = (value as string).split(/,/);
                    arr.forEach((tag) => {
                      taglist[tag] = 1;
                    });
                  }
                  props.onChangeField(id, value);
                }}
              />
            </Grid>
            <Grid item={true} xs={2} sx={{ px: 0, mt: 0 }}>
              <div style={{ flexGrow: 1 }}></div>
              <SquareIconButton
                id=""
                variant="contained"
                sx={{ backgoundColor: "gray" }}
                onClick={(id) => {
                  setDetail(!detail);
                }}
              >
                <Tooltip title={detail ? "詳細を閉じる" : "詳細を開く"}>
                  {!detail ? <MoreHorizIcon /> : <KeyboardArrowUpIcon />}
                </Tooltip>
              </SquareIconButton>
            </Grid>
            {/* ------ 詳細の始まり ------ */}
            {detail && (
              <>
                {/* ------ 誕生日＆性別　の行 ------ */}
                <Grid item={true} xs={3} sx={{ pl: 2 }}>
                  <EditFieldTitle title="誕生日" />
                </Grid>
                <Grid item={true} xs={5} sx={{ px: 1 }}>
                  <FieldDatePicker
                    data={props.rec}
                    id="birthdate"
                    placeholder="誕生日"
                    backAroundColor={bgcolEditAround}
                    onChange={props.onChangeField}
                  />
                </Grid>
                <Grid item={true} xs={2} sx={{ pl: 2 }}>
                  <EditFieldTitle title="性別" />
                </Grid>
                <Grid item={true} xs={4} sx={{ px: 1 }}>
                  <FieldComboBox
                    data={props.rec}
                    id="gender"
                    placeholder="性別"
                    editable={false}
                    options={[
                      { value: "男性" },
                      { value: "女性" },
                      { value: "その他" }
                    ]}
                    onChange={props.onChangeField}
                  />
                </Grid>

                {/* ------ 顧客コードの行 ------ */}
                <Grid item={true} xs={3} sx={{ pl: 2 }}>
                  <EditFieldTitle title="顧客コード" />
                </Grid>
                <Grid item={true} xs={5} sx={{ px: 1 }}>
                  <FieldEditBox
                    data={props.rec}
                    id="code"
                    placeholder="顧客コード"
                    onChange={props.onChangeField}
                  />
                </Grid>
                <Grid item={true} xs={7} sx={{ px: 1 }}></Grid>

                {/* ------ メモの行 ------ */}
                <Grid item={true} xs={3} sx={{ pl: 2 }}>
                  <EditFieldTitle title="メモ" />
                </Grid>
                {/* FieldTextArea */}
                <Grid item={true} xs={9} sx={{ px: 1 }}>
                  <FieldTextArea
                    data={props.rec}
                    id="memo"
                    placeholder="メモ"
                    onChange={props.onChangeField}
                  />
                </Grid>
                <Grid item={true} xs={4} sx={{ px: 1 }}></Grid>
                <Grid item={true} xs={15} sx={{ px: 1 }}>
                  &nbsp;
                </Grid>
              </>
            )}
          </Grid>
        </Paper>
      </Grid>
      <Grid item sx={{ width: PictAreaWidth }}>
        <Box gridColumn="span 2">
          <PersonalPicture
            abId={props.abid}
            rec={props.rec}
            cx={PictWidth}
            cy={PictWidth}
          />
        </Box>
      </Grid>
    </Grid>
  );
};

type BlockTitleProps = {
  title: string;
};

const BlockTitle = (props: BlockTitleProps) => {
  return (
    <p
      style={{
        margin: "6pt 0 0 2pt",
        fontSize: "150%",
        color: "gray",
        backgroundColor: "white"
      }}
    >
      {props.title}
    </p>
  );
};

// ----------------------------------------------------------------
// 勤務先ブロック

const EditBlockOrg = (props: EditBlockProp) => {
  const [open, setOpen] = React.useState<boolean>(true);

  const bgc = open ? "var(--col-offical)" : "gray";
  return (
    <>
      <BlockTitle title="勤務先" />

      <Grid container>
        <Grid item sx={{ width: `${PictWidth}px` }}>
          <Fab
            size="small"
            aria-label="add"
            sx={{ ml: 9, color: "white", backgroundColor: `${bgc}` }}
            onClick={() => {
              setOpen(!open);
            }}
          >
            {open ? <RemoveIcon /> : <KeyboardArrowDownIcon />}
          </Fab>
        </Grid>

        {open && (
          <Grid item sx={{ width: `calc( 100% - ${PictAreaWidth}px )` }}>
            <Paper
              component="form"
              sx={{
                backgroundColor: bgcolEditBlock
              }}
            >
              <Grid container={true} columns={15}>
                <Grid item xs={3} sx={{ pl: 2 }}>
                  <EditFieldTitle title="勤務先名" />
                </Grid>
                <Grid item xs={10}>
                  <FieldEditBox
                    data={props.rec}
                    id="organization.name"
                    placeholder="勤務先"
                    onChange={props.onChangeField}
                  />
                </Grid>
                <Grid item xs={2}></Grid>

                <Grid item xs={3} sx={{ pl: 2 }}>
                  <EditFieldTitle title="フリガナ" />
                </Grid>
                <Grid item xs={10}>
                  <FieldEditBox
                    data={props.rec}
                    id="organization.kana"
                    placeholder="フリガナ"
                    onChange={props.onChangeField}
                  />
                </Grid>
                <Grid item xs={2}></Grid>

                <Grid item xs={15}>
                  <Divider />
                </Grid>

                <Grid item xs={3} sx={{ pl: 2 }}>
                  <EditFieldTitle title="部署名" />
                </Grid>
                <Grid item xs={5} sx={{ pr: 0.5 }}>
                  <FieldEditBox
                    data={props.rec}
                    id="organization.dept1"
                    placeholder="部署名1"
                    onChange={props.onChangeField}
                  />
                </Grid>
                <Grid item xs={5} sx={{ pl: 0.5 }}>
                  <FieldEditBox
                    data={props.rec}
                    id="organization.dept2"
                    placeholder="部署名2"
                    onChange={props.onChangeField}
                  />
                </Grid>
                <Grid item xs={2}></Grid>

                <Grid item xs={3} sx={{ pl: 2 }}>
                  <EditFieldTitle title="役職" />
                </Grid>
                <Grid item xs={7}>
                  <FieldEditBox
                    data={props.rec}
                    id="organization.title"
                    placeholder="役職"
                    onChange={props.onChangeField}
                  />
                </Grid>
                <Grid item xs={5}></Grid>
              </Grid>
            </Paper>
          </Grid>
        )}
      </Grid>
    </>
  );
};
// ----------------------------------------------------------------
// 住所ブロック

const EditBlockAddresses = (props: EditBlockProp) => {
  const [count, setCount] = React.useState<number>(
    props.rec.addresses ? props.rec.addresses.length : 0
  );

  const initialData: AddrBlock = {
    kindof: "home",
    zipcode: "",
    region: "",
    city: "",
    street: "",
    building: ""
  };

  if (props.rec.addresses) {
    if (!Array.isArray(props.rec.addresses)) {
      props.rec.addresses = [{ ...initialData }];
    }
    //console.log(`addresses:${JSON.stringify(props.rec.addresses)}`);
    if (props.rec.addresses[0] === null) {
      props.rec.addresses[0] = { ...initialData };
    }
  } else {
    props.rec.addresses = [{ ...initialData }];
  }

  return (
    <>
      <BlockTitle title="住所" />

      {props.rec.addresses &&
        props.rec.addresses.map((addr, index) => (
          <Grid container>
            <Grid item sx={{ width: `${PictWidth}px` }}>
              <Fab
                size="small"
                aria-label="add"
                sx={{
                  ml: 9,
                  color: "white",
                  backgroundColor: "var(--col-offical)"
                }}
                onClick={() => {
                  if (props.rec.addresses) {
                    delete props.rec.addresses[index];
                    if (props.onChangeData) props.onChangeData(props.rec);
                  }
                  setCount(
                    props.rec.addresses ? props.rec.addresses.length : 0
                  );
                }}
              >
                <RemoveIcon />
              </Fab>
            </Grid>

            <Grid item sx={{ width: `calc( 100% - ${PictAreaWidth}px )` }}>
              <Paper
                component="form"
                sx={{
                  backgroundColor: bgcolEditBlock
                }}
              >
                <Grid container={true} columns={15}>
                  {/* ------ 分類の行 ------ */}
                  <Grid item xs={5} sx={{ pl: 2 }}>
                    <FieldComboBox
                      data={props.rec}
                      placeholder="分類"
                      id={`addresses[${index}].kindof`}
                      editable={true}
                      options={[
                        { label: "自宅", value: "home" },
                        { label: "会社", value: "office" }
                      ]}
                      fieldOnEdit={`addresses[${index}].label`}
                      onChange={props.onChangeField}
                    />
                  </Grid>
                  <Grid item xs={10}></Grid>

                  {/* ------ 郵便番号の行 ------ */}

                  <Grid item xs={3} sx={{ pl: 2 }}>
                    <EditFieldTitle title="郵便番号" />
                  </Grid>

                  <Grid item xs={5}>
                    <FieldEditBox
                      data={props.rec}
                      id={`addresses[${index}].zipcode`}
                      type="tel"
                      placeholder="郵便番号"
                      onChange={props.onChangeField}
                    />
                  </Grid>
                  <Grid item xs={1}>
                    <SquareIconButton
                      id={`addresses[${index}].zipcode`}
                      variant="outlined"
                      sx={{ backgroundColor: "white" }}
                      onClick={(id) => {
                        let rp = ReformField(
                          props.rec,
                          `addresses[${index}].zipcode`
                        );
                        alert(`〒変換:${rp.data[rp.field]}`);
                      }}
                    >
                      <ManageSearchIcon />
                    </SquareIconButton>
                  </Grid>
                  <Grid item xs={6}></Grid>

                  <Grid item xs={15}>
                    <Divider />
                  </Grid>

                  {/* ------ 住所の行 ------ */}
                  <Grid item xs={3} sx={{ pl: 2 }}>
                    <EditFieldTitle title="住所" />
                  </Grid>
                  <Grid item xs={3} sx={{ pr: 0.5 }}>
                    <FieldEditBox
                      data={props.rec}
                      id={`addresses[${index}].region`}
                      placeholder="都道府県"
                      onChange={props.onChangeField}
                    />
                  </Grid>
                  <Grid item xs={3} sx={{ pl: 0.5 }}>
                    <FieldEditBox
                      data={props.rec}
                      id={`addresses[${index}].city`}
                      placeholder="市区町村"
                      onChange={props.onChangeField}
                    />
                  </Grid>
                  <Grid item xs={6} sx={{ pl: 0.5 }}>
                    <FieldEditBox
                      data={props.rec}
                      id={`addresses[${index}].street`}
                      placeholder="地名番地"
                      onChange={props.onChangeField}
                    />
                  </Grid>

                  {/* ------ ビル名の行 ------ */}

                  <Grid item xs={3} sx={{ pl: 2 }}>
                    <EditFieldTitle title="ビル名" />
                  </Grid>
                  <Grid item xs={7} sx={{ pl: 0.5 }}>
                    <FieldEditBox
                      data={props.rec}
                      id={`addresses[${index}].building`}
                      placeholder="ビル名"
                      onChange={props.onChangeField}
                    />
                  </Grid>

                  <Grid item xs={15}>
                    <Divider />
                  </Grid>

                  {/* ------ 最寄り駅の行 ------ */}

                  <Grid item xs={3} sx={{ pl: 2 }}>
                    <EditFieldTitle title="最寄り駅" />
                  </Grid>

                  <Grid item xs={7} sx={{ pl: 0.5 }}>
                    <FieldEditBox
                      data={props.rec}
                      id={`addresses[${index}].station`}
                      placeholder="最寄り駅"
                      onChange={props.onChangeField}
                    />
                  </Grid>
                  <Grid item xs={6}></Grid>
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={15}>
              &nbsp;
            </Grid>
          </Grid>
        ))}
      <Grid container>
        <Grid item sx={{ width: `${PictWidth}px` }}>
          <Fab
            size="small"
            aria-label="add"
            sx={{ ml: 9, color: "white", backgroundColor: "gray" }}
            onClick={() => {
              if (!props.rec.addresses)
                props.rec["addresses"] = [{ ...initialData }];
              else {
                props.rec.addresses.push({ ...initialData });
              }
              if (props.onChangeData) props.onChangeData(props.rec);
              setCount(count + 1);
            }}
          >
            <AddIcon />
          </Fab>
        </Grid>
      </Grid>
    </>
  );
};

// ----------------------------------------------------------------
// TELブロック

const EditBlockTelephones = (props: EditBlockProp) => {
  const [count, setCount] = React.useState<number>(
    props.rec.telephones ? props.rec.telephones.length : 0
  );

  const initialData: TelephoneBlock = {
    kindof: "cell",
    number: "",
    label: ""
  };

  if (props.rec.telephones) {
    if (!Array.isArray(props.rec.telephones)) {
      props.rec.telephones = [{ ...initialData }];
    }
    //console.log(`telephones:${JSON.stringify(props.rec.telephones)}`);
    if (props.rec.telephones[0] === null) {
      props.rec.telephones[0] = { ...initialData };
    }
  } else {
    props.rec.telephones = [{ ...initialData }];
  }

  return (
    <>
      <BlockTitle title="電話番号" />

      {props.rec.telephones &&
        props.rec.telephones.map((addr, index) => (
          <Grid container>
            <Grid item sx={{ width: `${PictWidth}px` }}>
              <Fab
                size="small"
                aria-label="add"
                sx={{
                  ml: 9,
                  color: "white",
                  backgroundColor: "var(--col-offical)"
                }}
                onClick={() => {
                  if (props.rec.telephones) {
                    delete props.rec.telephones[index];
                    if (props.onChangeData) props.onChangeData(props.rec);
                  }
                  setCount(
                    props.rec.telephones ? props.rec.telephones.length : 0
                  );
                }}
              >
                <RemoveIcon />
              </Fab>
            </Grid>

            <Grid item sx={{ width: `calc( 100% - ${PictAreaWidth}px )` }}>
              <Paper
                component="form"
                sx={{
                  backgroundColor: bgcolEditBlock,
                  pb: 1
                }}
              >
                <Grid container={true} columns={15}>
                  {/* ------ 分類／電話番号 ------ */}
                  <Grid item xs={5} sx={{ pl: 2 }}>
                    <FieldComboBox
                      data={props.rec}
                      id={`telephones[${index}].kindof`}
                      placeholder="分類"
                      editable={true}
                      options={[
                        { value: "tel", label: "自宅TEL" },
                        { value: "fax", label: "自宅FAX" },
                        { value: "cell", label: "個人携帯" },
                        { value: "offtel", label: "会社TEL" },
                        { value: "offfax", label: "会社FAX" },
                        { value: "offcell", label: "会社携帯" }
                      ]}
                      fieldOnEdit={`telephones[${index}].label`}
                      onChange={props.onChangeField}
                    />
                  </Grid>
                  <Grid item xs={1}></Grid>

                  <Grid item xs={6}>
                    <FieldEditBox
                      type="tel"
                      data={props.rec}
                      id={`telephones[${index}].number`}
                      placeholder="電話番号"
                      onChange={props.onChangeField}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={15}>
              &nbsp;
            </Grid>
          </Grid>
        ))}
      <Grid container>
        <Grid item sx={{ width: `${PictWidth}px` }}>
          <Fab
            size="small"
            aria-label="add"
            sx={{ ml: 9, color: "white", backgroundColor: "gray" }}
            onClick={() => {
              if (!props.rec.telephones)
                props.rec["telephones"] = [{ ...initialData }];
              else {
                props.rec.telephones.push({ ...initialData });
              }
              if (props.onChangeData) props.onChangeData(props.rec);
              setCount(count + 1);
            }}
          >
            <AddIcon />
          </Fab>
        </Grid>
      </Grid>
    </>
  );
};
// ----------------------------------------------------------------
// e-mailブロック

const EditBlockEMails = (props: EditBlockProp) => {
  const [count, setCount] = React.useState<number>(
    props.rec.emails ? props.rec.emails.length : 0
  );

  const initialData: EmailBlock = {
    kindof: "cell",
    address: "",
    label: ""
  };

  if (props.rec.emails) {
    if (!Array.isArray(props.rec.emails)) {
      props.rec.emails = [{ ...initialData }];
    }
    //console.log(`emails:${JSON.stringify(props.rec.emails)}`);
    if (props.rec.emails[0] === null) {
      props.rec.emails[0] = { ...initialData };
    }
  } else {
    props.rec.emails = [{ ...initialData }];
  }

  return (
    <>
      <BlockTitle title="メールアドレス" />

      {props.rec.emails &&
        props.rec.emails.map((addr, index) => (
          <Grid container>
            <Grid item sx={{ width: `${PictWidth}px` }}>
              <Fab
                size="small"
                aria-label="add"
                sx={{
                  ml: 9,
                  color: "white",
                  backgroundColor: "var(--col-offical)"
                }}
                onClick={() => {
                  if (props.rec.emails) {
                    delete props.rec.emails[index];
                    if (props.onChangeData) props.onChangeData(props.rec);
                  }
                  setCount(props.rec.emails ? props.rec.emails.length : 0);
                }}
              >
                <RemoveIcon />
              </Fab>
            </Grid>

            <Grid item sx={{ width: `calc( 100% - ${PictAreaWidth}px )` }}>
              <Paper
                component="form"
                sx={{
                  backgroundColor: bgcolEditBlock,
                  pb: 1
                }}
              >
                <Grid container={true} columns={15}>
                  {/* ------ 分類／メールアドレス ------ */}
                  <Grid item xs={5} sx={{ pl: 2 }}>
                    <FieldComboBox
                      data={props.rec}
                      id={`emails[${index}].kindof`}
                      placeholder="分類"
                      editable={true}
                      options={[
                        { value: "home", label: "Eメール[自宅]" },
                        { value: "cell", label: "Eメール[携帯]" },
                        { value: "office", label: "Eメール[会社]" }
                      ]}
                      fieldOnEdit={`emails[${index}].label`}
                      onChange={props.onChangeField}
                    />
                  </Grid>
                  <Grid item xs={1}></Grid>

                  <Grid item xs={6}>
                    <FieldEditBox
                      type="email"
                      data={props.rec}
                      id={`emails[${index}].number`}
                      placeholder="メールアドレス"
                      onChange={props.onChangeField}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={15}>
              &nbsp;
            </Grid>
          </Grid>
        ))}
      <Grid container>
        <Grid item sx={{ width: `${PictWidth}px` }}>
          <Fab
            size="small"
            aria-label="add"
            sx={{ ml: 9, color: "white", backgroundColor: "gray" }}
            onClick={() => {
              if (!props.rec.emails) props.rec["emails"] = [{ ...initialData }];
              else {
                props.rec.emails.push({ ...initialData });
              }
              if (props.onChangeData) props.onChangeData(props.rec);
              setCount(count + 1);
            }}
          >
            <AddIcon />
          </Fab>
        </Grid>
      </Grid>
    </>
  );
};

// ----------------------------------------------------------------
// webUrlブロック

const EditBlockWebUrls = (props: EditBlockProp) => {
  const [count, setCount] = React.useState<number>(
    props.rec.weburls ? props.rec.weburls.length : 0
  );

  const initialData: WebUrlBlock = {
    kindof: "profile",
    url: "",
    label: ""
  };

  if (props.rec.weburls) {
    if (!Array.isArray(props.rec.weburls)) {
      props.rec.weburls = [{ ...initialData }];
    }
    //console.log(`weburls:${JSON.stringify(props.rec.weburls)}`);
    if (props.rec.weburls[0] === null) {
      props.rec.weburls[0] = { ...initialData };
    }
  } else {
    props.rec.weburls = [{ ...initialData }];
  }

  return (
    <>
      <BlockTitle title="Webサイト" />

      {props.rec.weburls &&
        props.rec.weburls.map((addr, index) => (
          <Grid container>
            <Grid item sx={{ width: `${PictWidth}px` }}>
              <Fab
                size="small"
                aria-label="add"
                sx={{
                  ml: 9,
                  color: "white",
                  backgroundColor: "var(--col-offical)"
                }}
                onClick={() => {
                  if (props.rec.weburls) {
                    delete props.rec.weburls[index];
                    if (props.onChangeData) props.onChangeData(props.rec);
                  }
                  setCount(props.rec.weburls ? props.rec.weburls.length : 0);
                }}
              >
                <RemoveIcon />
              </Fab>
            </Grid>

            <Grid item sx={{ width: `calc( 100% - ${PictAreaWidth}px )` }}>
              <Paper
                component="form"
                sx={{
                  backgroundColor: bgcolEditBlock,
                  pb: 1
                }}
              >
                <Grid container={true} columns={15}>
                  {/* ------ 分類／メールアドレス ------ */}
                  <Grid item xs={5} sx={{ pl: 2 }}>
                    <FieldComboBox
                      data={props.rec}
                      id={`weburls[${index}].kindof`}
                      placeholder="分類"
                      editable={true}
                      options={[
                        { value: "profile", label: "プロフィール" },
                        { value: "blog", label: "ブログ" },
                        { value: "hp", label: "ホームページ" },
                        { value: "office", label: "会社" }
                      ]}
                      fieldOnEdit={`weburls[${index}].label`}
                      onChange={props.onChangeField}
                    />
                  </Grid>
                  <Grid item xs={1}></Grid>

                  <Grid item xs={6}>
                    <FieldEditBox
                      type="url"
                      data={props.rec}
                      id={`weburls[${index}].number`}
                      placeholder="URL"
                      onChange={props.onChangeField}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={15}>
              &nbsp;
            </Grid>
          </Grid>
        ))}
      <Grid container>
        <Grid item sx={{ width: `${PictWidth}px` }}>
          <Fab
            size="small"
            aria-label="add"
            sx={{ ml: 9, color: "white", backgroundColor: "gray" }}
            onClick={() => {
              if (!props.rec.weburls)
                props.rec["weburls"] = [{ ...initialData }];
              else {
                props.rec.weburls.push({ ...initialData });
              }
              if (props.onChangeData) props.onChangeData(props.rec);
              setCount(count + 1);
            }}
          >
            <AddIcon />
          </Fab>
        </Grid>
      </Grid>
    </>
  );
};

// 連名１つのブロック　fieldには joint_names[<index>] を指定
interface OneRenmeiProps extends EditBlockProp {
  index: number;
}
const EditBlockOneJointName = (props: OneRenmeiProps) => {
  const [detail, setDetail] = React.useState<boolean>(false);

  return (
    <Grid container>
      <Paper
        component="form"
        sx={{
          backgroundColor: bgcolEditBlock
        }}
      >
        <Grid container={true} columns={16}>
          {/* ------ 氏名の行 ------ */}
          <Grid item={true} xs={3} sx={{ pl: 2 }}>
            <EditFieldTitle title="氏名" />
          </Grid>
          <Grid item={true} xs={4} sx={{ px: 1 }}>
            <FieldEditBox
              data={props.rec}
              id={`joint_names[${props.index}].lastname`}
              placeholder="姓"
              onChange={props.onChangeField}
            />
          </Grid>
          <Grid item={true} xs={4} sx={{ px: 1 }}>
            <FieldEditBox
              data={props.rec}
              id={`joint_names[${props.index}].firstname`}
              placeholder="名"
              onChange={props.onChangeField}
            />
          </Grid>
          <Grid item={true} xs={4} sx={{ px: 1 }}>
            <FieldComboBox
              data={props.rec}
              id={`joint_names[${props.index}].suffix`}
              placeholder="敬称"
              editable={true}
              options={suffixOptins}
              onChange={props.onChangeField}
            />
          </Grid>

          {/* ------ フリガナの行 ------ */}
          <Grid item={true} xs={3} sx={{ pl: 2 }}>
            <EditFieldTitle title="フリガナ" />
          </Grid>
          <Grid item={true} xs={4} sx={{ px: 1 }}>
            <FieldEditBox
              data={props.rec}
              id={`joint_names[${props.index}].lastkana`}
              placeholder="姓フリガナ"
              onChange={props.onChangeField}
            />
          </Grid>
          <Grid item={true} xs={4} sx={{ px: 1 }}>
            <FieldEditBox
              data={props.rec}
              id={`joint_names[${props.index}].firstkana`}
              placeholder="名フリガナ"
              onChange={props.onChangeField}
            />
          </Grid>
          <Grid item={true} xs={3} sx={{ px: 1 }}></Grid>
          <Grid item={true} xs={2} sx={{ px: 0, mt: 0 }}>
            <div style={{ flexGrow: 1 }}></div>
            <SquareIconButton
              id=""
              variant="contained"
              sx={{ backgoundColor: "gray" }}
              onClick={(id) => {
                setDetail(!detail);
              }}
            >
              <Tooltip title={detail ? "詳細を閉じる" : "詳細を開く"}>
                {!detail ? <MoreHorizIcon /> : <KeyboardArrowUpIcon />}
              </Tooltip>
            </SquareIconButton>
          </Grid>

          <Grid item={true} xs={16} sx={{ px: 1 }}>
            <Divider />
          </Grid>

          {/* ------ 詳細の始まり ------ */}
          {detail && (
            <>
              {/* ------ 誕生日＆性別　の行 ------ */}
              <Grid item={true} xs={3} sx={{ pl: 2 }}>
                <EditFieldTitle title="誕生日" />
              </Grid>
              <Grid item={true} xs={5} sx={{ px: 1 }}>
                <FieldDatePicker
                  data={props.rec}
                  id={`joint_names[${props.index}].birthdate`}
                  placeholder="誕生日"
                  onChange={props.onChangeField}
                />
              </Grid>
              <Grid item={true} xs={3} sx={{ pl: 2 }}>
                <EditFieldTitle title="性別" />
              </Grid>
              <Grid item={true} xs={4} sx={{ px: 1 }}>
                <FieldComboBox
                  data={props.rec}
                  id={`joint_names[${props.index}].gender`}
                  placeholder="性別"
                  editable={false}
                  options={[
                    { value: "男性" },
                    { value: "女性" },
                    { value: "その他" }
                  ]}
                  onChange={props.onChangeField}
                />
              </Grid>

              <Grid item={true} xs={15} sx={{ px: 1 }}>
                &nbsp;
              </Grid>
            </>
          )}
        </Grid>
      </Paper>
    </Grid>
  );
};

// ----------------------------------------------------------------
// 連名ブロック

const EditBlockJointNames = (props: EditBlockProp) => {
  const [count, setCount] = React.useState<number>(
    props.rec.joint_names ? props.rec.joint_names.length : 0
  );

  const initialData: FamilyBlock = {
    lastname: "",
    firstname: "",
    lastkana: "",
    firstkana: "",
    suffix: "",
    gender: "",
    birthdate: ""
  };

  if (props.rec.joint_names) {
    if (!Array.isArray(props.rec.joint_names)) {
      props.rec.joint_names = [{ ...initialData }];
    }
    //console.log(`joint_names:${JSON.stringify(props.rec.joint_names)}`);
    if (props.rec.joint_names[0] === null) {
      props.rec.joint_names[0] = { ...initialData };
    }
  } else {
    props.rec.joint_names = [{ ...initialData }];
  }

  return (
    <>
      <BlockTitle title="連名" />

      {props.rec.joint_names &&
        props.rec.joint_names.map((name, index) => (
          <Grid container>
            <Grid item sx={{ width: `${PictWidth}px` }}>
              <Fab
                size="small"
                aria-label="add"
                sx={{
                  ml: 9,
                  color: "white",
                  backgroundColor: "var(--col-offical)"
                }}
                onClick={() => {
                  if (props.rec.joint_names) {
                    delete props.rec.joint_names[index];
                    if (props.onChangeData) props.onChangeData(props.rec);
                  }
                  setCount(
                    props.rec.joint_names ? props.rec.joint_names.length : 0
                  );
                }}
              >
                <RemoveIcon />
              </Fab>
            </Grid>

            <Grid item sx={{ width: `calc( 100% - ${PictAreaWidth}px )` }}>
              <EditBlockOneJointName
                index={index}
                abid={props.abid}
                rec={props.rec}
                onChangeField={props.onChangeField}
              />
            </Grid>
            <Grid item xs={15}>
              &nbsp;
            </Grid>
          </Grid>
        ))}
      <Grid container>
        <Grid item sx={{ width: `${PictWidth}px` }}>
          <Fab
            size="small"
            aria-label="add"
            sx={{ ml: 9, color: "white", backgroundColor: "gray" }}
            onClick={() => {
              if (!props.rec.joint_names)
                props.rec["joint_names"] = [{ ...initialData }];
              else {
                props.rec.joint_names.push({ ...initialData });
              }
              if (props.onChangeData) props.onChangeData(props.rec);
              setCount(count + 1);
            }}
          >
            <AddIcon />
          </Fab>
        </Grid>
      </Grid>
    </>
  );
};
// ----------------------------------------------------------------

type ABRecEditStateType = {
  abid: string;
  recid: string;
  name: string;
  command?: "editing" | "save" | "save_and_new" | "delete";
  status?: "loading" | "fetching" | "progress" | "success" | "error";
  statusText?: string;
  data?: RecordType;
};

const ABEditRecordInner = (props: {
  rec: ABRecEditStateType;
  onEndEdit: () => void;
}) => {
  const user = useContext(UserContext);

  const [info, setInfo] = React.useState<ABRecEditStateType>({
    abid: props.rec.abid,
    recid: props.rec.recid,
    name: props.rec.name,
    command: props.rec.command,
    status: "loading",
    statusText: "",
    data: props.rec.data
  });
  const [progress, setProgress] = React.useState(false);

  if (props.rec.abid !== info.abid || props.rec.recid !== info.recid) {
    //console.log(`id-changed:${info.abid} to ${props.rec.recid}`);
    setInfo({
      abid: props.rec.abid,
      recid: props.rec.recid,
      name: props.rec.name,
      command: props.rec.command,
      status: "loading",
      statusText: "",
      data: props.rec.data
    });
  }
  const [msgbox, setMsgbox] = React.useState<MessageBoxProps>({
    open: false,
    caption: "",
    message: ""
  });

  const cancelMsgBox = () => {
    setMsgbox({ ...msgbox, open: false });
  };

  if (props.rec.command && props.rec.command !== info.command) {
    //console.log(
    //  `id:${info.abid}:::info.command=${info.command}, props.rec.command=${props.rec.command}`
    //);
    setInfo({ ...info, command: props.rec.command, status: "progress" });
  }

  if (info.command && info.status === "progress") {
    if (info.command === "save" || info.command === "save_and_new") {
      if (progress === false) {
        setProgress(true);

        console.log(
          `id:${info.abid}:rec:${info.recid}::command:${info.command}`
        );

        let postdata = { ...info.data };
        let method: "GET" | "POST" | "PUT" = "PUT";
        let url = user.getEpt();
        if (isHomeAddress(info.abid)) {
          url += "/homeaddresses";
        } else {
          url += `/addresses`;
        }

        if (info.recid === "new") {
          method = "POST";
          delete postdata["id"];

          postdata["group_id"] = info.abid;
          console.log(`saving->${JSON.stringify(postdata)}`);
        } else {
          url += `/${info.recid}`;
        }

        let params = {};
        if (info.data && "etag" in info.data) {
          params["If-Match"] = info.data["etag"];
        }
        user.FetchWithRefreshedRetry(
          url,
          method,
          (json) => {
            setInfo({ ...info, status: "success" });
            setProgress(false);
            //console.log(`save->${JSON.stringify(json)}`);
            if ("data" in json === false) {
              let error: string =
                json["error"] || json["statusText"] || "load error";
              let mbinfo: MessageBoxProps = {
                open: true,
                caption: "保存に失敗しました",
                message: error,
                icon: "error",
                options: [
                  {
                    text: "OK",
                    handler: cancelMsgBox
                  }
                ],
                onCancel: cancelMsgBox
              };
              setMsgbox(mbinfo);
            } else {
              props.onEndEdit();
            }
          },
          {
            params: params,
            postdata: postdata
          }
        );
      }
    }
  }

  if (info.status === "loading") {
    if (props.rec.recid === "new") {
      setInfo({ ...info, status: "success" });
    } else if (info.data && info.data.code) {
      setInfo({ ...info, status: "success" });
    } else {
      setInfo({ ...info, status: "fetching" });
      loadRecord(user, props.rec.abid, props.rec.recid, (json) => {
        if ("data" in json) {
          setInfo({ ...info, status: "success", data: json["data"] });
        } else {
          let error = json["error"] || json["statusText"] || "load error";
          setInfo({ ...info, status: "error", statusText: error });
        }
      });
    }
  }

  const editCallback = (field: string, value: string) => {
    let newval: RecordType = {
      ...info.data,
      id: info.data ? info.data.id : ""
    };
    const rp = ReformField(newval, field);
    rp.data[rp.field] = value;
    setInfo({ ...info, data: newval });
    //console.log(`${field}=${value}`);
  };
  const adddelCallback = (rec: {}) => {
    let newval: RecordType = {
      ...rec,
      id: info.data ? info.data.id : ""
    };

    setInfo({ ...info, data: newval });
  };

  let cont = <></>;
  if (info.status === "loading" || info.status === "fetching") {
    cont = (
      <Box sx={{ width: "calc( 80vw )", mt: 10, textAlign: "center" }}>
        <div className="textcenter">loading...</div>
        <CircularProgress />
      </Box>
    );
  } else if (info.status === "success" || info.status === "progress") {
    const rec: RecordType = info.data ? info.data : { id: "" };

    //createData("name", name), createData("dessert", "Cupcake")];
    cont = (
      <div className="editConts">
        <EditBlockName
          abid={info.abid}
          rec={rec}
          onChangeField={editCallback}
        />
        <EditBlockOrg abid={info.abid} rec={rec} onChangeField={editCallback} />
        <Divider sx={{ mt: 1 }} />
        <EditBlockAddresses
          abid={info.abid}
          rec={rec}
          onChangeField={editCallback}
          onChangeData={adddelCallback}
        />

        <Divider sx={{ mt: 1 }} />
        <EditBlockTelephones
          abid={info.abid}
          rec={rec}
          onChangeField={editCallback}
          onChangeData={adddelCallback}
        />

        <Divider sx={{ mt: 1 }} />
        <EditBlockEMails
          abid={info.abid}
          rec={rec}
          onChangeField={editCallback}
          onChangeData={adddelCallback}
        />
        <Divider sx={{ mt: 1 }} />
        <EditBlockWebUrls
          abid={info.abid}
          rec={rec}
          onChangeField={editCallback}
          onChangeData={adddelCallback}
        />

        <Divider sx={{ mt: 1 }} />
        <EditBlockJointNames
          abid={info.abid}
          rec={rec}
          onChangeField={editCallback}
          onChangeData={adddelCallback}
        />
        <PopupProgress open={progress} type="circle" />
        <MessageBox {...msgbox} />
      </div>
    );
  } else if (info.status === "error") {
    cont = (
      <div style={{ width: "calc( 80vw )" }}>
        <h3>failed</h3>
        <p>{info.statusText}</p>
      </div>
    );
  }
  return <>{cont}</>;
};

export type ABEditRecordProps = {
  rec: ABRecEditStateType;
  onEndEdit: () => void;
};

const ABEditRecord = (props: {
  rec: ABRecEditStateType;
  onEndEdit: () => void;
}) => {
  const [rec, setRec] = React.useState({ ...props.rec });

  const fireCommand = (command: "save" | "save_and_new" | "delete") => {
    if (command === "delete") {
      if (rec.recid !== "new") {
      }
    } else {
      setRec({ ...rec, command: command });
    }
  };

  type buttonsProps = {
    caption?: string;
    icon?: typeof SvgIcon;
    variant: "contained" | "outlined" | "text";
    onClick: (param?: any) => void;
    onClickParam?: string;
  };
  let buttons: buttonsProps[] = [
    {
      caption: "戻る",
      variant: "outlined",
      onClick: props.onEndEdit
    },
    {
      caption: "保存",
      variant: "contained",
      onClick: fireCommand,
      onClickParam: "save"
    },
    {
      caption: "保存して新規作成",
      variant: "contained",
      onClick: fireCommand,
      onClickParam: "save_and_new"
    },
    {
      caption: "",
      icon: DeleteForeverIcon,
      variant: "outlined",
      onClick: fireCommand,
      onClickParam: "delete"
    }
  ];

  return (
    <>
      <Box sx={{ width: "100%", align: "left" }}>
        {buttons.map((button) => {
          return (
            <Button
              sx={{ mr: 1 }}
              variant={button.variant}
              onClick={() => {
                button.onClick(button.onClickParam);
              }}
            >
              {button.icon && <button.icon />}
              {button.caption && button.caption}
            </Button>
          );
        })}
      </Box>

      <Box>
        <h3>レコードの編集</h3>
      </Box>

      <ABEditRecordInner rec={rec} onEndEdit={props.onEndEdit} />
    </>
  );
};

export { ABRecEditStateType, ABEditRecord };

import * as React from "react";

import Box from "@mui/material/Box";
//book
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
//home
import OtherHousesIcon from "@mui/icons-material/OtherHouses";
//people
import GroupsIcon from "@mui/icons-material/Groups";
//building
import ApartmentIcon from "@mui/icons-material/Apartment";
//office
import BusinessIcon from "@mui/icons-material/Business";
//school
import SchoolIcon from "@mui/icons-material/School";
//hospital
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
//store
import StorefrontIcon from "@mui/icons-material/Storefront";
//meal
import RestaurantIcon from "@mui/icons-material/Restaurant";
//laggage
import LuggageIcon from "@mui/icons-material/Luggage";
//shopping
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
//music
import QueueMusicIcon from "@mui/icons-material/QueueMusic";
//soccor
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
//clover
import InterestsIcon from "@mui/icons-material/Interests";
//heart
import FavoriteIcon from "@mui/icons-material/Favorite";
//tree
import ForestIcon from "@mui/icons-material/Forest";

import { SvgIcon } from "@mui/material";

export const iconlist: { [name: string]: typeof SvgIcon } = {
  book: LibraryBooksIcon,
  home: OtherHousesIcon,
  people: GroupsIcon,
  building: ApartmentIcon,
  office: BusinessIcon,
  school: SchoolIcon,
  hospital: LocalHospitalIcon,
  store: StorefrontIcon,
  meal: RestaurantIcon,
  laggage: LuggageIcon,
  shopping: ShoppingCartIcon,
  music: QueueMusicIcon,
  soccor: SportsSoccerIcon,
  clover: InterestsIcon,
  heart: FavoriteIcon,
  tree: ForestIcon
};

export const ABIcon = (props: { name: string; sx?: {} }) => {
  let icon: { [name: string]: typeof SvgIcon } = {
    abicon: iconlist[props.name] || iconlist.book
  };
  // ↑ よく分からんのだが、 let abicon = ... だと↓がエラー　objectで括ったらうまく行った

  let sx = { ...props.sx };
  if ("color" in sx && sx["color"] && sx["color"].length) {
    sx["color"] = `#${sx["color"]}`;
  } else {
    sx["color"] = "#d7000f";
  }

  return <icon.abicon sx={sx} />;
};

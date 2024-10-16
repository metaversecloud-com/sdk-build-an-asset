import { themes } from "@/constants";

export const getThemeData = () => {
  const pathname = window.location.pathname;
  const themeName = pathname.split("/")[1];
  return themes[themeName];
};

export const getThemeNames = () => {
  return Object.keys(themes);
};

export const getThemeName = () => {
  const pathname = window.location.pathname;
  const themeName = pathname.split("/")[1];
  return themeName;
};

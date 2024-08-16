import { session } from "../reducers/session";
import { push } from "redux-first-history";
import { getThemeName } from "../../themeData2.js";
import axios from "axios";
import { getQueryParams } from "./getQueryParams.js";

export const claimAsset = (visitor) => async (dispatch) => {
  try {
    const queryParams = getQueryParams();

    const url = `/api/asset/claim?${queryParams}`;
    const response = await axios.post(url);

    if (response.status === 200) {
      const { username } = visitor;
      const modifiedName = username.replace(/ /g, "%20");

      const themeName = getThemeName();

      const redirectPath = `${themeName}/claimed?visitor-name=${modifiedName}`;

      const fullPath = `/${redirectPath}&${queryParams}&edit=true`;
      return dispatch(push(fullPath));
    }
  } catch (error) {
    console.error(error);
    return false;
  }
};

import { session } from "../reducers/session";
import { push } from "redux-first-history";
import { getThemeName } from "../../themeData2.js";
import axios from "axios";
import { getQueryParams } from "./getQueryParams.js";

export const { setSpawnSuccess, setError } = session.actions;

export const clearAllAssets = () => async (dispatch) => {
  try {
    const themeName = getThemeName();
    const queryParams = getQueryParams();
    const url = `/api/asset/clear-all?${queryParams}`;
    const response = await axios.put(url);

    if (response.status === 200) {
      dispatch(setSpawnSuccess(response?.data));
      return dispatch(push(`/${themeName}?${queryParams}`));
    }
  } catch (error) {
    dispatch(setError(`There was an error while clearing all assets`));
    return false;
  }
};

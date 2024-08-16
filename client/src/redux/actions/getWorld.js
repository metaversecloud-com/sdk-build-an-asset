import { session } from "../reducers/session";
import axios from "axios";
import { getQueryParams } from "./getQueryParams.js";

export const { setDroppedAssetAndVisitor } = session.actions;

export const getWorld = () => async (dispatch) => {
  try {
    const queryParams = getQueryParams();
    const url = `/api/asset/world?${queryParams}`;

    const response = await axios.get(url);

    if (response.status === 200) {
      dispatch(setDroppedAssetAndVisitor(response?.data));
    }
  } catch (error) {
    console.error("error", error);
  }
};

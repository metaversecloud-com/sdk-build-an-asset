import axios from "axios";
import { getQueryParams } from "./getQueryParams.js";

export const moveToAsset = (closeIframeAfterMove) => async (dispatch) => {
  try {
    const queryParams = getQueryParams();
    const url = `/api/asset/move-to-asset?${queryParams}`;

    await axios.post(url, { closeIframeAfterMove });
  } catch (error) {
    console.error("error", error);
  }
};

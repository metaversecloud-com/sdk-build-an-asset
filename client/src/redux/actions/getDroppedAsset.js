import axios from "axios";
import { getQueryParams } from "./getQueryParams.js";

export const getDroppedAsset = async () => {
  try {
    const queryParams = getQueryParams();
    const url = `/api/asset/dropped-asset?${queryParams}`;

    const response = await axios.get(url);

    return response?.data?.droppedAsset;
  } catch (error) {
    console.error("error", error);
  }
};

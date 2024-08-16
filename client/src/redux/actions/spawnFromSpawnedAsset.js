import { session } from "../reducers/session";
import axios from "axios";
import { getQueryParams } from "./getQueryParams.js";

export const { setSpawnSuccess, setError } = session.actions;

export const spawnFromSpawnedAsset =
  (completeImageName) => async (dispatch) => {
    try {
      const queryParams = getQueryParams();
      const url = `/api/asset/spawn-from-spawned-asset?${queryParams}`;
      const response = await axios.post(url, { completeImageName });

      if (response.status === 200) {
        dispatch(setSpawnSuccess(response?.data?.spawnSuccess));
      }
    } catch (error) {
      dispatch(setError("There was an error while spawning the asset"));
      return false;
    }
  };

import { session } from "../reducers/session";
import axios from "axios";
import { getQueryParams } from "./getQueryParams.js";

export const { setVisitor, setError } = session.actions;

export const getVisitor = () => async (dispatch) => {
  try {
    const queryParams = getQueryParams();

    const response = await axios.get(`/api/visitor?${queryParams}`);

    if (response.status === 200) {
      dispatch(setVisitor(response.data.visitor));
    }
  } catch (error) {
    dispatch(setError("There was an error when getting the user content."));
  }
};

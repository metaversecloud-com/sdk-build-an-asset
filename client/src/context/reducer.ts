import {
  ActionType,
  InitialState,
  SET_HAS_SETUP_BACKEND,
  SET_INTERACTIVE_PARAMS,
  SET_ERROR,
  SET_SPAWN_SUCCESS,
  SET_VISITOR_AND_WORLD,
} from "./types";

const globalReducer = (state: InitialState, action: ActionType) => {
  const { type, payload } = action;
  switch (type) {
    case SET_INTERACTIVE_PARAMS:
      return {
        ...state,
        ...payload,
        hasInteractiveParams: true,
      };
    case SET_HAS_SETUP_BACKEND:
      return {
        ...state,
        ...payload,
        hasSetupBackend: true,
      };
    case SET_ERROR:
      return {
        ...state,
        error: payload.error,
      };
    case SET_SPAWN_SUCCESS:
      return {
        ...state,
        ...payload,
      };
    case SET_VISITOR_AND_WORLD:
      return {
        ...state,
        ...payload,
      };

    default: {
      throw new Error(`Unhandled action type: ${type}`);
    }
  }
};

export { globalReducer };

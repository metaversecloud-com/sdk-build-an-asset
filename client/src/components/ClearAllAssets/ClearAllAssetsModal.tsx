import { useContext, useState } from "react";

// context
import { GlobalDispatchContext } from "@context/GlobalContext";
import { SET_ERROR, SET_SPAWN_SUCCESS } from "@/context/types.js";

// utils
import { getThemeData } from "@/utils/themes.js";
import { backendAPI } from "@/utils/backendAPI.js";
import { capitalize } from "@/utils/capitalize.js";

export const ClearAllAssetsModal = ({
  handleToggleShowClearAllAssetsModal,
}: {
  handleToggleShowClearAllAssetsModal: () => void;
}) => {
  const dispatch = useContext(GlobalDispatchContext);

  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false);

  const { clearButtonType, namePlural } = getThemeData();
  const actionType = clearButtonType === "pickup" ? "Pickup" : "Clear";

  const handleClearAllAssets = () => {
    setAreButtonsDisabled(true);

    backendAPI
      .post(`/dropped-assets/clear-all`, { shouldDelete: clearButtonType === "pickup" })
      .then((response) => {
        dispatch!({
          type: SET_SPAWN_SUCCESS,
          payload: response.data,
        });
      })
      .catch((error) => {
        console.error(error);
        dispatch!({
          type: SET_ERROR,
          payload: { error: "There was an error while clearing all assets" },
        });
      })
      .finally(() => {
        setAreButtonsDisabled(false);
        handleToggleShowClearAllAssetsModal();
      });
  };

  return (
    <div className="modal-container">
      <div className="modal">
        <h4>
          {actionType} <b>all</b> {capitalize(namePlural)}
        </h4>
        <p>Are you sure you'd like to continue?</p>
        <div className="actions">
          <button
            id="close"
            className="btn btn-outline"
            onClick={() => handleToggleShowClearAllAssetsModal()}
            disabled={areButtonsDisabled}
          >
            Close
          </button>
          <button className="btn btn-danger" onClick={() => handleClearAllAssets()} disabled={areButtonsDisabled}>
            {actionType} All
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClearAllAssetsModal;

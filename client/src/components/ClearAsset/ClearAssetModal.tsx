import { useContext, useState } from "react";

// context
import { GlobalDispatchContext } from "@context/GlobalContext";
import { SET_ERROR, SET_SPAWN_SUCCESS } from "@/context/types.js";

// utils
import { backendAPI, getThemeData, getThemeName } from "@/utils";

export const ClearAssetModal = ({
  handleToggleShowClearAssetModal,
  isClearAssetFromUnclaimedAsset,
}: {
  handleToggleShowClearAssetModal: () => void;
  isClearAssetFromUnclaimedAsset: boolean;
}) => {
  const dispatch = useContext(GlobalDispatchContext);
  const themeName = getThemeName();
  const { clearButtonType, texts } = getThemeData();
  const { clearAssetDescription } = texts;
  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false);

  const handleClearAsset = () => {
    setAreButtonsDisabled(true);

    const url = clearButtonType === "pickup" ? `/dropped-assets/pickup` : `/dropped-assets/clear`;

    backendAPI
      .post(url, {
        isClearAssetFromUnclaimedAsset,
      })
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
          payload: { error: "There was an error while clearing the assets" },
        });
      })
      .finally(() => {
        setAreButtonsDisabled(false);
        handleToggleShowClearAssetModal();
      });
  };

  return (
    <div className="modal-container">
      <div className="modal">
        <h4>Clear {themeName}</h4>
        <p>{clearAssetDescription}.</p>
        <div className="actions">
          <button
            id="close"
            className="btn btn-outline"
            onClick={() => handleToggleShowClearAssetModal()}
            disabled={areButtonsDisabled}
          >
            No
          </button>
          <button className="btn  btn-danger-outline" onClick={() => handleClearAsset()} disabled={areButtonsDisabled}>
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClearAssetModal;

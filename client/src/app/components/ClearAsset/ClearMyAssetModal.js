import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { clearThemeAsset } from "../../../redux/actions/asset.js";
import { getThemeName } from "../../../redux/themeData2.js";

function ClearMyAssetModal({
  handleToggleShowClearAssetModal,
  isClearAssetFromUnclaimedAsset,
}) {
  const dispatch = useDispatch();
  const themeName = getThemeName();
  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false);

  const handleClearAsset = async () => {
    try {
      setAreButtonsDisabled(true);
      await dispatch(clearThemeAsset(isClearAssetFromUnclaimedAsset));
    } catch (error) {
      console.error(error);
    } finally {
      setAreButtonsDisabled(false);
      handleToggleShowClearAssetModal();
    }
  };

  return (
    <div className="topia-modal-container visible">
      <div className="topia-modal">
        <h4>Empty {themeName}</h4>
        <p>
          If you clear your asset, it will be emptied and unclaimed. You can
          then choose a new asset.
        </p>
        <div className="actions">
          <button
            id="close"
            className="btn-outline"
            onClick={() => handleToggleShowClearAssetModal()}
            disabled={areButtonsDisabled}
          >
            No
          </button>
          <button
            className="btn-danger-outline"
            onClick={() => handleClearAsset()}
            disabled={areButtonsDisabled}
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClearMyAssetModal;

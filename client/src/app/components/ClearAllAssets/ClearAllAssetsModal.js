import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearAllThemeAssets } from "../../../redux/actions/asset.js";
import { capitalize } from "../../../utils/utils.js";
import { getThemeName } from "../../../redux/themeData2.js";

function ClearAllCustomizedAssetsModal({
  handleToggleShowClearAllAssetsModal,
}) {
  const dispatch = useDispatch();
  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false);
  const themeName = getThemeName();

  const handleClearAllAssets = async () => {
    try {
      setAreButtonsDisabled(true);
      await dispatch(clearAllThemeAssets());
      handleToggleShowClearAllAssetsModal();
    } catch (error) {
      console.error(error);
    } finally {
      setAreButtonsDisabled(false);
      handleToggleShowClearAllAssetsModal();
    }
  };

  return (
    <div id="" class="topia-modal-container visible">
      <div className="topia-modal">
        <h4>
          Empty <b>all</b> {capitalize(themeName)}s
        </h4>
        <p>Are you sure you'd like to continue?</p>
        <div className="actions">
          <button
            id="close"
            className="btn-outline"
            onClick={() => handleToggleShowClearAllAssetsModal()}
            disabled={areButtonsDisabled}
          >
            Close
          </button>
          <button
            className="btn-danger"
            onClick={() => handleClearAllAssets()}
            disabled={areButtonsDisabled}
          >
            Empty All
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClearAllCustomizedAssetsModal;

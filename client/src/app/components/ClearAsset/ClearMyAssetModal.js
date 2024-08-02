import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { clearThemeAsset } from "../../../redux/actions/asset.js";

function ClearMyAssetModal({
  handleToggleShowClearLockerModal,
  isClearAssetFromUnclaimedLocker,
}) {
  const dispatch = useDispatch();
  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false);

  const handleClearLocker = async () => {
    try {
      setAreButtonsDisabled(true);
      await dispatch(clearThemeAsset(isClearAssetFromUnclaimedLocker));
    } catch (error) {
      console.error(error);
    } finally {
      setAreButtonsDisabled(false);
      handleToggleShowClearLockerModal();
    }
  };

  return (
    <div className="topia-modal-container visible">
      <div className="topia-modal">
        <h4>Empty Locker</h4>
        <p>
          If you clear your locker, it will be emptied and unclaimed. You can
          then choose a new locker.
        </p>
        <div className="actions">
          <button
            id="close"
            className="btn-outline"
            onClick={() => handleToggleShowClearLockerModal()}
            disabled={areButtonsDisabled}
          >
            No
          </button>
          <button
            className="btn-danger-outline"
            onClick={() => handleClearLocker()}
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
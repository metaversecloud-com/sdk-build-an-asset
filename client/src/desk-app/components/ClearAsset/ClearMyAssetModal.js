import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { clearDesk } from "../../../redux/actions/desk.js";

function ClearMyAssetModal({
  handleToggleShowClearDeskModal,
  isClearAssetFromUnclaimedDesk,
}) {
  const dispatch = useDispatch();
  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false);

  const handleClearDesk = async () => {
    try {
      setAreButtonsDisabled(true);
      await dispatch(clearDesk(isClearAssetFromUnclaimedDesk));
    } catch (error) {
      console.error(error);
    } finally {
      setAreButtonsDisabled(false);
      handleToggleShowClearDeskModal();
    }
  };

  return (
    <div className="topia-modal-container visible">
      <div className="topia-modal">
        <h4>Empty Desk</h4>
        <p>
          If you clear your desk, it will be emptied and unclaimed. You can then
          choose a new desk.
        </p>
        <div className="actions">
          <button
            id="close"
            className="btn-outline"
            onClick={() => handleToggleShowClearDeskModal()}
            disabled={areButtonsDisabled}
          >
            No
          </button>
          <button
            className="btn-danger-outline"
            onClick={() => handleClearDesk()}
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

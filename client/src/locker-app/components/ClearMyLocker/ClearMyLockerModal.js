import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearLocker } from "../../../redux/actions/locker.js";

function ClearMyLockerButtonModal({
  handleToggleShowClearLockerModal,
  isClearMyLockerFromUnclaimedLocker,
}) {
  const dispatch = useDispatch();
  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false);

  const handleClearLocker = async () => {
    try {
      setAreButtonsDisabled(true);
      await dispatch(clearLocker(isClearMyLockerFromUnclaimedLocker));
      handleToggleShowClearLockerModal();
    } catch (error) {
      console.error(error);
    } finally {
      setAreButtonsDisabled(false);
      handleToggleShowClearLockerModal();
    }
  };

  return (
    <div id="" class="topia-modal-container visible">
      <div className="topia-modal">
        <h4>Clear locker</h4>
        <p>Are you sure you'd like to continue?</p>
        <div className="actions">
          <button
            id="close"
            className="btn-outline"
            onClick={() => handleToggleShowClearLockerModal()}
            disabled={areButtonsDisabled}
          >
            Close
          </button>
          <button
            className="btn-danger-outline"
            onClick={() => handleClearLocker()}
            disabled={areButtonsDisabled}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClearMyLockerButtonModal;

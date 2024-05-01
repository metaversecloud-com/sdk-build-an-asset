import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearAllLockers } from "../../../redux/actions/locker.js";

function ClearAllLockersButtonModal({ handleToggleShowClearAllLockersModal }) {
  const dispatch = useDispatch();
  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false);

  const handleClearAllLockers = async () => {
    try {
      setAreButtonsDisabled(true);
      await dispatch(clearAllLockers());
      handleToggleShowClearAllLockersModal();
    } catch (error) {
      console.error(error);
    } finally {
      setAreButtonsDisabled(false);
      handleToggleShowClearAllLockersModal();
    }
  };

  return (
    <div id="" class="topia-modal-container visible">
      <div className="topia-modal">
        <h4>
          Clear <b>all</b> lockers
        </h4>
        <p>Are you sure you'd like to continue?</p>
        <div className="actions">
          <button
            id="close"
            className="btn-outline"
            onClick={() => handleToggleShowClearAllLockersModal()}
            disabled={areButtonsDisabled}
          >
            Close
          </button>
          <button
            className="btn-danger"
            onClick={() => handleClearAllLockers()}
            disabled={areButtonsDisabled}
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClearAllLockersButtonModal;

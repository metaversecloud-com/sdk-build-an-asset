import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearAllDesks } from "../../../redux/actions/desk.js";

function ClearAllDesksButtonModal({ handleToggleShowClearAllDesksModal }) {
  const dispatch = useDispatch();
  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false);

  const handleClearAllDesks = async () => {
    try {
      setAreButtonsDisabled(true);
      await dispatch(clearAllDesks());
      handleToggleShowClearAllDesksModal();
    } catch (error) {
      console.error(error);
    } finally {
      setAreButtonsDisabled(false);
      handleToggleShowClearAllDesksModal();
    }
  };

  return (
    <div id="" class="topia-modal-container visible">
      <div className="topia-modal">
        <h4>
          Empty <b>all</b> Desks
        </h4>
        <p>Are you sure you'd like to continue?</p>
        <div className="actions">
          <button
            id="close"
            className="btn-outline"
            onClick={() => handleToggleShowClearAllDesksModal()}
            disabled={areButtonsDisabled}
          >
            Close
          </button>
          <button
            className="btn-danger"
            onClick={() => handleClearAllDesks()}
            disabled={areButtonsDisabled}
          >
            Empty All
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClearAllDesksButtonModal;

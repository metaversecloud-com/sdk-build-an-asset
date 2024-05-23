import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { moveToAsset } from "../../../redux/actions/locker";

function MoveToLockerButton({ closeIframeAfterMove }) {
  const dispatch = useDispatch();

  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false);

  const handleMoveToMyLocker = async () => {
    try {
      setAreButtonsDisabled(true);
      await dispatch(moveToAsset(closeIframeAfterMove));
    } catch (error) {
      console.error(error);
    } finally {
      setAreButtonsDisabled(false);
    }
  };

  return (
    <>
      <button
        className="btn-outline"
        disabled={areButtonsDisabled}
        onClick={() => handleMoveToMyLocker()}
      >
        Find Locker
      </button>
    </>
  );
}

export default MoveToLockerButton;

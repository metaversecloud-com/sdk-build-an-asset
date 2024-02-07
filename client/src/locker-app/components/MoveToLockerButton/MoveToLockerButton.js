import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { moveToAsset } from "../../../redux/actions/locker";

function MoveToLockerButton() {
  const dispatch = useDispatch();

  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false);

  const handleMoveToMyLocker = async () => {
    try {
      setAreButtonsDisabled(true);
      await dispatch(moveToAsset());
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
        Move to my locker
      </button>
    </>
  );
}

export default MoveToLockerButton;

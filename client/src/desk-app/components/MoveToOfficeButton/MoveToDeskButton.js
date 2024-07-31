import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { moveToAsset } from "../../../redux/actions/desk";

function MoveToDeskButton({ closeIframeAfterMove }) {
  const dispatch = useDispatch();

  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false);

  const handleMoveToMyDesk = async () => {
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
        onClick={() => handleMoveToMyDesk()}
      >
        Find Desk
      </button>
    </>
  );
}

export default MoveToDeskButton;

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { moveToAsset } from "../../../redux/actions/asset";
import { getThemeName } from "../../../themeData2";

function MoveToAssetButton({ closeIframeAfterMove }) {
  const dispatch = useDispatch();
  const themeName = getThemeName();
  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false);

  const handleMoveToMyAsset = async () => {
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
        onClick={() => handleMoveToMyAsset()}
      >
        Find {themeName}
      </button>
    </>
  );
}

export default MoveToAssetButton;

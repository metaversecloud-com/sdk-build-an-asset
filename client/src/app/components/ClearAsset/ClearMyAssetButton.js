import React from "react";
import { getThemeName } from "../../../themeData2";

function ClearMyAssetButton({ handleToggleShowClearAssetModal, fromAdmin }) {
  const themeName = getThemeName();
  return (
    <>
      <button
        className={fromAdmin ? "btn-danger-outline" : "btn-danger"}
        onClick={() => handleToggleShowClearAssetModal()}
      >
        {fromAdmin ? (
          <span>Empty this {themeName}</span>
        ) : (
          <span>Empty {themeName}</span>
        )}
      </button>
    </>
  );
}

export default ClearMyAssetButton;

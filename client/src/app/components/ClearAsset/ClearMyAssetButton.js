import React from "react";
import { getThemeData, getThemeName } from "../../../themeData2";

function ClearMyAssetButton({ handleToggleShowClearAssetModal, fromAdmin }) {
  const themeName = getThemeName();
  const themeData = getThemeData();
  return (
    <>
      <button
        className={fromAdmin ? "btn-danger-outline" : "btn-danger"}
        onClick={() => handleToggleShowClearAssetModal()}
      >
        {fromAdmin ? (
          <span>{themeData.texts.clearAssetButtonAdmin}</span>
        ) : (
          <span>{themeData.texts.clearAssetButtonGeneral}</span>
        )}
      </button>
    </>
  );
}

export default ClearMyAssetButton;

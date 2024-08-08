import React, { useState } from "react";
import { capitalize } from "../../../utils/utils";
import { getThemeName } from "../../../themeData2";

function ClearAllCustomizedAssetsButton({
  handleToggleShowClearAllAssetsModal,
}) {
  const themeName = getThemeName();
  return (
    <>
      <button
        className="btn-danger"
        onClick={() => handleToggleShowClearAllAssetsModal()}
      >
        <span>Empty all {capitalize(themeName)}s</span>
      </button>
    </>
  );
}

export default ClearAllCustomizedAssetsButton;

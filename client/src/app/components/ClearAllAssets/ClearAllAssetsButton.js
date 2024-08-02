import React, { useState } from "react";
import { capitalize } from "../../../utils/utils";
import { getThemeName } from "../../../redux/themeData2";

function ClearAllCustomizedAssetsButton({
  handleToggleShowClearAllAssetsModal,
}) {
  const themeName = getThemeName();
  return (
    <>
      <button
        class="btn-danger"
        onClick={() => handleToggleShowClearAllAssetsModal()}
      >
        <span>Empty all {capitalize(themeName)}s</span>
      </button>
    </>
  );
}

export default ClearAllCustomizedAssetsButton;

import React, { useState } from "react";

function ClearAllCustomizedAssetsButton({
  handleToggleShowClearAllAssetsModal,
}) {
  return (
    <>
      <button
        class="btn-danger"
        onClick={() => handleToggleShowClearAllAssetsModal()}
      >
        <span>Empty all Assets</span>
      </button>
    </>
  );
}

export default ClearAllCustomizedAssetsButton;

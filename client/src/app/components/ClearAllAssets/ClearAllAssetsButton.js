import React, { useState } from "react";

function ClearAllCustomizedAssetsButton({
  handleToggleShowClearAllLockersModal,
}) {
  return (
    <>
      <button
        class="btn-danger"
        onClick={() => handleToggleShowClearAllLockersModal()}
      >
        <span>Empty all Lockers</span>
      </button>
    </>
  );
}

export default ClearAllCustomizedAssetsButton;

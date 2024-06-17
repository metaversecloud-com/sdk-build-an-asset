import React, { useState } from "react";

function ClearAllLockersButton({ handleToggleShowClearAllLockersModal }) {
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

export default ClearAllLockersButton;

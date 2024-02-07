import React, { useState } from "react";

function ClearAllLockersButton({ handleToggleShowClearAllLockersModal }) {
  return (
    <>
      <button
        class="btn-danger"
        onClick={() => handleToggleShowClearAllLockersModal()}
      >
        <span>
          Clear <b>all</b> lockers
        </span>
      </button>
    </>
  );
}

export default ClearAllLockersButton;

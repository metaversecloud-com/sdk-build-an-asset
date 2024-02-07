import React, { useState } from "react";

function ClearMyLockerButton({ handleToggleShowClearLockerModal, fromAdmin }) {
  return (
    <>
      <button
        class="btn-danger-outline"
        onClick={() => handleToggleShowClearLockerModal()}
      >
        {fromAdmin ? (
          <span>
            Clear <b>this</b> locker
          </span>
        ) : (
          <span>Clear my locker</span>
        )}
      </button>
    </>
  );
}

export default ClearMyLockerButton;

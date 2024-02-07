import React from "react";

function ClearMyLockerButton({ handleToggleShowClearLockerModal, fromAdmin }) {
  return (
    <>
      <button
        className={fromAdmin ? "btn-danger-outline" : "btn-danger"}
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

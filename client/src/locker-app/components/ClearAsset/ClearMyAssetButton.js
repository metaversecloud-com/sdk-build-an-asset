import React from "react";

function ClearMyAssetButton({ handleToggleShowClearLockerModal, fromAdmin }) {
  return (
    <>
      <button
        className={fromAdmin ? "btn-danger-outline" : "btn-danger"}
        onClick={() => handleToggleShowClearLockerModal()}
      >
        {fromAdmin ? <span>Empty this Locker</span> : <span>Empty Locker</span>}
      </button>
    </>
  );
}

export default ClearMyAssetButton;

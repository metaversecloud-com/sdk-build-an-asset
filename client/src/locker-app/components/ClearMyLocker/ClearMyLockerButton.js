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
            Empty <b>this</b> Locker
          </span>
        ) : (
          <span>Empty Locker</span>
        )}
      </button>
    </>
  );
}

export default ClearMyLockerButton;

import React from "react";

function ClearMyAssetButton({ handleToggleShowClearDeskModal, fromAdmin }) {
  return (
    <>
      <button
        className={fromAdmin ? "btn-danger-outline" : "btn-danger"}
        onClick={() => handleToggleShowClearDeskModal()}
      >
        {fromAdmin ? <span>Empty this Desk</span> : <span>Empty Desk</span>}
      </button>
    </>
  );
}

export default ClearMyAssetButton;

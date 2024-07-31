import React, { useState } from "react";

function ClearAllDesksButton({ handleToggleShowClearAllDesksModal }) {
  return (
    <>
      <button
        class="btn-danger"
        onClick={() => handleToggleShowClearAllDesksModal()}
      >
        <span>Empty all Desks</span>
      </button>
    </>
  );
}

export default ClearAllDesksButton;

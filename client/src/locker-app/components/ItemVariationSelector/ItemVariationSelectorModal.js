import React from "react";

function ItemVariationSelectorModal({ isOpen, variations, onSelect, onClose }) {
  const BASE_URL = window.location.origin;
  const handleVariationClick = (variation) => {
    onSelect(variation);
    onClose();
  };

  return isOpen ? (
    <div className="topia-modal-container visible">
      <div className="topia-modal">
        <h4>Select Item</h4>
        <div className="modal-variations">
          <div
            className="variations-container"
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-around",
            }}
          >
            {variations.map((variation, index) => (
              <img
                key={index}
                src={`${BASE_URL}/locker-assets/${variation}`}
                alt={`Variation ${index}`}
                onClick={() => handleVariationClick(variation)}
                style={{
                  objectFit: "cover",
                  borderRadius: "10px",
                  margin: "5px",
                  cursor: "pointer",
                  border: "1px solid #ccc",
                }}
              />
            ))}
          </div>
        </div>
        <div className="actions" style={{ marginTop: "10px" }}>
          <button className="btn-outline" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  ) : null;
}

export default ItemVariationSelectorModal;

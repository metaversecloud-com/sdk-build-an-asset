import React, { useState, useEffect } from "react";

function ItemVariationSelectorModal({
  isOpen,
  variations,
  onSelect,
  onClose,
  selectedVariation,
}) {
  const BASE_URL = window.location.origin;
  const [selectedItem, setSelectedItem] = useState(selectedVariation);

  useEffect(() => {
    setSelectedItem(selectedVariation);
  }, [selectedVariation]);

  const handleVariationClick = (variation) => {
    if (selectedItem === variation) {
      setSelectedItem(null);
    } else {
      setSelectedItem(variation);
    }
  };

  const handleOk = () => {
    if (selectedItem !== selectedVariation) {
      onSelect(selectedItem);
    }
    onClose();
  };

  return isOpen ? (
    <div className="topia-modal-container visible">
      <div className="topia-modal">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h4>Select Item</h4>
          <span
            style={{ cursor: "pointer", fontSize: "20px" }}
            onClick={onClose}
          >
            &times;
          </span>
        </div>
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
                  border:
                    selectedItem === variation
                      ? "2px solid #4355e4"
                      : "1px solid #ccc",
                }}
              />
            ))}
          </div>
        </div>
        <div className="actions" style={{ marginTop: "10px" }}>
          <button className="btn-primary" onClick={handleOk}>
            OK
          </button>
        </div>
      </div>
    </div>
  ) : null;
}

export default ItemVariationSelectorModal;

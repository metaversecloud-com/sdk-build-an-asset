import React, { useState, useEffect } from "react";
import "./ItemVariationSelectorModal.scss";
import { getThemeName } from "../../../redux/themeData2";

function ItemVariationSelectorModal({
  isOpen,
  variations,
  onSelect,
  onClose,
  selectedVariation,
}) {
  const themeName = getThemeName();
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
        <div className="modal-header">
          <h4>Select Item</h4>
          <span className="close-btn" onClick={onClose}>
            &times;
          </span>
        </div>
        <div className="modal-variations">
          <div className="variations-container">
            {variations.map((variation, index) => (
              <img
                key={index}
                src={`${BASE_URL}/${themeName}-assets/${variation}`}
                alt={`Variation ${index}`}
                onClick={() => handleVariationClick(variation)}
                className={`variation-item ${
                  selectedItem === variation ? "selected" : ""
                }`}
              />
            ))}
          </div>
        </div>
        <div className="footer-wrapper">
          <button
            className="btn-primary"
            onClick={handleOk}
            style={{ width: "70%" }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  ) : null;
}

export default ItemVariationSelectorModal;

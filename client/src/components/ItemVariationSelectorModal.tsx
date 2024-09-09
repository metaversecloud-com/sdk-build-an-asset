import { useState, useEffect } from "react";
import { getS3URL, getThemeName } from "@/utils";

export const ItemVariationSelectorModal = ({
  isOpen,
  variations,
  onSelect,
  onClose,
  selectedVariation,
}: {
  isOpen: boolean;
  variations: string[];
  onSelect: (selectedItem: string) => void;
  onClose: () => void;
  selectedVariation: string;
}) => {
  const themeName = getThemeName();
  const S3URL = `${getS3URL()}/${themeName}`;

  console.log("🚀 ~ file: ItemVariationSelectorModal.tsx:20 ~ S3URL:", S3URL);
  const [selectedItem, setSelectedItem] = useState(selectedVariation);

  useEffect(() => {
    setSelectedItem(selectedVariation);
  }, [selectedVariation]);

  const handleVariationClick = (variation: string) => {
    if (selectedItem === variation) {
      setSelectedItem("");
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
                src={`${S3URL}/${variation}`}
                alt={`Variation ${index}`}
                onClick={() => handleVariationClick(variation)}
                className={`variation-item ${selectedItem === variation ? "selected" : ""}`}
              />
            ))}
          </div>
        </div>
        <button className="btn m-4" onClick={handleOk} style={{ maxWidth: "80%" }}>
          OK
        </button>
      </div>
    </div>
  ) : null;
};

export default ItemVariationSelectorModal;

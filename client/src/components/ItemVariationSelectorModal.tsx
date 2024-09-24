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
    <div className="modal-container visible">
      <div className="modal no-padding">
        <div className="modal-header">
          <h4>Select Item</h4>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="items-container p-6">
          {variations.map((variation, index) => (
            <button
              key={variation}
              onClick={() => handleVariationClick(variation)}
              className={`card ${selectedItem === variation ? "success" : ""}`}
            >
              <img key={index} src={`${S3URL}/${variation}`} alt={`Variation ${index}`} />
            </button>
          ))}
        </div>
        <div className="actions">
          <button className="btn m-4" onClick={handleOk}>
            OK
          </button>
        </div>
      </div>
    </div>
  ) : null;
};

export default ItemVariationSelectorModal;

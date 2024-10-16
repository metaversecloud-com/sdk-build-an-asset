import { useState } from "react";
import { getS3URL, getThemeName } from "@/utils";

export const ItemVariationSelectorModal = ({
  isOpen,
  onClose,
  onSelect,
  selectedItem,
  variations,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selectedItemVariation: string) => void;
  selectedItem: string;
  variations: string[];
}) => {
  const themeName = getThemeName();
  const S3URL = `${getS3URL()}/${themeName}`;

  const [selectedItemVariation, setSelectedItemVariation] = useState(selectedItem);

  const handleVariationClick = (variation: string) => {
    if (selectedItemVariation === variation) {
      setSelectedItemVariation("");
    } else {
      setSelectedItemVariation(variation);
    }
  };

  const handleOk = () => {
    if (selectedItemVariation !== selectedItem) {
      onSelect(selectedItemVariation);
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
              className={`card ${selectedItemVariation === variation ? "success" : ""}`}
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

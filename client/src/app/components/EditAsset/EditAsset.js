import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import mergeImages from "merge-images";
import { ClipLoader } from "react-spinners";
import { editLocker } from "../../../redux/actions/locker.js";
import { Collapse, Button } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronUp,
  faCheck,
  faChevronLeft,
} from "@fortawesome/free-solid-svg-icons";
import Gear from "../../pages/Admin/Gear.js";
import AdminView from "../../pages/Admin/AdminView.js";
import ItemVariationSelectorModal from "../ItemVariationSelector/ItemVariationSelectorModal.js";

import "./EditAsset.scss";

const categories = {
  "Locker Base": [
    {
      name: "lockerBase_0.png",
      hasVariation: true,
      isRequired: true,
      variations: [
        "lockerBase_0.png",
        "lockerBase_1.png",
        "lockerBase_2.png",
        "lockerBase_3.png",
        "lockerBase_4.png",
        "lockerBase_5.png",
      ],
    },
    {
      name: "wallpaper_0.png",
      hasVariation: true,
      variations: [
        "wallpaper_0.png",
        "wallpaper_1.png",
        "wallpaper_2.png",
        "wallpaper_3.png",
        "wallpaper_4.png",
        "wallpaper_5.png",
        "wallpaper_6.png",
      ],
    },
    {
      name: "border_0.png",
      hasVariation: true,
      variations: [
        "border_0.png",
        "border_1.png",
        "border_2.png",
        "border_3.png",
        "border_4.png",
      ],
    },
  ],
  "Top Shelf": [
    {
      name: "topShelf_0.png",
      hasVariation: true,
      variations: [
        "topShelf_0.png",
        "topShelf_1.png",
        "topShelf_2.png",
        "topShelf_3.png",
      ],
    },
    {
      name: "topShelf_4.png",
      hasVariation: true,
      variations: ["topShelf_4.png", "topShelf_5.png"],
    },
    {
      name: "topShelf_6.png",
      hasVariation: true,
      variations: ["topShelf_6.png", "topShelf_7.png"],
    },
    {
      name: "topShelf_8.png",
      hasVariation: true,
      variations: ["topShelf_8.png", "topShelf_9.png"],
    },
    {
      name: "topShelf_10.png",
      hasVariation: true,
      variations: ["topShelf_10.png", "topShelf_11.png"],
    },
    {
      name: "topShelf_12.png",
      hasVariation: true,
      variations: ["topShelf_12.png", "topShelf_13.png", "topShelf_14.png"],
    },
    { name: "topShelf_15.png", hasVariation: false },
    { name: "topShelf_16.png", hasVariation: false },
    { name: "topShelf_17.png", hasVariation: false },
    { name: "topShelf_18.png", hasVariation: false },
    { name: "topShelf_19.png", hasVariation: false },
  ],
  "Bottom Shelf": [
    {
      name: "bottomShelf_0.png",
      hasVariation: true,
      variations: [
        "bottomShelf_0.png",
        "bottomShelf_2.png",
        "bottomShelf_3.png",
        "bottomShelf_4.png",
        "bottomShelf_5.png",
        "bottomShelf_6.png",
        "bottomShelf_7.png",
        "bottomShelf_8.png",
        "bottomShelf_9.png",
        "bottomShelf_10.png",
        "bottomShelf_11.png",
        "bottomShelf_12.png",
        "bottomShelf_13.png",
        "bottomShelf_14.png",
      ],
    },

    {
      name: "bottomShelf_18.png",
      hasVariation: true,
      variations: [
        "bottomShelf_18.png",
        "bottomShelf_19.png",
        "bottomShelf_20.png",
        "bottomShelf_21.png",
        "bottomShelf_22.png",
        "bottomShelf_23.png",
        "bottomShelf_24.png",
        "bottomShelf_25.png",
      ],
    },
    {
      name: "bottomShelf_26.png",
      hasVariation: true,
      variations: [
        "bottomShelf_26.png",
        "bottomShelf_27.png",
        "bottomShelf_28.png",
        "bottomShelf_29.png",
        "bottomShelf_30.png",
        "bottomShelf_31.png",
        "bottomShelf_32.png",
        "bottomShelf_33.png",
        "bottomShelf_34.png",
        "bottomShelf_35.png",
      ],
    },
    {
      name: "bottomShelf_36.png",
      hasVariation: true,
      variations: [
        "bottomShelf_36.png",
        "bottomShelf_37.png",
        "bottomShelf_38.png",
      ],
    },
    {
      name: "bottomShelf_39.png",
      hasVariation: true,
      variations: [
        "bottomShelf_39.png",
        "bottomShelf_40.png",
        "bottomShelf_41.png",
        "bottomShelf_42.png",
        "bottomShelf_43.png",
        "bottomShelf_44.png",
      ],
    },
  ],
  Door: [
    {
      name: "door_0.png",
      hasVariation: true,
      variations: ["door_0.png", "door_1.png", "door_2.png", "door_3.png"],
    },
    {
      name: "door_4.png",
      hasVariation: true,
      variations: ["door_4.png", "door_5.png"],
    },
    {
      name: "door_6.png",
      hasVariation: true,
      variations: [
        "door_6.png",
        "door_7.png",
        "door_8.png",
        "door_9.png",
        "door_10.png",
        "door_11.png",
      ],
    },
    { name: "door_12.png", hasVariation: false },
    { name: "door_13.png", hasVariation: false },
    { name: "door_14.png", hasVariation: false },
    { name: "door_15.png", hasVariation: false },
    { name: "door_16.png", hasVariation: false },
  ],
};

const selectionLimits = {
  "Locker Base": 1,
  "Top Shelf": Infinity,
  "Bottom Shelf": Infinity,
  Door: Infinity,
};

function EditAsset() {
  const dispatch = useDispatch();
  const BASE_URL = window.location.origin;

  const visitor = useSelector((state) => state?.session?.visitor);

  const [selected, setSelected] = useState({
    "Locker Base": [`${BASE_URL}/locker-assets/lockerBase_0.png`],
    "Top Shelf": [],
    "Bottom Shelf": [],
    Door: [],
  });

  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isButtonSaveLockerDisabled, setIsButtonSaveLockerDisabled] =
    useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItemVariations, setCurrentItemVariations] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  const [selectedVariation, setSelectedVariation] = useState(null);

  const [preview, setPreview] = useState(
    `${BASE_URL}/locker-assets/defaultClaimedAsset.png`
  );
  const [imageInfo, setImageInfo] = useState({});
  const isLockerAlreadyTaken = useSelector(
    (state) => state?.session?.isLockerAlreadyTaken
  );
  const [openCategories, setOpenCategories] = useState({
    "Locker Base": true,
    Wallpaper: false,
    Border: false,
    "Top Shelf": false,
    "Bottom Shelf": false,
    Door: false,
  });

  const toggleCategory = (category) => {
    setOpenCategories((prev) => {
      const newCategories = {
        Wallpaper: false,
        Border: false,
        "Top Shelf": false,
        "Bottom Shelf": false,
        Door: false,
      };
      newCategories[category] = !prev[category];
      return newCategories;
    });
  };

  const handleOpenModalWithVariations = (item, type) => {
    const variations = item.variations || [];
    const currentSelection = selected[type].find((selectedImage) => {
      if (!selectedImage) return false;

      const selectedBaseName = selectedImage
        .replace(`${BASE_URL}/locker-assets/`, "")
        .split(".")[0];
      return item.variations.some((variation) => {
        const variationBaseName = variation.split(".")[0];
        return selectedBaseName === variationBaseName;
      });
    });
    const currentSelectionVariation = currentSelection
      ? currentSelection.replace(`${BASE_URL}/locker-assets/`, "")
      : null;
    setCurrentItemVariations(variations);
    setCurrentItem({ ...item, type });
    setIsModalOpen(true);
    setSelectedVariation(currentSelectionVariation);
  };

  const isCategorySelected = (category) => {
    return selected[category].length > 0;
  };

  const isSelectedItem = (type, imageName) => {
    return selected[type].some((selectedImage) => {
      if (!selectedImage) return false;

      const selectedBaseName = selectedImage
        .replace(`${BASE_URL}/locker-assets/`, "")
        .split(".")[0];
      const itemBaseName = imageName.split(".")[0];
      return (
        selectedBaseName === itemBaseName ||
        categories[type].some((item) => {
          if (item.name.split(".")[0] === itemBaseName && item.hasVariation) {
            return item.variations.some((variation) => {
              const variationBaseName = variation.split(".")[0];
              return selectedBaseName === variationBaseName;
            });
          }
          return false;
        })
      );
    });
  };

  useEffect(() => {
    const fetchInitialState = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const initialSelection = Object.keys(categories).reduce(
        (acc, category) => {
          const categoryKey1 = `${category.replace(/\s/g, "")}1`;
          const categoryKey2 = `${category.replace(/\s/g, "")}2`;
          acc[category] = [
            urlParams.get(categoryKey1) &&
              `${BASE_URL}/locker-assets/${urlParams.get(categoryKey1)}.png`,
            urlParams.get(categoryKey2) &&
              `${BASE_URL}/locker-assets/${urlParams.get(categoryKey2)}.png`,
          ].filter(Boolean);
          return acc;
        },
        {}
      );

      setSelected(initialSelection);

      const imagesToMerge = Object.values(initialSelection)
        .flat()
        .map((item) => ({
          src: item,
          x: 0,
          y: 0,
        }));

      mergeImages(imagesToMerge)
        .then(setPreview)
        .catch((error) => console.error("Erro ao mesclar imagens:", error));
    };

    try {
      setLoading(true);
      fetchInitialState();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const updateLocker = (type, image, item) => {
    let updatedSelection = { ...selected };

    if (image === null) {
      // Se a imagem for null, remova o item selecionado, exceto para o item marcado como isRequired
      if (item.isRequired) {
        return; // Não permite desselecionar o item marcado como isRequired
      }
      updatedSelection[type] = updatedSelection[type].filter((selectedItem) => {
        if (item && item.hasVariation) {
          return !item.variations.some(
            (variation) =>
              `${BASE_URL}/locker-assets/${variation}` === selectedItem
          );
        }
        return (
          item && selectedItem !== `${BASE_URL}/locker-assets/${item.name}`
        );
      });
    } else {
      if (item.hasVariation) {
        const isSelectedVariation = updatedSelection[type].includes(image);

        if (isSelectedVariation) {
          // Não permite desselecionar o item marcado como isRequired
          if (item.isRequired) {
            return;
          }
          updatedSelection[type] = updatedSelection[type].filter(
            (selectedItem) => selectedItem !== image
          );
        } else {
          updatedSelection[type] = updatedSelection[type].filter(
            (selectedItem) => {
              return !item.variations.some(
                (variation) =>
                  `${BASE_URL}/locker-assets/${variation}` === selectedItem
              );
            }
          );
          updatedSelection[type].push(image);
        }
      } else {
        const isSelected = selected[type].includes(image);
        if (selectionLimits[type] === 1) {
          updatedSelection[type] = isSelected ? [] : [image];
        } else {
          if (isSelected) {
            // Não permite desselecionar o item marcado como isRequired
            if (item.isRequired) {
              return;
            }
            updatedSelection[type] = updatedSelection[type].filter(
              (i) => i !== image
            );
          } else {
            updatedSelection[type].push(image);
          }
        }
      }
    }

    // Verifica se há um item marcado como isRequired que não está selecionado
    const requiredItem = categories[type].find((item) => item.isRequired);
    if (
      requiredItem &&
      !updatedSelection[type].some((selectedItem) =>
        requiredItem.variations.includes(
          selectedItem.replace(`${BASE_URL}/locker-assets/`, "")
        )
      )
    ) {
      // Se não houver um item isRequired selecionado, seleciona automaticamente o primeiro item isRequired
      updatedSelection[type].unshift(
        `${BASE_URL}/locker-assets/${requiredItem.variations[0]}`
      );
    }

    // Garante que o item isRequired do "Locker Base" fique sempre no início do array
    if (type === "Locker Base") {
      const requiredItemIndex = updatedSelection[type].findIndex(
        (selectedItem) =>
          requiredItem.variations.includes(
            selectedItem.replace(`${BASE_URL}/locker-assets/`, "")
          )
      );
      if (requiredItemIndex !== -1) {
        const requiredImage = updatedSelection[type].splice(
          requiredItemIndex,
          1
        )[0];
        updatedSelection[type].unshift(requiredImage);
      }
    }

    setSelected(updatedSelection);

    const updatedImageInfo = Object.keys(updatedSelection).reduce(
      (info, key) => {
        info[key] = updatedSelection[key]
          .map((item) => {
            if (item) {
              return {
                imageName: item.split("/").pop().split(".")[0],
              };
            }
            return null;
          })
          .filter(Boolean);
        return info;
      },
      {}
    );
    setImageInfo(updatedImageInfo);

    const imagesToMerge = Object.values(updatedSelection)
      .flat()
      .map((i) => ({
        src: i,
        x: 0,
        y: 0,
      }))
      .filter((img) => img.src);

    mergeImages(imagesToMerge).then(setPreview);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveToBackend = async () => {
    try {
      setIsButtonSaveLockerDisabled(true);
      await dispatch(editLocker(imageInfo));
    } catch (error) {
      console.error("Error editing locker:", error);
    } finally {
      setIsButtonSaveLockerDisabled(false);
    }
  };

  if (loading) {
    return (
      <div className="loader">
        <ClipLoader color={"#123abc"} loading={loading} size={150} />
      </div>
    );
  }

  if (showSettings) {
    return <AdminView setShowSettings={setShowSettings} />;
  }

  if (isLockerAlreadyTaken) {
    return (
      <>
        <div className={`wrapper ${visitor?.isAdmin ? "mt-90" : ""}`}>
          <h1>This locker is already taken</h1>
          <p>Please select another locker!</p>
        </div>
      </>
    );
  }

  return (
    <>
      {isModalOpen ? (
        <ItemVariationSelectorModal
          isOpen={isModalOpen}
          variations={currentItemVariations}
          onSelect={(selectedVariation) => {
            if (selectedVariation) {
              const imageUrl = `${BASE_URL}/locker-assets/${selectedVariation}`;
              updateLocker(currentItem.type, imageUrl, currentItem);
            } else {
              updateLocker(currentItem.type, null, currentItem);
            }
          }}
          onClose={handleCloseModal}
          selectedVariation={selectedVariation}
        />
      ) : (
        ""
      )}
      <div className={`wrapper ${visitor?.isAdmin ? "mt-90" : ""}`}>
        {visitor?.isAdmin ? Gear({ setShowSettings }) : <></>}
        <h2 style={{ marginBottom: "0px", paddingBottom: "0px" }}>
          Build your Locker!
        </h2>
        <img
          src={
            preview == "data:,"
              ? `${BASE_URL}/locker-assets/defaultClaimedAsset.png`
              : preview
          }
          alt="Locker Preview"
          style={{ marginTop: "30px", marginBottom: "30px" }}
          className="img-preview"
        />

        {Object.keys(categories).map((type) => (
          <div key={type}>
            <Button
              color=""
              onClick={() => toggleCategory(type)}
              style={{ marginBottom: "0px", textAlign: "left" }}
            >
              {isCategorySelected(type) && (
                <FontAwesomeIcon
                  icon={faCheck}
                  style={{ marginRight: "10px", color: "green" }}
                />
              )}
              {!isCategorySelected(type) && validationErrors[type] && (
                <span style={{ color: "red" }}> ❗</span>
              )}
              Select {type}
              <FontAwesomeIcon
                icon={openCategories[type] ? faChevronUp : faChevronDown}
                style={{ marginLeft: "10px" }}
              />
            </Button>
            <Collapse
              isOpen={openCategories[type]}
              style={{ textAlign: "center" }}
            >
              <div style={{ marginBottom: "10px", textAlign: "left" }}>
                {categories[type].map((item) => (
                  <div
                    key={item.name}
                    style={{ position: "relative", display: "inline-block" }}
                  >
                    {item.hasVariation && (
                      <div
                        style={{
                          position: "absolute",
                          top: "7px",
                          right: "7px",
                          backgroundColor: "white",
                          borderRadius: "50%",
                          width: "16px",
                          height: "16px",
                          display: "flex",
                          justifyContent: "end",
                          alignItems: "center",
                          zIndex: 1,
                        }}
                      >
                        <img
                          src="https://sdk-style.s3.amazonaws.com/icons/copy.svg"
                          alt="Expand"
                          style={{
                            width: "15px",
                            height: "15px",
                          }}
                        />
                      </div>
                    )}
                    <img
                      src={`${BASE_URL}/locker-assets/${item.name}`}
                      alt={item.name}
                      className="img-accessory"
                      style={{
                        borderRadius: "10px",
                        padding: "5px",
                        backgroundColor: isSelectedItem(type, item.name)
                          ? "#edeffc"
                          : "transparent",
                        border: isSelectedItem(type, item.name)
                          ? "1px solid #4355e4"
                          : "1px solid #ccc",
                        cursor: "pointer",
                        margin: "5px",
                      }}
                      onClick={() => {
                        if (item.hasVariation) {
                          handleOpenModalWithVariations(item, type);
                          return;
                        } else {
                          updateLocker(
                            type,
                            `${BASE_URL}/locker-assets/${item.name}`,
                            item
                          );
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </Collapse>
          </div>
        ))}

        {Object.keys(validationErrors).length > 0 && (
          <p style={{ color: "red" }}>
            Please select an item from each category to build the locker.
          </p>
        )}

        <div className="footer-wrapper">
          <div className="footer-fixed" style={{ backgroundColor: "white" }}>
            <button
              onClick={handleSaveToBackend}
              disabled={
                !selected["Locker Base"].length > 0 ||
                isButtonSaveLockerDisabled
              }
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default EditAsset;

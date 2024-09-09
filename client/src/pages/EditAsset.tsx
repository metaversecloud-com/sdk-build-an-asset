import { useContext, useEffect, useState } from "react";
import mergeImages from "merge-images";

import { CategoryType } from "@/constants";

// components
import { PageContainer, ItemVariationSelectorModal } from "@/components/index.js";

// context
import { GlobalDispatchContext, GlobalStateContext } from "@context/GlobalContext";
import { SET_ERROR, SET_GAME_STATE } from "@/context/types.js";

// utils
import { backendAPI, getS3URL, getThemeData, getThemeName } from "@/utils";

export const EditAsset = () => {
  const dispatch = useContext(GlobalDispatchContext);
  const { visitorIsAdmin } = useContext(GlobalStateContext);

  const themeName = getThemeName();
  const themeData = getThemeData();
  const S3URL = `${getS3URL()}/${themeName}`;
  const BASE_URL = window.location.origin;
  const baseUrl = `${BASE_URL}/assets/${themeName}`;

  const [selected, setSelected] = useState(themeData?.defaultSelected);

  const [isLoading, setLoading] = useState(false);
  const [isButtonSaveAssetDisabled, setIsButtonSaveAssetDisabled] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItemVariations, setCurrentItemVariations] = useState<string[]>([]);
  const [currentItem, setCurrentItem] = useState<{ type: string; name: string; hasVariation: boolean }>();

  const [selectedVariation, setSelectedVariation] = useState<string>("");
  const [preview, setPreview] = useState(`${S3URL}/claimedAsset.png`);

  const [imageInfo, setImageInfo] = useState({});

  const isSelectedItem = (type: string, imageName: string) => {
    return selected[type]?.some((selectedImage: string) => {
      if (!selectedImage) return false;

      const selectedBaseName = selectedImage.replace(baseUrl, "").split(".")[0];
      const itemBaseName = imageName.split(".")[0];
      return (
        selectedBaseName === itemBaseName ||
        themeData.categories[type].some((item) => {
          if (item.name.split(".")[0] === itemBaseName && item.hasVariation) {
            return item.variations?.some((variation) => {
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
    setLoading(true);
    fetchInitialState()
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, []);

  const fetchInitialState = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const initialSelection = themeData.layerOrder.reduce((info: { [category: string]: string[] }, category: string) => {
      const categoryKey1 = `${category.replace(/\s/g, "")}1`;
      const categoryKey2 = `${category.replace(/\s/g, "")}2`;

      info[category] = [
        urlParams.get(categoryKey1) && `${baseUrl}/${urlParams.get(categoryKey1)}.png`,
        urlParams.get(categoryKey2) && `${baseUrl}/${urlParams.get(categoryKey2)}.png`,
      ].filter(Boolean);
      return info;
    }, {});

    getPreview(initialSelection);
  };

  const updateAsset = (type: string, image: string, item: CategoryType) => {
    const updatedSelection = { ...selected };

    if (image === null) {
      if (item.isRequired) return;
      updatedSelection[type] = updatedSelection[type].filter((selectedItem) => {
        if (item && item.hasVariation) {
          return !item.variations?.some((variation) => `${baseUrl}/${variation}` === selectedItem);
        }
        return item && selectedItem !== `${baseUrl}/${item.name}`;
      });
    } else {
      if (item.hasVariation) {
        const isSelectedVariation = updatedSelection[type]?.includes(image);

        if (isSelectedVariation) {
          if (item.isRequired) return;
          updatedSelection[type] = updatedSelection[type].filter((selectedItem) => selectedItem !== image);
        } else {
          updatedSelection[type] = updatedSelection[type].filter((selectedItem) => {
            return !item.variations?.some((variation) => `${baseUrl}/${variation}` === selectedItem);
          });
          updatedSelection[type].push(image);
        }
      } else {
        const isSelected = selected[type].includes(image);
        if (themeData.selectionLimits[type] === 1) {
          updatedSelection[type] = isSelected ? [] : [image];
        } else {
          if (isSelected) {
            if (item.isRequired) return;
            updatedSelection[type] = updatedSelection[type].filter((i) => i !== image);
          } else {
            updatedSelection[type].push(image);
          }
        }
      }
    }

    const requiredItem = themeData.categories[type].find((item) => item.isRequired);
    if (
      requiredItem &&
      !updatedSelection[type].some((selectedItem) =>
        requiredItem.variations?.includes(selectedItem.replace(`${baseUrl}/`, "")),
      )
    ) {
      updatedSelection[type].unshift(`${baseUrl}/${requiredItem.variations?.[0]}`);
    }

    if (type === Object.keys(themeData.categories)[0]) {
      const requiredItemIndex = updatedSelection[type].findIndex((selectedItem) =>
        requiredItem?.variations?.includes(selectedItem.replace(`${baseUrl}/`, "")),
      );
      if (requiredItemIndex !== -1) {
        const requiredImage = updatedSelection[type].splice(requiredItemIndex, 1)[0];
        updatedSelection[type].unshift(requiredImage);
      }
    }

    getPreview(updatedSelection);
  };

  const getPreview = (selection: { [x: string]: string[] }) => {
    setSelected(selection);

    const updatedImageInfo = themeData.layerOrder.reduce((info: { [category: string]: object }, category: string) => {
      if (selection[category]) {
        info[category] = selection[category]
          .map((item) => {
            if (item) {
              return {
                imageName: item?.split("/")?.pop()?.split(".")?.[0] || "",
              };
            }
            return null;
          })
          .filter(Boolean);
      } else {
        info[category] = [];
      }
      return info;
    }, {});

    setImageInfo(updatedImageInfo);

    const orderedImages = themeData.layerOrder.flatMap((category) => (selection[category] ? selection[category] : []));

    const imagesToMerge = orderedImages.map((image) => ({
      src: image,
      x: 0,
      y: 0,
    }));

    mergeImages(imagesToMerge, { crossOrigin: "anonymous" })
      .then((result) => {
        return setPreview(result);
      })
      .catch((error) => console.error(error));
  };

  const handleOpenModalWithVariations = (item: CategoryType, type: string) => {
    const variations = item.variations || [];
    const currentSelection = selected[type].find((selectedImage) => {
      if (!selectedImage) return false;

      const selectedBaseName = selectedImage.replace(`${baseUrl}/`, "").split(".")[0];
      return item.variations?.some((variation) => {
        const variationBaseName = variation.split(".")[0];
        return selectedBaseName === variationBaseName;
      });
    });
    const currentSelectionVariation = currentSelection ? currentSelection.replace(`${baseUrl}/`, "") : "";
    setCurrentItemVariations(variations);
    setCurrentItem({ ...item, type });
    setIsModalOpen(true);
    setSelectedVariation(currentSelectionVariation);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveToBackend = () => {
    setIsButtonSaveAssetDisabled(true);

    const url = themeData.dropAssetInRandomLocation ? "/dropped-assets/drop" : "/dropped-assets/edit";

    backendAPI
      .post(url, { imageInfo })
      .then((response) => {
        dispatch!({
          type: SET_GAME_STATE,
          payload: response.data,
        });
      })
      .catch((error) => {
        console.error(error);
        dispatch!({
          type: SET_ERROR,
          payload: { error: "There was an error while dropping or updating an asset" },
        });
      })
      .finally(() => {
        setIsButtonSaveAssetDisabled(false);
      });
  };

  return (
    <>
      {isModalOpen && currentItem ? (
        <ItemVariationSelectorModal
          isOpen={isModalOpen}
          variations={currentItemVariations}
          onSelect={(selectedVariation) => {
            if (selectedVariation) {
              const imageUrl = `${baseUrl}/${selectedVariation}`;
              updateAsset(currentItem.type, imageUrl, currentItem);
            } else {
              updateAsset(currentItem.type, "", currentItem);
            }
          }}
          onClose={handleCloseModal}
          selectedVariation={selectedVariation || ""}
        />
      ) : (
        ""
      )}
      <PageContainer
        isLoading={isLoading}
        headerText={`Build your ${themeData.name}!`}
        previewImageURL={preview === "data:," ? `${baseUrl}/claimedAsset.png` : preview}
        showClearAssetBtn={visitorIsAdmin}
        footerContent={
          <button
            onClick={handleSaveToBackend}
            className="btn"
            disabled={selected[themeData.baseCategoryName].length === 0 || isButtonSaveAssetDisabled}
          >
            {themeData.saveButtonText}
          </button>
        }
      >
        {Object.keys(themeData.categories).map((type) => (
          <div key={type}>
            <section id="accordion" className="accordion m-4">
              <div className="accordion-container">
                <details className="accordion-item">
                  <summary className="accordion-trigger">
                    <span className="accordion-title">Select {type}</span>
                    <img
                      className="accordion-icon"
                      aria-hidden="true"
                      src="https://sdk-style.s3.amazonaws.com/icons/chevronDown.svg"
                    />
                  </summary>
                  <div className="accordion-content">
                    <div
                      style={{
                        margin: "6px",
                        textAlign: "left",
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "10px",
                      }}
                    >
                      {themeData.categories[type].map((item) => (
                        <div key={item.name} style={{ maxWidth: "40%" }}>
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
                            src={`${baseUrl}/${item.name}`}
                            alt={item.name}
                            className="img-accessory"
                            style={{
                              borderRadius: "10px",
                              padding: "5px",
                              backgroundColor: isSelectedItem(type, item.name) ? "#edeffc" : "transparent",
                              border: isSelectedItem(type, item.name) ? "1px solid #336699" : "1px solid #ccc",
                              cursor: "pointer",
                              margin: "5px",
                            }}
                            onClick={() => {
                              if (item.hasVariation) {
                                handleOpenModalWithVariations(item, type);
                                return;
                              } else {
                                updateAsset(type, `${baseUrl}/${item.name}`, item);
                              }
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </details>
              </div>
            </section>
          </div>
        ))}
      </PageContainer>
    </>
  );
};

export default EditAsset;

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import mergeImages from "merge-images";
import { ClipLoader } from "react-spinners";
import {
  spawnAsset,
  getDroppedAssetAndVisitor,
  getIsMyAssetSpawned,
  spawnFromSpawnedAsset,
  moveToAsset,
} from "../../../redux/actions/session";
import { Collapse, Button } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronUp,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import Gear from "../../pages/Admin/Gear";
import AdminView from "../../pages/Admin/AdminView";

import "./EditSnowman.scss";

const accessories = {
  Body: ["body_0.png", "body_1.png", "body_2.png"],
  Arms: [
    "arms_0.png",
    "arms_1.png",
    "arms_2.png",
    "arms_3.png",
    "arms_4.png",
    "arms_5.png",
    "arms_6.png",
    "arms_7.png",
    "arms_8.png",
  ],
  "Head Covering": [
    "head_0.png",
    "head_1.png",
    "head_2.png",
    "head_3.png",
    "head_4.png",
    "head_5.png",
    "head_6.png",
    "head_7.png",
    "head_8.png",
  ],
  Accessories: [
    "accessories_0.png",
    "accessories_1.png",
    "accessories_2.png",
    "accessories_3.png",
    "accessories_4.png",
    "accessories_5.png",
  ],
};

function EditSnowman() {
  const dispatch = useDispatch();

  const visitor = useSelector((state) => state?.session?.visitor);
  // const visitor = useSelector((state) => state?.session?.visitor);
  const isAssetSpawnedInWorld = useSelector(
    (state) => state?.session?.isAssetSpawnedInWorld
  );
  const spawnSuccess = useSelector((state) => state?.session?.spawnSuccess);

  const spawnedAsset = useSelector((state) => state?.session?.spawnedAsset);

  const [selected, setSelected] = useState({
    Body: "",
    Arms: "",
    "Head Covering": "",
    Accessories: "",
  });
  const [loading, setLoading] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isButtonMoveToSnowmanDisabled, setIsButtonMoveToSnowmanDisabled] =
    useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [completeImageName, setCompleteImageName] = useState("");
  const [showDefaultScreen, setShowDefaultScreen] = useState(false);
  const [preview, setPreview] = useState("/assets/snowman/snowman.png");
  const [openCategories, setOpenCategories] = useState({
    Body: false,
    Arms: false,
    "Head Covering": false,
    Accessories: false,
  });

  const validateSelection = () => {
    const errors = {};
    Object.keys(accessories).forEach((category) => {
      if (!selected[category]) {
        errors[category] = true;
      }
    });
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const allCategoriesSelected = () => {
    return Object.keys(accessories).every((category) => selected[category]);
  };

  const toggleCategory = (category) => {
    setOpenCategories((prev) => {
      const newCategories = {
        Body: false,
        Arms: false,
        "Head Covering": false,
        Accessories: false,
      };
      newCategories[category] = !prev[category];
      return newCategories;
    });
  };

  const isCategorySelected = (category) => {
    return selected[category] !== "";
  };

  const isSelectedItem = (type, image) => {
    return selected[type] === `/assets/snowman/${image}`;
  };

  useEffect(() => {
    const fetchInitialState = async () => {
      setLoading(true);
      await dispatch(getDroppedAssetAndVisitor());
      setLoading(false);

      if (spawnedAsset?.dataObject?.completeImageName) {
        const imageName = spawnedAsset.dataObject.completeImageName;
        const parts = imageName.replace(".png", "").split("_");

        const initialSelection = {
          Body: `/assets/snowman/body_${parts[1]}.png`,
          Arms: `/assets/snowman/arms_${parts[3]}.png`,
          "Head Covering": `/assets/snowman/head_${parts[5]}.png`,
          Accessories: `/assets/snowman/accessories_${parts[7]}.png`,
        };

        setSelected(initialSelection);
        setPreview(
          `/assets/snowman/output/${spawnedAsset?.dataObject?.completeImageName}`
        );
      }
    };

    fetchInitialState();
  }, [dispatch, spawnedAsset?.dataObject?.completeImageName]);

  const updateSnowman = (type, image) => {
    try {
      const updatedSelected = { ...selected, [type]: image };
      setSelected(updatedSelected);
      const imageNameParts = Object.keys(updatedSelected)
        .map((key) => updatedSelected[key].split("/").pop().split(".")[0])
        .filter(Boolean);

      if (imageNameParts.length === Object.keys(accessories).length) {
        setCompleteImageName(imageNameParts.join("_") + ".png");
      }

      const imagesToMerge = [
        { src: "/assets/snowman/snowman.png", x: 0, y: 0 },
        ...Object.values(updatedSelected).map((item) => ({
          src: item,
          x: 0,
          y: 0,
        })),
      ].filter((img) => img.src);

      mergeImages(imagesToMerge).then(setPreview);
    } catch (error) {
      console.error("error1", error);
    }
  };

  const handleSpawnAsset = async () => {
    const isValid = validateSelection();
    if (!isValid) {
      return;
    }

    setIsButtonDisabled(true);

    try {
      await dispatch(spawnFromSpawnedAsset(completeImageName));
    } catch (error) {
      console.error("Error sending asset:", error);
    } finally {
      setIsButtonDisabled(false);
    }
  };

  if (loading) {
    return (
      <div className="loader">
        <ClipLoader color={"#123abc"} loading={loading} size={150} />
      </div>
    );
  }

  return (
    <div className={`wrapper ${visitor?.isAdmin ? "mt-90" : ""}`}>
      {visitor?.isAdmin ? Gear({ setShowSettings }) : <></>}
      <h2 style={{ marginBottom: "0px", paddingBottom: "0px" }}>
        Build Your Snowman!
      </h2>
      <img
        src={preview}
        alt="Snowman Preview"
        style={{ marginTop: "-20px", marginBottom: "16px" }}
        className="img-preview"
      />

      {Object.keys(accessories).map((type) => (
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
          <Collapse isOpen={openCategories[type]}>
            <div style={{ marginBottom: "10px" }}>
              {accessories[type].map((image) => (
                <img
                  key={image}
                  src={`/assets/snowman/${image}`}
                  alt={image}
                  className="img-accessory"
                  style={{
                    border: "1px solid #ccc",
                    borderRadius: "10px",
                    backgroundColor: isSelectedItem(type, image)
                      ? "#f0f0f0"
                      : "transparent",
                  }}
                  onClick={() =>
                    updateSnowman(type, `/assets/snowman/${image}`)
                  }
                />
              ))}
            </div>
          </Collapse>
        </div>
      ))}

      {Object.keys(validationErrors).length > 0 && (
        <p style={{ color: "red" }}>
          Please select an item from each category to build the snowman.
        </p>
      )}

      <div className="footer-fixed" style={{ backgroundColor: "white" }}>
        {spawnSuccess ? (
          <></>
        ) : (
          <p style={{ color: "red" }}>
            Move to the snow area to add your snowman!
          </p>
        )}
        <button
          onClick={handleSpawnAsset}
          disabled={!allCategoriesSelected() || isButtonDisabled}
        >
          Add Snowman
        </button>
      </div>
    </div>
  );
}

export default EditSnowman;
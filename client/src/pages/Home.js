import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import mergeImages from "merge-images";
import { ClipLoader } from "react-spinners";
import { spawnAsset } from "../redux/actions/session";
import { Collapse, Button } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronUp,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";

import "./Home.scss";

const accessories = {
  body: ["body_0.png", "body_1.png"],
  arms: [
    "arms_0.png",
    "arms_1.png",
    "arms_2.png",
    "arms_3.png",
    "arms_4.png",
    "arms_5.png",
    "arms_6.png",
  ],
  head: [
    "head_0.png",
    "head_1.png",
    "head_2.png",
    "head_3.png",
    "head_4.png",
    "head_5.png",
    "head_6.png",
  ],
  neck: [
    "neck_0.png",
    "neck_1.png",
    "neck_2.png",
    "neck_3.png",
    "neck_4.png",
    "neck_5.png",
    "neck_6.png",
  ],
};

function Home() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState({
    body: "",
    arms: "",
    head: "",
    neck: "",
  });
  const [completeImageName, setCompleteImageName] = useState("");
  const [preview, setPreview] = useState("/assets/snowman/snowman.png");
  const [openCategories, setOpenCategories] = useState({
    body: false,
    arms: false,
    head: false,
    neck: false,
  });

  const toggleCategory = (category) => {
    setOpenCategories((prev) => {
      const newCategories = {
        body: false,
        arms: false,
        head: false,
        neck: false,
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
    setLoading(false);
  }, []);

  const updateSnowman = (type, image) => {
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
  };

  function handleSpawnAsset() {
    dispatch(spawnAsset(completeImageName));
  }

  if (loading) {
    return (
      <div className="loader">
        <ClipLoader color={"#123abc"} loading={loading} size={150} />
      </div>
    );
  }

  return (
    <div className="wrapper">
      <h2>Build Your Snowman!</h2>
      <img src={preview} alt="Snowman Preview" />

      {Object.keys(accessories).map((type) => (
        <div key={type}>
          <Button
            color=""
            onClick={() => toggleCategory(type)}
            style={{ marginBottom: "1rem", textAlign: "left" }}
          >
            {isCategorySelected(type) && (
              <FontAwesomeIcon
                icon={faCheck}
                style={{ marginRight: "10px", color: "green" }}
              />
            )}
            Select {type}
            <FontAwesomeIcon
              icon={openCategories[type] ? faChevronUp : faChevronDown}
              style={{ marginLeft: "10px" }}
            />
          </Button>
          <Collapse isOpen={openCategories[type]}>
            <div>
              {accessories[type].map((image) => (
                <img
                  key={image}
                  src={`/assets/snowman/${image}`}
                  alt={image}
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

      <div className="footer-fixed" style={{ backgroundColor: "white" }}>
        <button onClick={handleSpawnAsset}>Add Snowman</button>
      </div>
    </div>
  );
}

export default Home;

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import mergeImages from "merge-images";
import { ClipLoader } from "react-spinners";
import { spawnAsset } from "../redux/actions/session";
import "./Home.scss";

const accessories = {
  body: ["body_0.png", "body_1.png", "body_2.png"],
  arms: ["arms_0.png", "arms_1.png", "arms_2.png"],
  head: ["head_0.png", "head_1.png", "head_2.png"],
};

function StartAssetView() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState({ body: "", arms: "", head: "" });
  const [completeImageName, setCompleteImageName] = useState("");
  const [preview, setPreview] = useState("/assets/snowman/snowman.png");

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
      <h1>Customize your Snowman!</h1>
      <img src={preview} alt="Snowman Preview" />
      {Object.keys(accessories).map((type) => (
        <div key={type}>
          <h2>Select {type}</h2>
          <div>
            {accessories[type].map((image) => (
              <img
                key={image}
                src={`/assets/snowman/${image}`}
                alt={image}
                onClick={() => updateSnowman(type, `/assets/snowman/${image}`)}
              />
            ))}
          </div>
        </div>
      ))}
      <div className="footer-fixed">
        <button onClick={handleSpawnAsset}>Add Snowman</button>
      </div>
    </div>
  );
}

export default StartAssetView;

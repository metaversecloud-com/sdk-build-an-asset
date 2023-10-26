import React, { useEffect, useState } from "react";
import mergeImages from "merge-images";
import { ClipLoader } from "react-spinners";
import "./Home.scss";

const accessories = {
  scarf: ["scarf_0.png", "scarf_1.png", "scarf_2.png"],
  arms: ["arms_0.png", "arms_1.png", "arms_2.png"],
  hat: ["hat_0.png", "hat_1.png", "hat_2.png"],
};

function StartAssetView() {
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState({ scarf: "", arms: "", hat: "" });
  const [preview, setPreview] = useState("/assets/snowman/snowman.png");

  useEffect(() => {
    setLoading(false);
  }, []);

  const updateSnowman = (type, image) => {
    // Crie uma cópia atualizada do estado "selected"
    const updatedSelected = { ...selected, [type]: image };

    setSelected(updatedSelected);

    // Use "updatedSelected" para atualizar o snowman
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
    </div>
  );
}

export default StartAssetView;

import React from "react";
import { useParams } from "react-router-dom";
import "./Spawned.scss";

function Spawned() {
  const { visitorName, imgName } = useParams();
  const imgPath = `/assets/snowman/output/${imgName}`;

  return (
    <div className="spawned-wrapper">
      <h2>
        <b>Snowman</b>
      </h2>
      <img src={imgPath} alt={`Snowman of ${visitorName}`} />
      <div style={{ marginTop: "20px" }}>
        <p>
          This snowman belongs to <b>{visitorName}</b>!
        </p>
      </div>
    </div>
  );
}

export default Spawned;

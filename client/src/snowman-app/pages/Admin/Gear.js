import gear from "../../../assets/icons/gear.svg";

function Gear({ setShowSettings }) {
  return (
    <div
      style={{ position: "absolute", left: "16px", top: "24px" }}
      className="icon-with-rounded-border"
      onClick={() => {
        setShowSettings(true);
      }}
    >
      <img src={gear} />
    </div>
  );
}

export default Gear;

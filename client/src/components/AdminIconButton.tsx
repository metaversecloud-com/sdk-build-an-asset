export const AdminIconButton = ({
  setShowSettings,
  showSettings,
}: {
  setShowSettings: (value: boolean) => void;
  showSettings: boolean;
}) => {
  return (
    <button
      style={{ position: "absolute", left: "16px", top: "24px" }}
      className="icon-with-rounded-border"
      onClick={() => setShowSettings(showSettings)}
    >
      <img src={`https://sdk-style.s3.amazonaws.com/icons/${showSettings ? "arrow" : "cog"}.svg`} />
    </button>
  );
};

export default AdminIconButton;

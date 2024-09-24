import { getThemeData } from "@/utils";

export const ClearAssetButton = ({
  handleToggleShowClearAssetModal,
  fromAdmin = false,
}: {
  handleToggleShowClearAssetModal: () => void;
  fromAdmin?: boolean;
}) => {
  const themeData = getThemeData();
  return (
    <>
      <button
        className={fromAdmin ? "btn btn-danger-outline" : "btn btn-danger"}
        onClick={() => handleToggleShowClearAssetModal()}
      >
        {fromAdmin ? themeData.texts.clearAssetButtonAdmin : themeData.texts.clearAssetButtonGeneral}
      </button>
    </>
  );
};

export default ClearAssetButton;

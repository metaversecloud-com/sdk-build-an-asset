import { getThemeData } from "@/utils";

export const ClearAssetButton = ({
  handleToggleShowClearAssetModal,
  fromAdmin = false,
}: {
  handleToggleShowClearAssetModal: () => void;
  fromAdmin?: boolean;
}) => {
  const { texts } = getThemeData();
  return (
    <>
      <button
        className={fromAdmin ? "btn btn-danger-outline" : "btn btn-danger"}
        onClick={() => handleToggleShowClearAssetModal()}
      >
        {fromAdmin ? texts.clearAssetButtonAdmin : texts.clearAssetButtonGeneral}
      </button>
    </>
  );
};

export default ClearAssetButton;

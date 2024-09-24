import { capitalize, getThemeData } from "@/utils";

export const ClearAllAssetsButton = ({
  handleToggleShowClearAllAssetsModal,
}: {
  handleToggleShowClearAllAssetsModal: () => void;
}) => {
  const { clearButtonType, namePlural } = getThemeData();
  const actionType = clearButtonType === "pickup" ? "Pickup" : "Clear";
  return (
    <>
      <button className="btn btn-danger" onClick={() => handleToggleShowClearAllAssetsModal()}>
        <span>
          {actionType} all {capitalize(namePlural)}
        </span>
      </button>
    </>
  );
};

export default ClearAllAssetsButton;

import { capitalize, getThemeData } from "@/utils";

export const ClearAllAssetsButton = ({
  handleToggleShowClearAllAssetsModal,
}: {
  handleToggleShowClearAllAssetsModal: () => void;
}) => {
  const { namePlural } = getThemeData();
  return (
    <>
      <button className="btn btn-danger" onClick={() => handleToggleShowClearAllAssetsModal()}>
        <span>Empty all {capitalize(namePlural)}</span>
      </button>
    </>
  );
};

export default ClearAllAssetsButton;

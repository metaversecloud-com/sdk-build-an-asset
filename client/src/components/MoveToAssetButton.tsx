import { useContext, useState } from "react";

// context
import { GlobalDispatchContext } from "@context/GlobalContext";
import { SET_ERROR } from "@/context/types";

// utils
import { backendAPI, getThemeName } from "@/utils";

export const MoveToAssetButton = ({ closeIframeAfterMove = false }: { closeIframeAfterMove?: boolean }) => {
  const dispatch = useContext(GlobalDispatchContext);
  const themeName = getThemeName();
  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false);

  const handleMoveToMyAsset = () => {
    setAreButtonsDisabled(true);

    backendAPI
      .post(`/dropped-assets/move-to`, { closeIframeAfterMove })
      .catch((error) => {
        console.error(error);
        dispatch!({
          type: SET_ERROR,
          payload: { error: "There was an error while moving to an asset" },
        });
      })
      .finally(() => {
        setAreButtonsDisabled(false);
      });
  };

  return (
    <button className="btn btn-outline" disabled={areButtonsDisabled} onClick={() => handleMoveToMyAsset()}>
      Move to {themeName}
    </button>
  );
};

export default MoveToAssetButton;

import { useContext, useState } from "react";

// context
import { GlobalDispatchContext, GlobalStateContext } from "@context/GlobalContext";
import { SET_ERROR, SET_GAME_STATE } from "@/context/types.js";

// utils
import { backendAPI, capitalize, getThemeData, getThemeName } from "@/utils";

const UNLIMITED = "unlimited";
const MAX_DROPPED_ASSETS_OPTIONS = [50, 200, 500];

export const MaxDroppedAssetsSetting = () => {
  const dispatch = useContext(GlobalDispatchContext);
  const { worldDataObject } = useContext(GlobalStateContext);

  const themeName = getThemeName();
  const { namePlural } = getThemeData();

  const savedValue = worldDataObject?.settings?.[themeName]?.maxDroppedAssets;
  const [maxDroppedAssets, setMaxDroppedAssets] = useState(savedValue ? String(savedValue) : UNLIMITED);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);

    backendAPI
      .post("/admin/settings", { maxDroppedAssets: maxDroppedAssets === UNLIMITED ? null : Number(maxDroppedAssets) })
      .then((response) => {
        dispatch!({
          type: SET_GAME_STATE,
          payload: { ...response.data, error: "" },
        });
      })
      .catch((error) => {
        console.error(error);
        dispatch!({
          type: SET_ERROR,
          payload: { error: "There was an error while updating settings" },
        });
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  return (
    <div className="mb-4">
      <label className="label" htmlFor="maxDroppedAssets">
        Max {capitalize(namePlural)} in World
      </label>
      <select
        id="maxDroppedAssets"
        className="input mb-2"
        value={maxDroppedAssets}
        onChange={(event) => setMaxDroppedAssets(event.target.value)}
        disabled={isSaving}
      >
        {MAX_DROPPED_ASSETS_OPTIONS.map((option) => (
          <option key={option} value={String(option)}>
            {option}
          </option>
        ))}
        <option value={UNLIMITED}>Unlimited</option>
      </select>
      <p className="p3 mb-2">When the max is reached, the oldest {namePlural} are removed to make room for new ones.</p>
      <button
        className="btn btn-outline mb-2"
        onClick={handleSave}
        disabled={isSaving || maxDroppedAssets === (savedValue ? String(savedValue) : UNLIMITED)}
      >
        Save
      </button>
    </div>
  );
};

export default MaxDroppedAssetsSetting;

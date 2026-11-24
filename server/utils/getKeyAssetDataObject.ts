import { DroppedAssetInterface, WorldInterface } from "@rtsdk/topia";
import { AppDataObject, Credentials } from "../types/index.js";
import { World } from "./topiaInit.js";
import { errorHandler } from "./errorHandler.js";

export const getKeyAssetUniqueName = (themeName: string) => `BuildAnAsset_keyAsset_${themeName}`;

// The SDK object the data object is read from and written to: the key asset, or the world as a fallback.
export type DataObjectEntity = Pick<DroppedAssetInterface, "fetchDataObject" | "setDataObject" | "updateDataObject"> & {
  dataObject?: unknown;
};

/**
 * Returns this theme's data object and the entity it lives on:
 * - the theme's key asset (uniqueName `BuildAnAsset_keyAsset_{themeName}`). It is found by uniqueName
 *   because the iframe may have been opened from a dropped asset or a sign rather than the key asset.
 *   If there are several, the one with the lowest id is used so every request agrees on the same one.
 * - the world, when the world has no key asset for the theme (worlds set up before key assets).
 *
 * The first time a key asset is used, that theme's entries and settings are copied to it from the
 * world data object. World data is left untouched.
 */
export const getKeyAssetDataObject = async (
  credentials: Credentials,
): Promise<{ world: WorldInterface; dataObjectEntity: DataObjectEntity; dataObject: AppDataObject; isKeyAsset: boolean }> => {
  const { themeName, urlSlug } = credentials;
  const world = World.create(urlSlug, { credentials });

  const keyAssets: DroppedAssetInterface[] = await world.fetchDroppedAssetsWithUniqueName({
    uniqueName: getKeyAssetUniqueName(themeName),
  });
  const keyAsset = [...(keyAssets || [])].sort((a, b) => String(a.id).localeCompare(String(b.id)))[0];

  if (!keyAsset) {
    await world.fetchDataObject();
    await initializeDataObject({ dataObjectEntity: world, seed: { [themeName]: {} }, themeName });
    return { world, dataObjectEntity: world, dataObject: (world.dataObject || {}) as AppDataObject, isKeyAsset: false };
  }

  await keyAsset.fetchDataObject();
  if (!(keyAsset.dataObject as AppDataObject)?.[themeName]) {
    await world.fetchDataObject();
    const worldDataObject = (world.dataObject || {}) as AppDataObject;
    const worldSettings = worldDataObject.settings?.[themeName];
    await initializeDataObject({
      dataObjectEntity: keyAsset,
      seed: {
        [themeName]: worldDataObject[themeName] || {},
        ...(worldSettings ? { settings: { [themeName]: worldSettings } } : {}),
      },
      themeName,
      lockId: `${keyAsset.id}-init-${themeName}`,
    });
  }

  return {
    world,
    dataObjectEntity: keyAsset,
    dataObject: (keyAsset.dataObject || {}) as AppDataObject,
    isKeyAsset: true,
  };
};

/**
 * Writes `seed` if the entity has no data for the theme yet, then refreshes `dataObjectEntity.dataObject`.
 * A lock failure means another request is initializing at the same time, so it is ignored.
 */
const initializeDataObject = async ({
  lockId,
  seed,
  dataObjectEntity,
  themeName,
}: {
  lockId?: string;
  seed: { [key: string]: any };
  dataObjectEntity: DataObjectEntity;
  themeName: string;
}) => {
  const dataObject = dataObjectEntity.dataObject as AppDataObject | undefined;
  if (dataObject?.[themeName]) return;

  const options = lockId ? { lock: { lockId, releaseLock: true } } : {};
  try {
    if (!dataObject || Object.keys(dataObject).length === 0) {
      await dataObjectEntity.setDataObject(seed, options);
    } else {
      const { settings, ...themeData } = seed;
      const settingsPatch = !settings
        ? {}
        : dataObject.settings
          ? { [`settings.${themeName}`]: settings[themeName] }
          : { settings };
      await dataObjectEntity.updateDataObject({ ...themeData, ...settingsPatch }, options);
    }
  } catch (error) {
    errorHandler({ error, functionName: "getKeyAssetDataObject", message: "Error initializing data object" });
  }
  await dataObjectEntity.fetchDataObject();
};

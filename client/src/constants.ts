import { InitialState } from "./context/types";
import { getS3URL } from "./utils";

export const initialState: InitialState = {
  error: "",
  hasInteractiveParams: false,
  hasSetupBackend: false,
  interactiveParams: {
    assetId: "",
    displayName: "",
    identityId: "",
    interactiveNonce: "",
    interactivePublicKey: "",
    isInteractiveIframe: false,
    ownerProfileId: "",
    profileId: "",
    sceneDropId: "",
    themeName: "",
    uniqueName: "",
    urlSlug: "",
    username: "",
    visitorId: "",
  },
  isAssetAlreadyTaken: false,
  visitorIsAdmin: false,
  worldDataObject: {},
};

export type CategoryType = {
  subcategory?: string;
  defaultImage?: string;
  imageName: string;
  variations?: string[];
};

interface ThemeDetailsInterface {
  name: string;
  namePlural: string;
  hasHomePage: boolean;
  splashImage: string;
  saveButtonText: string;
  shouldDropAsset: boolean;
  clearButtonType: string;
  showClearAssetButton: boolean;
  showEditAssetButton: boolean;
  texts: {
    header: string;
    description?: string;
    button?: string;
    alreadyHave?: string;
    chooseNew?: string;
    clearAssetButtonGeneral: string;
    clearAssetButtonAdmin: string;
    clearAssetDescription: string;
  };
}

interface ThemeType extends ThemeDetailsInterface {
  layerOrder: string[];
  categories: {
    [category: string]: {
      selectionLimits: { min: number; max: number };
      shouldStartExpanded?: boolean;
      items: CategoryType[];
    };
  };
}

type ThemesType = {
  [theme: string]: ThemeType;
};

const getDefaultTheme = (shouldDropAsset: boolean, themeName: string): ThemeDetailsInterface => {
  if (shouldDropAsset) {
    return {
      name: themeName,
      namePlural: `${themeName}s`,
      hasHomePage: false,
      splashImage: `${getS3URL()}/${themeName.toLowerCase()}/unclaimedAsset.png`,
      saveButtonText: `Add ${themeName}`,
      shouldDropAsset: true,
      clearButtonType: "pickup",
      showClearAssetButton: false,
      showEditAssetButton: true,
      texts: {
        header: `Build your ${themeName}!`,
        clearAssetButtonGeneral: `Pickup ${themeName}`,
        clearAssetButtonAdmin: `Pickup this ${themeName}`,
        clearAssetDescription: `If you pick up this ${themeName}, it will be removed from this world. A new ${themeName} can then be created.`,
      },
    };
  }
  return {
    name: themeName,
    namePlural: `${themeName}s`,
    hasHomePage: true,
    splashImage: `${getS3URL()}/${themeName.toLowerCase()}/unclaimedAsset.png`,
    saveButtonText: "Save",
    shouldDropAsset: false,
    clearButtonType: "empty",
    showClearAssetButton: true,
    showEditAssetButton: true,
    texts: {
      header: `Decorate your ${themeName}`,
      description: `Click 'Claim ${themeName}' to claim and decorate your ${themeName}. Add items to show off your style and make it your own. You can come back to update it anytime!`,
      button: `Claim ${themeName}`,
      alreadyHave: `You already have a ${themeName}!`,
      chooseNew: `To choose this one instead, click 'Empty ${themeName}' button below.`,
      clearAssetButtonGeneral: `Empty ${themeName}`,
      clearAssetButtonAdmin: `Empty this ${themeName}`,
      clearAssetDescription: `If you clear this ${themeName}, it will be emptied and unclaimed. A new ${themeName} can then be chosen.`,
    },
  };
};

export const themes: ThemesType = {
  locker: {
    ...getDefaultTheme(false, "Locker"),
    layerOrder: ["Locker Base", "Top Shelf", "Bottom Shelf", "Door"],
    categories: {
      "Locker Base": {
        selectionLimits: { min: 1, max: Infinity },
        shouldStartExpanded: true,
        items: [
          {
            subcategory: "Locker Background",
            defaultImage: "lockerBase_0.png",
            imageName: "lockerBase_0.png",
            variations: [
              "lockerBase_0.png",
              "lockerBase_1.png",
              "lockerBase_2.png",
              "lockerBase_3.png",
              "lockerBase_4.png",
              "lockerBase_5.png",
            ],
          },
          {
            subcategory: "Wallpaper",
            imageName: "wallpaper_0.png",
            variations: [
              "wallpaper_0.png",
              "wallpaper_1.png",
              "wallpaper_2.png",
              "wallpaper_3.png",
              "wallpaper_4.png",
              "wallpaper_5.png",
              "wallpaper_6.png",
            ],
          },
          {
            subcategory: "Border",
            imageName: "border_0.png",
            variations: ["border_0.png", "border_1.png", "border_2.png", "border_3.png", "border_4.png"],
          },
        ],
      },
      "Top Shelf": {
        selectionLimits: { min: 0, max: Infinity },
        items: [
          {
            subcategory: "Stack",
            imageName: "topShelf_0.png",
            variations: ["topShelf_0.png", "topShelf_1.png", "topShelf_2.png", "topShelf_3.png"],
          },
          {
            subcategory: "Light",
            imageName: "topShelf_4.png",
            variations: ["topShelf_4.png", "topShelf_5.png", "topShelf_9.png"],
          },
          {
            subcategory: "Vase",
            imageName: "topShelf_6.png",
            variations: ["topShelf_6.png", "topShelf_7.png", "topShelf_8.png"],
          },
          {
            subcategory: "Ball",
            imageName: "topShelf_10.png",
            variations: ["topShelf_10.png", "topShelf_11.png"],
          },
          {
            subcategory: "Book",
            imageName: "topShelf_12.png",
            variations: ["topShelf_12.png", "topShelf_13.png", "topShelf_14.png"],
          },
          { imageName: "topShelf_15.png" },
          { imageName: "topShelf_16.png" },
          { imageName: "topShelf_17.png" },
          { imageName: "topShelf_18.png" },
          { imageName: "topShelf_19.png" },
        ],
      },
      "Bottom Shelf": {
        selectionLimits: { min: 0, max: Infinity },
        items: [
          {
            subcategory: "Bottom Shelf Lining",
            imageName: "bottomShelf_0.png",
            variations: [
              "bottomShelf_0.png",
              "bottomShelf_2.png",
              "bottomShelf_3.png",
              "bottomShelf_4.png",
              "bottomShelf_5.png",
              "bottomShelf_6.png",
              "bottomShelf_7.png",
              "bottomShelf_8.png",
              "bottomShelf_9.png",
              "bottomShelf_10.png",
              "bottomShelf_11.png",
              "bottomShelf_12.png",
              "bottomShelf_13.png",
              "bottomShelf_14.png",
            ],
          },
          {
            subcategory: "Lunchbox",
            imageName: "bottomShelf_18.png",
            variations: [
              "bottomShelf_18.png",
              "bottomShelf_19.png",
              "bottomShelf_20.png",
              "bottomShelf_21.png",
              "bottomShelf_22.png",
              "bottomShelf_23.png",
              "bottomShelf_24.png",
              "bottomShelf_25.png",
            ],
          },
          {
            subcategory: "Large Bottle",
            imageName: "bottomShelf_26.png",
            variations: [
              "bottomShelf_26.png",
              "bottomShelf_27.png",
              "bottomShelf_28.png",
              "bottomShelf_29.png",
              "bottomShelf_30.png",
              "bottomShelf_31.png",
              "bottomShelf_32.png",
              "bottomShelf_33.png",
              "bottomShelf_34.png",
              "bottomShelf_35.png",
            ],
          },
          {
            subcategory: "Book",
            imageName: "bottomShelf_36.png",
            variations: ["bottomShelf_36.png", "bottomShelf_37.png", "bottomShelf_38.png"],
          },
          {
            subcategory: "Small Bottle",
            imageName: "bottomShelf_39.png",
            variations: [
              "bottomShelf_39.png",
              "bottomShelf_40.png",
              "bottomShelf_41.png",
              "bottomShelf_42.png",
              "bottomShelf_43.png",
              "bottomShelf_44.png",
            ],
          },
        ],
      },
      "Door": {
        selectionLimits: { min: 0, max: Infinity },
        items: [
          {
            subcategory: "Mirror",
            imageName: "door_0.png",
            variations: ["door_0.png", "door_1.png", "door_2.png", "door_3.png"],
          },
          {
            subcategory: "Note",
            imageName: "door_4.png",
            variations: ["door_4.png", "door_5.png"],
          },
          {
            subcategory: "Whiteboard",
            imageName: "door_6.png",
            variations: ["door_6.png", "door_7.png", "door_8.png", "door_9.png", "door_10.png", "door_11.png"],
          },
          { imageName: "door_12.png" },
          { imageName: "door_13.png" },
          { imageName: "door_14.png" },
          { imageName: "door_15.png" },
          { imageName: "door_16.png" },
        ],
      },
    },
  },
  desk: {
    ...getDefaultTheme(false, "Desk"),
    layerOrder: ["Ambiance Textures", "Desk Base", "Chair", "Accessories", "Computer"],
    categories: {
      "Desk Base": {
        selectionLimits: { min: 1, max: 1 },
        shouldStartExpanded: true,
        items: [
          {
            subcategory: "Desk",
            imageName: "deskBase_0.png",
            variations: [
              "deskBase_0.png",
              "deskBase_1.png",
              "deskBase_2.png",
              "deskBase_3.png",
              "deskBase_4.png",
              "deskBase_5.png",
              "deskBase_6.png",
              "deskBase_7.png",
              "deskBase_8.png",
            ],
          },
        ],
      },
      "Ambiance Textures": {
        selectionLimits: { min: 0, max: Infinity },
        items: [
          {
            subcategory: "Carpet",
            imageName: "carpet_0.png",
            variations: ["carpet_0.png", "carpet_1.png", "carpet_2.png", "carpet_3.png"],
          },
          {
            subcategory: "Wall",
            imageName: "wall_0.png",
            variations: ["wall_0.png", "wall_1.png", "wall_2.png", "wall_3.png"],
          },
        ],
      },
      "Chair": {
        selectionLimits: { min: 0, max: Infinity },
        items: [
          {
            subcategory: "Chair",
            imageName: "chair_0.png",
            variations: [
              "chair_0.png",
              "chair_1.png",
              "chair_2.png",
              "chair_3.png",
              "chair_4.png",
              "chair_5.png",
              "chair_6.png",
            ],
          },
        ],
      },
      "Accessories": {
        selectionLimits: { min: 0, max: Infinity },
        items: [
          {
            subcategory: "Small Accessory",
            imageName: "middleRight_0.png",
            variations: [
              "middleRight_0.png",
              "middleRight_1.png",
              "middleRight_2.png",
              "middleRight_3.png",
              "middleRight_4.png",
              "middleRight_5.png",
              "middleRight_6.png",
            ],
          },
          {
            subcategory: "Large Accessory",
            imageName: "right_0.png",
            variations: [
              "right_0.png",
              "right_1.png",
              "right_2.png",
              "right_3.png",
              "right_4.png",
              "right_5.png",
              "right_6.png",
              "right_7.png",
              "right_8.png",
              "right_9.png",
              "right_10.png",
              "right_11.png",
              "right_12.png",
              "right_13.png",
              "right_14.png",
              "right_15.png",
              "right_16.png",
            ],
          },
        ],
      },
      "Computer": {
        selectionLimits: { min: 0, max: Infinity },
        items: [
          {
            subcategory: "Computer",
            imageName: "computer_0.png",
            variations: [
              "computer_0.png",
              "computer_1.png",
              "computer_2.png",
              "computer_3.png",
              "computer_4.png",
              "computer_5.png",
              "computer_6.png",
            ],
          },
        ],
      },
    },
  },
  snowman: {
    ...getDefaultTheme(true, "Snowman"),
    namePlural: "Snowmen",
    layerOrder: ["Body", "Arms", "Head", "Accessories"],
    categories: {
      Body: {
        selectionLimits: { min: 1, max: 1 },
        shouldStartExpanded: true,
        items: [
          {
            subcategory: "Body",
            imageName: "body_0.png",
            variations: ["body_0.png", "body_1.png", "body_2.png"],
          },
        ],
      },
      Arms: {
        selectionLimits: { min: 0, max: 1 },
        items: [
          { imageName: "arms_0.png" },
          { imageName: "arms_1.png" },
          { imageName: "arms_2.png" },
          { imageName: "arms_3.png" },
          { imageName: "arms_4.png" },
          { imageName: "arms_5.png" },
          { imageName: "arms_6.png" },
          { imageName: "arms_7.png" },
          { imageName: "arms_8.png" },
        ],
      },
      Head: {
        selectionLimits: { min: 0, max: 1 },
        items: [
          { imageName: "head_0.png" },
          { imageName: "head_1.png" },
          { imageName: "head_2.png" },
          { imageName: "head_3.png" },
          { imageName: "head_4.png" },
          { imageName: "head_5.png" },
          { imageName: "head_6.png" },
          { imageName: "head_7.png" },
          { imageName: "head_8.png" },
        ],
      },
      Accessories: {
        selectionLimits: { min: 0, max: 1 },
        items: [
          { imageName: "accessories_0.png" },
          { imageName: "accessories_1.png" },
          { imageName: "accessories_2.png" },
          { imageName: "accessories_3.png" },
          { imageName: "accessories_4.png" },
          { imageName: "accessories_5.png" },
        ],
      },
    },
  },
  pumpkin: {
    ...getDefaultTheme(true, "Pumpkin"),
    layerOrder: ["Body", "Eyes", "Mouth"],
    categories: {
      Body: {
        selectionLimits: { min: 1, max: 1 },
        shouldStartExpanded: true,
        items: [
          {
            subcategory: "Body Style 1",
            imageName: "body_0_orange.png",
            variations: [
              "body_0_cream.png",
              "body_0_lightCyan.png",
              "body_0_mint.png",
              "body_0_orange.png",
              "body_0_orangeGreen.png",
              "body_0_orangePink.png",
              "body_0_orangePurple.png",
              "body_0_purple.png",
              "body_0_teal.png",
              "body_0_yellow.png",
            ],
          },
          {
            subcategory: "Body Style 2",
            imageName: "body_1_orange.png",
            variations: [
              "body_1_cream.png",
              "body_1_lightCyan.png",
              "body_1_mint.png",
              "body_1_orange.png",
              "body_1_orangeGreen.png",
              "body_1_orangePink.png",
              "body_1_orangePurple.png",
              "body_1_purple.png",
              "body_1_teal.png",
              "body_1_yellow.png",
            ],
          },
          {
            subcategory: "Body Style 3",
            imageName: "body_2_orange.png",
            variations: [
              "body_2_cream.png",
              "body_2_lightCyan.png",
              "body_2_mint.png",
              "body_2_orange.png",
              "body_2_orangeGreen.png",
              "body_2_orangePink.png",
              "body_2_orangePurple.png",
              "body_2_purple.png",
              "body_2_teal.png",
              "body_2_yellow.png",
            ],
          },
          {
            subcategory: "Body Style 4",
            imageName: "body_3_orange.png",
            variations: [
              "body_3_cream.png",
              "body_3_lightCyan.png",
              "body_3_mint.png",
              "body_3_orange.png",
              "body_3_orangeGreen.png",
              "body_3_orangePink.png",
              "body_3_orangePurple.png",
              "body_3_purple.png",
              "body_3_teal.png",
              "body_3_yellow.png",
            ],
          },
        ],
      },
      Eyes: {
        selectionLimits: { min: 0, max: 1 },
        items: [
          { imageName: "eyes_0.png" },
          { imageName: "eyes_1.png" },
          { imageName: "eyes_2.png" },
          { imageName: "eyes_3.png" },
          { imageName: "eyes_4.png" },
          { imageName: "eyes_5.png" },
          { imageName: "eyes_6.png" },
          { imageName: "eyes_7.png" },
        ],
      },
      Mouth: {
        selectionLimits: { min: 0, max: 1 },
        items: [
          { imageName: "mouth_0.png" },
          { imageName: "mouth_1.png" },
          { imageName: "mouth_2.png" },
          { imageName: "mouth_3.png" },
          { imageName: "mouth_4.png" },
          { imageName: "mouth_5.png" },
          { imageName: "mouth_6.png" },
        ],
      },
    },
  },
};

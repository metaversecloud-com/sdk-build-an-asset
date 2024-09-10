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
  hasVariation: boolean;
  isRequired?: boolean;
  subcategory?: string;
  imageName: string;
  variations?: string[];
};

type ThemeType = {
  name: string;
  namePlural: string;
  splashImage: string;
  saveButtonText: string;
  baseCategoryName: string;
  dropAssetInRandomLocation: boolean;
  clearButtonType: string;
  showClearAssetButton: boolean;
  showFindAssetButton: boolean;
  showEditAssetButton: boolean;
  texts: {
    header: string;
    description: string;
    button: string;
    alreadyHave: string;
    chooseNew: string;
    clearAssetButtonGeneral: string;
    clearAssetButtonAdmin: string;
    clearAssetDescription: string;
  };
  layerOrder: string[];
  categories: {
    [category: string]: CategoryType[];
  };
  selectionLimits: {
    [key: string]: number;
  };
  defaultOpenCategories: {
    [key: string]: boolean;
  };
  defaultSelected: {
    [key: string]: string[];
  };
};

type ThemesType = {
  [theme: string]: ThemeType;
};

export const themes: ThemesType = {
  locker: {
    name: "Locker",
    namePlural: "Lockers",
    splashImage: `${getS3URL()}/locker/unclaimedAsset.png`,
    saveButtonText: "Save",
    baseCategoryName: "Locker Base",
    dropAssetInRandomLocation: false,
    clearButtonType: "empty",
    showClearAssetButton: true,
    showFindAssetButton: true,
    showEditAssetButton: true,
    texts: {
      header: "Decorate your Locker",
      description:
        "Click 'Claim Locker' to claim and decorate your locker. Add items to show off your style and make it your own. You can come back to update it anytime! 🔒✨",
      button: "Claim Locker",
      alreadyHave: "You already have a locker!",
      chooseNew: "To choose this one instead, click 'Empty Locker' button below.",
      clearAssetButtonGeneral: "Empty Locker",
      clearAssetButtonAdmin: "Empty this Locker",
      clearAssetDescription:
        "If you clear this locker, it will be emptied and unclaimed. A new locker can then be chosen.",
    },
    layerOrder: ["Locker Base", "Top Shelf", "Bottom Shelf", "Door"],
    categories: {
      "Locker Base": [
        {
          hasVariation: true,
          imageName: "lockerBase_0.png",
          isRequired: true,
          subcategory: "Locker Base",
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
          hasVariation: true,
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
          hasVariation: true,
          imageName: "border_0.png",
          variations: ["border_0.png", "border_1.png", "border_2.png", "border_3.png", "border_4.png"],
        },
      ],
      "Top Shelf": [
        {
          subcategory: "Stack",
          hasVariation: true,
          imageName: "topShelf_0.png",
          variations: ["topShelf_0.png", "topShelf_1.png", "topShelf_2.png", "topShelf_3.png"],
        },
        {
          subcategory: "Light",
          hasVariation: true,
          imageName: "topShelf_4.png",
          variations: ["topShelf_4.png", "topShelf_5.png", "topShelf_9.png"],
        },
        {
          subcategory: "Vase",
          hasVariation: true,
          imageName: "topShelf_6.png",
          variations: ["topShelf_6.png", "topShelf_7.png", "topShelf_8.png"],
        },
        {
          subcategory: "Ball",
          hasVariation: true,
          imageName: "topShelf_10.png",
          variations: ["topShelf_10.png", "topShelf_11.png"],
        },
        {
          subcategory: "Book",
          hasVariation: true,
          imageName: "topShelf_0.png",
          variations: ["topShelf_12.png", "topShelf_13.png", "topShelf_14.png"],
        },
        { imageName: "topShelf_15.png", hasVariation: false },
        { imageName: "topShelf_16.png", hasVariation: false },
        { imageName: "topShelf_17.png", hasVariation: false },
        { imageName: "topShelf_18.png", hasVariation: false },
        { imageName: "topShelf_19.png", hasVariation: false },
      ],
      "Bottom Shelf": [
        {
          subcategory: "Bottom Shelf Lining",
          hasVariation: true,
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
          hasVariation: true,
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
          hasVariation: true,
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
          hasVariation: true,
          imageName: "bottomShelf_36.png",
          variations: ["bottomShelf_36.png", "bottomShelf_37.png", "bottomShelf_38.png"],
        },
        {
          subcategory: "Small Bottle",
          hasVariation: true,
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
      "Door": [
        {
          subcategory: "Mirror",
          hasVariation: true,
          imageName: "door_0.png",
          variations: ["door_0.png", "door_1.png", "door_2.png", "door_3.png"],
        },
        {
          subcategory: "Note",
          hasVariation: true,
          imageName: "door_4.png",
          variations: ["door_4.png", "door_5.png"],
        },
        {
          subcategory: "Whiteboard",
          hasVariation: true,
          imageName: "door_6.png",
          variations: ["door_6.png", "door_7.png", "door_8.png", "door_9.png", "door_10.png", "door_11.png"],
        },
        { imageName: "door_12.png", hasVariation: false },
        { imageName: "door_13.png", hasVariation: false },
        { imageName: "door_14.png", hasVariation: false },
        { imageName: "door_15.png", hasVariation: false },
        { imageName: "door_16.png", hasVariation: false },
      ],
    },
    selectionLimits: {
      "Locker Base": 1,
      "Top Shelf": Infinity,
      "Bottom Shelf": Infinity,
      "Door": Infinity,
    },
    defaultOpenCategories: {
      "Locker Base": true,
      "Wallpaper": false,
      "Border": false,
      "Top Shelf": false,
      "Bottom Shelf": false,
      "Door": false,
    },
    defaultSelected: {
      "Locker Base": [],
      "Top Shelf": [],
      "Bottom Shelf": [],
      "Door": [],
    },
  },
  desk: {
    name: "Desk",
    namePlural: "Desks",
    splashImage: `${getS3URL()}/desk/unclaimedAsset.png`,
    saveButtonText: "Save",
    baseCategoryName: "Desk Base",
    dropAssetInRandomLocation: false,
    clearButtonType: "empty",
    showClearAssetButton: true,
    showFindAssetButton: true,
    showEditAssetButton: true,
    texts: {
      header: "Decorate your Desk",
      description:
        "Click 'Claim Desk' to claim and decorate your desk. Add items to show off your style and make it your own. You can come back to update it anytime!",
      button: "Claim Desk",
      alreadyHave: "You already have a desk!",
      chooseNew: "To choose this one instead, click 'Empty Desk' button below.",
      clearAssetButtonGeneral: "Empty Desk",
      clearAssetButtonAdmin: "Empty this Desk",
      clearAssetDescription: "If you clear this desk, it will be emptied and unclaimed. A new desk can then be chosen.",
    },
    layerOrder: ["Ambiance Textures", "Desk Base", "Chair", "Accessories", "Computer"],
    categories: {
      "Desk Base": [
        {
          subcategory: "Desk",
          hasVariation: true,
          isRequired: true,
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
      "Ambiance Textures": [
        {
          subcategory: "Carpet",
          hasVariation: true,
          imageName: "carpet_0.png",
          isRequired: false,
          variations: ["carpet_0.png", "carpet_1.png", "carpet_2.png", "carpet_3.png"],
        },
        {
          subcategory: "Wall",
          hasVariation: true,
          imageName: "wall_0.png",
          isRequired: false,
          variations: ["wall_0.png", "wall_1.png", "wall_2.png", "wall_3.png"],
        },
      ],
      "Chair": [
        {
          subcategory: "Chair",
          hasVariation: true,
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
      "Accessories": [
        {
          subcategory: "Small Accessory",
          hasVariation: true,
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
          hasVariation: true,
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
      "Computer": [
        {
          subcategory: "Computer",
          hasVariation: true,
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
    selectionLimits: {
      "Desk Base": 1,
      "Ambiance Textures": Infinity,
      "Accessories": Infinity,
      "Computer": Infinity,
      "Chair": Infinity,
    },
    defaultOpenCategories: {
      "Desk Base": true,
      "Ambiance Textures": true,
      "Accessories": false,
      "Computer": false,
      "Chair": false,
    },
    defaultSelected: {
      "Desk Base": [],
      "Ambiance Textures": [],
      "Accessories": [],
      "Computer": [],
      "Chair": [],
    },
  },
  snowman: {
    name: "Snowman",
    namePlural: "Snowmen",
    splashImage: `${getS3URL()}/snowman/unclaimedAsset.png`,
    saveButtonText: "Add Snowman",
    baseCategoryName: "Body",
    dropAssetInRandomLocation: true,
    clearButtonType: "pickup",
    showClearAssetButton: false,
    showFindAssetButton: false,
    showEditAssetButton: true,
    texts: {
      header: "Build your Snowman!",
      description:
        "Click 'Claim Desk' to claim and decorate your desk. Add items to show off your style and make it your own. You can come back to update it anytime!",
      button: "Claim Desk",
      alreadyHave: "You already have a Snowman!",
      chooseNew: "To choose this one instead, click 'Empty Desk' button below.",
      clearAssetButtonGeneral: "Pickup Snowman",
      clearAssetButtonAdmin: "Pickup this Snowman",
      clearAssetDescription:
        "If you pick up this snowman, it will be removed from this world. A new snowman can then be created.",
    },
    layerOrder: ["Body", "Arms", "Head", "Accessories"],
    categories: {
      Body: [
        {
          subcategory: "Body",
          hasVariation: true,
          imageName: "body_0.png",
          isRequired: true,
          variations: ["body_0.png", "body_1.png", "body_2.png"],
        },
      ],
      Arms: [
        { imageName: "arms_0.png", hasVariation: false },
        { imageName: "arms_1.png", hasVariation: false },
        { imageName: "arms_2.png", hasVariation: false },
        { imageName: "arms_3.png", hasVariation: false },
        { imageName: "arms_4.png", hasVariation: false },
        { imageName: "arms_5.png", hasVariation: false },
        { imageName: "arms_6.png", hasVariation: false },
        { imageName: "arms_7.png", hasVariation: false },
        { imageName: "arms_8.png", hasVariation: false },
      ],
      Head: [
        { imageName: "head_0.png", hasVariation: false },
        { imageName: "head_1.png", hasVariation: false },
        { imageName: "head_2.png", hasVariation: false },
        { imageName: "head_3.png", hasVariation: false },
        { imageName: "head_4.png", hasVariation: false },
        { imageName: "head_5.png", hasVariation: false },
        { imageName: "head_6.png", hasVariation: false },
        { imageName: "head_7.png", hasVariation: false },
        { imageName: "head_8.png", hasVariation: false },
      ],
      Accessories: [
        { imageName: "accessories_0.png", hasVariation: false },
        { imageName: "accessories_1.png", hasVariation: false },
        { imageName: "accessories_2.png", hasVariation: false },
        { imageName: "accessories_3.png", hasVariation: false },
        { imageName: "accessories_4.png", hasVariation: false },
        { imageName: "accessories_5.png", hasVariation: false },
      ],
    },
    selectionLimits: {
      Body: 1,
      Arms: 1,
      Head: 1,
      Accessories: 1,
    },
    defaultOpenCategories: {
      Body: true,
      Arms: false,
      Head: false,
      Accessories: false,
    },
    defaultSelected: {
      Body: [],
      Arms: [],
      Head: [],
      Accessories: [],
    },
  },
};

// File: themeData2.js
import lockerSplashImage from "./assets/locker/splashImage.png";
import deskSplashImage from "./assets/desk/splashImage.png";

export const themes = {
  locker: {
    name: "Locker",
    splashImage: lockerSplashImage,
    saveButtonText: "Save",
    baseCategoryName: "Locker Base",
    spawnAssetInRandomLocation: false,
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
      chooseNew:
        "To choose this one instead, click 'Empty Locker' button below.",
      clearAssetButtonGeneral: "Empty Locker",
      clearAssetButtonAdmin: "Empty this Locker",
    },
    layerOrder: ["Locker Base", "Top Shelf", "Bottom Shelf", "Door"],
    categories: {
      "Locker Base": [
        {
          name: "lockerBase_0.png",
          hasVariation: true,
          isRequired: true,
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
          name: "wallpaper_0.png",
          hasVariation: true,
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
          name: "border_0.png",
          hasVariation: true,
          variations: [
            "border_0.png",
            "border_1.png",
            "border_2.png",
            "border_3.png",
            "border_4.png",
          ],
        },
      ],
      "Top Shelf": [
        {
          name: "topShelf_0.png",
          hasVariation: true,
          variations: [
            "topShelf_0.png",
            "topShelf_1.png",
            "topShelf_2.png",
            "topShelf_3.png",
          ],
        },
        {
          name: "topShelf_4.png",
          hasVariation: true,
          variations: ["topShelf_4.png", "topShelf_5.png"],
        },
        {
          name: "topShelf_6.png",
          hasVariation: true,
          variations: ["topShelf_6.png", "topShelf_7.png"],
        },
        {
          name: "topShelf_8.png",
          hasVariation: true,
          variations: ["topShelf_8.png", "topShelf_9.png"],
        },
        {
          name: "topShelf_10.png",
          hasVariation: true,
          variations: ["topShelf_10.png", "topShelf_11.png"],
        },
        {
          name: "topShelf_12.png",
          hasVariation: true,
          variations: ["topShelf_12.png", "topShelf_13.png", "topShelf_14.png"],
        },
        { name: "topShelf_15.png", hasVariation: false },
        { name: "topShelf_16.png", hasVariation: false },
        { name: "topShelf_17.png", hasVariation: false },
        { name: "topShelf_18.png", hasVariation: false },
        { name: "topShelf_19.png", hasVariation: false },
      ],
      "Bottom Shelf": [
        {
          name: "bottomShelf_0.png",
          hasVariation: true,
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
          name: "bottomShelf_18.png",
          hasVariation: true,
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
          name: "bottomShelf_26.png",
          hasVariation: true,
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
          name: "bottomShelf_36.png",
          hasVariation: true,
          variations: [
            "bottomShelf_36.png",
            "bottomShelf_37.png",
            "bottomShelf_38.png",
          ],
        },
        {
          name: "bottomShelf_39.png",
          hasVariation: true,
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
      Door: [
        {
          name: "door_0.png",
          hasVariation: true,
          variations: ["door_0.png", "door_1.png", "door_2.png", "door_3.png"],
        },
        {
          name: "door_4.png",
          hasVariation: true,
          variations: ["door_4.png", "door_5.png"],
        },
        {
          name: "door_6.png",
          hasVariation: true,
          variations: [
            "door_6.png",
            "door_7.png",
            "door_8.png",
            "door_9.png",
            "door_10.png",
            "door_11.png",
          ],
        },
        { name: "door_12.png", hasVariation: false },
        { name: "door_13.png", hasVariation: false },
        { name: "door_14.png", hasVariation: false },
        { name: "door_15.png", hasVariation: false },
        { name: "door_16.png", hasVariation: false },
      ],
    },
    selectionLimits: {
      "Locker Base": 1,
      "Top Shelf": Infinity,
      "Bottom Shelf": Infinity,
      Door: Infinity,
    },
    defaultOpenCategories: {
      "Locker Base": true,
      Wallpaper: false,
      Border: false,
      "Top Shelf": false,
      "Bottom Shelf": false,
      Door: false,
    },
    defaultSelected: {
      "Locker Base": [],
      "Top Shelf": [],
      "Bottom Shelf": [],
      Door: [],
    },
  },
  desk: {
    name: "Desk",
    splashImage: deskSplashImage,
    saveButtonText: "Save",
    baseCategoryName: "Desk Base",
    spawnAssetInRandomLocation: false,
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
    },
    layerOrder: [
      "Ambiance Textures",
      "Desk Base",
      "Chair",
      "Accessories",
      "Computer",
    ],
    categories: {
      "Desk Base": [
        {
          name: "deskBase_0.png",
          hasVariation: true,
          isRequired: true,
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
          name: "carpet_0.png",
          hasVariation: true,
          isRequired: false,
          variations: [
            "carpet_0.png",
            "carpet_1.png",
            "carpet_2.png",
            "carpet_3.png",
          ],
        },
        {
          name: "wall_0.png",
          hasVariation: true,
          isRequired: false,
          variations: ["wall_0.png", "wall_1.png", "wall_2.png", "wall_3.png"],
        },
      ],
      Chair: [
        {
          name: "chair_0.png",
          hasVariation: true,
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
      Accessories: [
        {
          name: "middleRight_0.png",
          hasVariation: true,
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
          name: "right_0.png",
          hasVariation: true,
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
      Computer: [
        {
          name: "computer_0.png",
          hasVariation: true,
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
      Accessories: Infinity,
      Computer: Infinity,
      Chair: Infinity,
    },
    defaultOpenCategories: {
      "Desk Base": true,
      "Ambiance Textures": true,
      Accessories: false,
      Computer: false,
      Chair: false,
    },
    defaultSelected: {
      "Desk Base": [],
      "Ambiance Textures": [],
      Accessories: [],
      Computer: [],
      Chair: [],
    },
  },
  snowman: {
    name: "Snowman",
    splashImage: deskSplashImage,
    saveButtonText: "Add Snowman",
    baseCategoryName: "Body",
    spawnAssetInRandomLocation: true,
    clearButtonType: "pickup",
    showClearAssetButton: true,
    showFindAssetButton: false,
    showEditAssetButton: false,
    texts: {
      header: "Build your Snowman!",
      description:
        "Click 'Claim Desk' to claim and decorate your desk. Add items to show off your style and make it your own. You can come back to update it anytime!",
      button: "Claim Desk",
      alreadyHave: "You already have a Snowman!",
      chooseNew: "To choose this one instead, click 'Empty Desk' button below.",
      clearAssetButtonGeneral: "Pickup Snowman",
      clearAssetButtonAdmin: "Pickup this Snowman",
    },
    layerOrder: ["Body", "Arms", "Head", "Accessories"],
    categories: {
      Body: [
        {
          name: "body_0.png",
          hasVariation: true,
          isRequired: true,
          variations: ["body_0.png", "body_1.png", "body_2.png"],
        },
      ],
      Arms: [
        { name: "arms_0.png", hasVariation: false },
        { name: "arms_1.png", hasVariation: false },
        { name: "arms_2.png", hasVariation: false },
        { name: "arms_3.png", hasVariation: false },
        { name: "arms_4.png", hasVariation: false },
        { name: "arms_5.png", hasVariation: false },
        { name: "arms_6.png", hasVariation: false },
        { name: "arms_7.png", hasVariation: false },
        { name: "arms_8.png", hasVariation: false },
      ],
      Head: [
        { name: "head_0.png", hasVariation: false },
        { name: "head_1.png", hasVariation: false },
        { name: "head_2.png", hasVariation: false },
        { name: "head_3.png", hasVariation: false },
        { name: "head_4.png", hasVariation: false },
        { name: "head_5.png", hasVariation: false },
        { name: "head_6.png", hasVariation: false },
        { name: "head_7.png", hasVariation: false },
        { name: "head_8.png", hasVariation: false },
      ],
      Accessories: [
        { name: "accessories_0.png", hasVariation: false },
        { name: "accessories_1.png", hasVariation: false },
        { name: "accessories_2.png", hasVariation: false },
        { name: "accessories_3.png", hasVariation: false },
        { name: "accessories_4.png", hasVariation: false },
        { name: "accessories_5.png", hasVariation: false },
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

export const getThemeData = () => {
  const pathname = window.location.pathname;
  const themeName = pathname.split("/")[1];
  return themes?.[themeName] || null;
};

export const getThemeNames = () => {
  return Object.keys(themes);
};

export const getThemeName = () => {
  const pathname = window.location.pathname;
  const themeName = pathname.split("/")[1];
  return themeName;
};

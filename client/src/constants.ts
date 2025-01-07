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
  splashImageSize: number;
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
  topLayerOrder: string[];
  bottomLayerOrder?: string[];
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
      splashImageSize: 100,
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
    splashImageSize: 100,
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
    topLayerOrder: ["Locker Base", "Top Shelf", "Bottom Shelf", "Door"],
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
    topLayerOrder: ["Desk", "Desk Accessories", "Computers", "Chair", "Floor Accessories", "Banners"],
    bottomLayerOrder: ["Wall", "Floor", "Wall Decor", "Floor Lamp"],
    categories: {
      "Wall": {
        selectionLimits: { min: 1, max: 1 },
        items: [
          {
            subcategory: "Wall",
            imageName: "wallBeige.png",
            variations: [
              "wallBeige.png",
              "wallBlue.png",
              "wallBluePlaid.png",
              "wallBrown.png",
              "wallDarkPlaid.png",
              "wallDarkRedMarble.png",
              "wallGlassTiles.png",
              "wallGreen.png",
              "wallGrey.png",
              "wallMerlot.png",
              "wallOrange.png",
              "wallOrangeMarble.png",
              "wallOrangePlaid.png",
              "wallPurple.png",
              "wallRed.png",
              "wallRedMarble.png",
              "wallSand.png",
              "wallTeal.png",
              "wallViolet.png",
              "wallYellowPlaid.png",
            ],
          },
        ],
      },
      "Floor": {
        selectionLimits: { min: 1, max: 1 },
        items: [
          {
            subcategory: "Floor",
            imageName: "floorCarpetBlue.png",
            variations: [
              "floorCarpetBlue.png",
              "floorCarpetRed.png",
              "floorCarpetStripedBlueGreen.png",
              "floorCarpetStripedGreen.png",
              "floorCarpetStripedOrange.png",
              "floorCarpetStripedViolet.png",
              "floorPatternSprinklesBlue.png",
              "floorPatternSprinklesGreen.png",
              "floorPatternSprinklesPink.png",
              "floorPatternWavyBlue.png",
              "floorPatternWavyGreen.png",
              "floorPatternWavyMauve.png",
              "floorPatternWavyMustard.png",
              "floorSolidBlue.png",
              "floorSolidConcretePink.png",
              "floorSolidConcreteViolet.png",
              "floorSolidConcreteYellow.png",
              "floorSolidCream.png",
              "floorSolidMustard.png",
              "floorSolidTan.png",
              "floorSolidTerra.png",
              "floorTileBlue.png",
              "floorTileCream.png",
              "floorTileMustard.png",
              "floorTileOrange.png",
              "floorWoodHorizontalBeige.png",
              "floorWoodHorizontalBrown.png",
              "floorWoodHorizontalYellow.png",
              "floorWoodVerticalBrown.png",
              "floorWoodVerticalPink.png",
              "floorWoodVerticalTan.png",
            ],
          },
        ],
      },
      "Wall Decor": {
        selectionLimits: { min: 0, max: Infinity },
        items: [
          {
            subcategory: "Gallery",
            imageName: "wallDecorGallery1.png",
            variations: [
              "wallDecorGallery1.png",
              "wallDecorGallery2.png",
              "wallDecorGallery3.png",
              "wallDecorGallery4.png",
              "wallDecorGalleryArt1.png",
              "wallDecorGalleryArt2.png",
              "wallDecorGalleryCalendarSuncatcher.png",
              "wallDecorGalleryChalkboard.png",
              "wallDecorGalleryClockChalkboard.png",
              "wallDecorGalleryCrochetRainbow.png",
            ],
          },
          {
            subcategory: "Organizer",
            imageName: "wallDecorOrganizerCalendar.png",
            variations: [
              "wallDecorOrganizerCalendar.png",
              "wallDecorOrganizerFrames.png",
              "wallDecorOrganizerRed.png",
              "wallDecorOrganizerRed2.png",
              "wallDecorOrganizerRed3.png",
              "wallDecorOrganizerTeal.png",
              "wallDecorOrganizerTeal2.png",
              "wallDecorOrganizerTeal3.png",
              "wallDecorOrganizerYellow1.png",
              "wallDecorOrganizerYellow2.png",
              "wallDecorOrganizerYellow3.png",
            ],
          },
          {
            subcategory: "Plant",
            imageName: "wallDecorPlant1.png",
            variations: [
              "wallDecorPlant1.png",
              "wallDecorPlant2.png",
              "wallDecorPlantIvy.png",
              "wallDecorPlantLushIvy.png",
            ],
          },
        ],
      },
      "Floor Lamp": {
        selectionLimits: { min: 0, max: 1 },
        items: [
          {
            subcategory: "Floor Lamp",
            imageName: "floorAccessoryLamp1.png",
            variations: [
              "floorAccessoryLamp1.png",
              "floorAccessoryLamp2.png",
              "floorAccessoryLamp3.png",
              "floorAccessoryLamp4.png",
            ],
          },
        ],
      },
      "Desk": {
        selectionLimits: { min: 1, max: 1 },
        items: [
          {
            subcategory: "Desk",
            imageName: "deskLshapeA1.png",
            variations: [
              "deskLshapeA1.png",
              "deskLshapeA2.png",
              "deskLshapeA3.png",
              "deskLshapeA4.png",
              "deskLshapeA5.png",
              "deskLshapeB1Beige.png",
              "deskLshapeB2Green.png",
              "deskLshapeB3Navy.png",
              "deskLshapeB4Red.png",
              "deskLshapeC1.png",
              "deskLshapeC2.png",
              "deskLshapeC3.png",
              "deskLshapeD1.png",
              "deskLshapeD2.png",
              "deskLshapeD3.png",
              "deskLshapeE1.png",
              "deskLshapeE2.png",
              "deskLshapeFBeige.png",
              "deskRegularBeech.png",
              "deskRegularBeige.png",
              "deskRegularBlue.png",
              "deskRegularDarkBlue.png",
              "deskRegularOak.png",
              "deskRegularWalnut.png",
              "deskStorageBlack.png",
              "deskStorageElectricBlue.png",
              "deskStorageLightBlue.png",
              "deskStorageOak.png",
              "deskStoragePine.png",
              "deskStorageYellow.png",
            ],
          },
        ],
      },
      "Desk Accessories": {
        selectionLimits: { min: 0, max: Infinity },
        items: [
          {
            subcategory: "Desk Left",
            imageName: "deskAccessoryLeftBalloons.png",
            variations: [
              "deskAccessoryLeftBalloons.png",
              "deskAccessoryLeftBobaTea.png",
              "deskAccessoryLeftBooks.png",
              "deskAccessoryLeftBooks2.png",
              "deskAccessoryLeftBoombox1.png",
              "deskAccessoryLeftBoombox2.png",
              "deskAccessoryLeftBottle.png",
              "deskAccessoryLeftBowlingPins.png",
              "deskAccessoryLeftBurger.png",
              "deskAccessoryLeftCake.png",
              "deskAccessoryLeftCauldron.png",
              "deskAccessoryLeftExcavator.png",
              "deskAccessoryLeftGift.png",
              "deskAccessoryLeftGift2.png",
              "deskAccessoryLeftGlobe1.png",
              "deskAccessoryLeftGlobe2.png",
              "deskAccessoryLeftLamp1.png",
              "deskAccessoryLeftLamp2.png",
              "deskAccessoryLeftLamp3.png",
              "deskAccessoryLeftLamp4.png",
              "deskAccessoryLeftLamp5.png",
              "deskAccessoryLeftLamp6.png",
              "deskAccessoryLeftLavaLamp.png",
              "deskAccessoryLeftNotes.png",
              "deskAccessoryLeftPencils.png",
              "deskAccessoryLeftPlant1.png",
              "deskAccessoryLeftPlants.png",
              "deskAccessoryLeftSnowglobe.png",
              "deskAccessoryLeftSnowman.png",
            ],
          },
          {
            subcategory: "Desk Middle",
            imageName: "deskAccessoryMiddle1.png",
            variations: [
              "deskAccessoryMiddle1.png",
              "deskAccessoryMiddle2.png",
              "deskAccessoryMiddle3.png",
              "deskAccessoryMiddle4.png",
              "deskAccessoryMiddle5.png",
              "deskAccessoryMiddle6.png",
              "deskAccessoryMiddle7.png",
              "deskAccessoryMiddle8.png",
              "deskAccessoryMiddle9.png",
              "deskAccessoryMiddle10.png",
            ],
          },
          {
            subcategory: "Desk Right",
            imageName: "deskAccessoryRight1.png",
            variations: [
              "deskAccessoryRight1.png",
              "deskAccessoryRight2.png",
              "deskAccessoryRight3.png",
              "deskAccessoryRight4.png",
              "deskAccessoryRight5.png",
              "deskAccessoryRight6.png",
              "deskAccessoryRight7.png",
              "deskAccessoryRight8.png",
              "deskAccessoryRight9.png",
              "deskAccessoryRight10.png",
              "deskAccessoryRight11.png",
              "deskAccessoryRight12.png",
              "deskAccessoryRight13.png",
              "deskAccessoryRight14.png",
              "deskAccessoryRight15.png",
            ],
          },
        ],
      },
      "Computers": {
        selectionLimits: { min: 0, max: Infinity },
        items: [
          {
            subcategory: "Computers Left",
            imageName: "computerLeftLaptop1.png",
            variations: [
              "computerLeftLaptop1.png",
              "computerLeftLaptop2.png",
              "computerLeftRetro1.png",
              "computerLeftRetro2.png",
              "computerLeftRetro3.png",
              "computerLeftRetro4.png",
              "computerLeftRetro5.png",
              "computerLeftRetro6.png",
              "computerLeftRetro7.png",
              "computerLeftRetro8.png",
              "computerLeftTablet.png",
            ],
          },
          {
            subcategory: "Computers Right",
            imageName: "computerRightDesktop2.png",
            variations: [
              "computerRightDesktop2.png",
              "computerRightDesktop3.png",
              "computerRightDesktop4.png",
              "computerRightDesktop5.png",
              "computerRightDesktop6.png",
              "computerRightLaptop1.png",
              "computerRightLaptop2.png",
              "computerRightMonitor.png",
              "computerRightMonitor2.png",
              "computerRightMonitorWideSceen.png",
            ],
          },
        ],
      },
      "Chair": {
        selectionLimits: { min: 0, max: Infinity },
        items: [
          {
            subcategory: "Chairs",
            imageName: "chairBluePurple.png",
            variations: [
              "chairBluePurple.png",
              "chairCandyGreen.png",
              "chairElectricBlue.png",
              "chairExecutive1.png",
              "chairExecutive2.png",
              "chairExecutive3.png",
              "chairExecutive4.png",
              "chairGamer.png",
              "chairPurple.png",
              "chairPurpleBlue.png",
              "chairPurpleNatural.png",
              "chairStool.png",
            ],
          },
        ],
      },
      "Floor Accessories": {
        selectionLimits: { min: 0, max: Infinity },
        items: [
          {
            subcategory: "Floor Left",
            imageName: "floorAccessoryLeftBackpack1.png",
            variations: [
              "floorAccessoryLeftBackpack1.png",
              "floorAccessoryLeftBackpack2.png",
              "floorAccessoryLeftBackpack3.png",
              "floorAccessoryLeftBackpack4.png",
              "floorAccessoryLeftPlant1.png",
              "floorAccessoryLeftPlant2.png",
              "floorAccessoryLeftPlant3.png",
              "floorAccessoryLeftPlant4.png",
            ],
          },
          {
            subcategory: "Floor Right",
            imageName: "floorAccessoryRightPlant3.png",
            variations: ["floorAccessoryRightPlant3.png", "floorAccessoryRightSoccerBall.png"],
          },
        ],
      },
      "Banners": {
        selectionLimits: { min: 0, max: Infinity },
        items: [
          {
            subcategory: "Banners",
            imageName: "bannerBalloons.png",
            variations: [
              "bannerBalloons.png",
              "bannerBirthday1.png",
              "bannerBirthday2.png",
              "bannerPennant1.png",
              "bannerPennant2.png",
              "bannerPennant3.png",
              "bannerPuffs4.png",
              "bannerShield.png",
              "bannerStringLights1.png",
              "bannerStringLights2.png",
              "signDoNotDisturb1.png",
              "signDoNotDisturb2.png",
              "signDoNotDisturb3.png",
            ],
          },
        ],
      },
    },
  },
  snowman: {
    ...getDefaultTheme(true, "Snowman"),
    namePlural: "Snowmen",
    topLayerOrder: ["Body", "Arms", "Head", "Accessories"],
    splashImageSize: 180,
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
    topLayerOrder: ["Body", "Eyes", "Mouth"],
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

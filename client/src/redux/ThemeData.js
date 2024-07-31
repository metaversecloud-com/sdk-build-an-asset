export const categories = {
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
};

export const selectionLimits = {
  "Locker Base": 1,
  "Top Shelf": Infinity,
  "Bottom Shelf": Infinity,
  Door: Infinity,
};

export const defaultOpenCategories = {
  "Locker Base": true,
  Wallpaper: false,
  Border: false,
  "Top Shelf": false,
  "Bottom Shelf": false,
  Door: false,
};

export const defaultSelected = {
  "Locker Base": [],
  "Top Shelf": [],
  "Bottom Shelf": [],
  Door: [],
};

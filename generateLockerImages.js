import sharp from "sharp";
import path from "path";

const assets = {
  lockerBase: [
    "lockerBase_0.png",
    "lockerBase_1.png",
    "lockerBase_2.png",
    "lockerBase_3.png",
  ],
  wallpaper: [
    "wallpaper_0.png",
    "wallpaper_1.png",
    "wallpaper_2.png",
    "wallpaper_3.png",
    "wallpaper_4.png",
    "wallpaper_5.png",
    "wallpaper_6.png",
    "wallpaper_7.png",
    "wallpaper_8.png",
  ],
  topShelf: [
    "topShelf_0.png",
    "topShelf_1.png",
    "topShelf_2.png",
    "topShelf_4.png",
    "topShelf_5.png",
    "topShelf_6.png",
    "topShelf_7.png",
    "topShelf_8.png",
  ],
  bottomShelf: [
    "bottomShelf_0.png",
    "bottomShelf_1.png",
    "bottomShelf_2.png",
    "bottomShelf_3.png",
    "bottomShelf_4.png",
    "bottomShelf_5.png",
    "bottomShelf_6.png",
    "bottomShelf_7.png",
    "bottomShelf_8.png",
  ],
  door: [
    "door_0.png",
    "door_1.png",
    "door_2.png",
    "door_3.png",
    "door_4.png",
    "door_5.png",
    "door_6.png",
    "door_7.png",
    "door_8.png",
  ],
};

const createLocker = async (images, outputName) => {
  try {
    const buffers = await Promise.all(
      images.map((img) => sharp(img).toBuffer())
    );

    const image = sharp(buffers[0]).composite(
      buffers.slice(1).map((buffer, i) => ({ input: buffer }))
    );

    await image.toFile(
      path.join("./client/public/assets/locker/output", `${outputName}.png`)
    );

    await image.toFile(
      path.join("./client/src/assets/locker/output", `${outputName}.png`)
    );

    console.log(`Created ${outputName}.png in both directories`);
  } catch (err) {
    console.error(err);
  }
};

const main = async () => {
  for (let lockerBase of assets.lockerBase) {
    for (let wallpaper of assets.wallpaper) {
      for (let topShelf of assets.topShelf) {
        for (let bottomShelf of assets.bottomShelf) {
          for (let door of assets.door) {
            const imagesToMerge = [
              `./client/public/assets/locker/${lockerBase}`,
              `./client/public/assets/locker/${wallpaper}`,
              `./client/public/assets/locker/${topShelf}`,
              `./client/public/assets/locker/${bottomShelf}`,
              `./client/public/assets/locker/${door}`,
            ];
            const outputName =
              `${lockerBase}_${wallpaper}_${topShelf}_${bottomShelf}_${door}`.replace(
                /\.png/g,
                ""
              );
            await createLocker(imagesToMerge, outputName);
          }
        }
      }
    }
  }
};

main();
